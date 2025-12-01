

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
import httpx
import datetime

from . import schemas, crud
from .db import get_db, init_db
from .security import create_access_token
from .deps import get_current_user
from .rag_simples import get_context_for_query

router = APIRouter()


@router.on_event("startup")
def startup_event():
    # Ensure DB tables exist
    init_db()
    # Inicializa RAG simples
    from .rag_simples import initialize_rag
    initialize_rag()


@router.post("/auth/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in.username, user_in.email, user_in.password)
    return user


@router.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = datetime.timedelta(minutes=60)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


# Alias para compatibilidade com frontend
@router.post("/token", response_model=schemas.Token)
def token_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return login_for_access_token(form_data, db)


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/chat/public", response_model=schemas.ChatResponse)
async def chat_public(req: schemas.ChatRequest, db: Session = Depends(get_db)):
    """
    Public endpoint para testar o chat sem autenticação.
    Ideal para testes e demo do frontend.
    """
    # Criar chat anônimo (user_id = -1)
    anonymous_user_id = -1
    
    # Recuperar contexto do RAG
    rag_context = get_context_for_query(req.message, k=5)
    
    # Preparar mensagem para Groq
    groq_messages = [
        {"role": "user", "content": req.message}
    ]

    # Chamar Groq API
    GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    # Incluir contexto RAG na system prompt
    system_message = """Você é um assistente especializado em informações sobre o vestibular da UTFPR.
Responda com base no contexto fornecido sobre o vestibular da UTFPR.
Se não souber a resposta baseado no contexto, diga que não tem essas informações.

Contexto da UTFPR:
"""
    if rag_context:
        system_message += f"\n{rag_context}"

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_message},
            *groq_messages,
        ],
        "max_tokens": 512,
        "temperature": 0.7,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }

    try:
        async with httpx.AsyncClient() as client:
            groq_resp = await client.post(GROQ_API_URL, json=body, headers=headers)
        if groq_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Groq API error: {groq_resp.text}")
        
        groq_data = groq_resp.json()
        # Extract reply from Groq response
        try:
            reply = groq_data["choices"][0]["message"]["content"]
        except Exception:
            reply = "[Error: Unexpected Groq response format]"
        
        return schemas.ChatResponse(
            chat_id=-1,
            reply=reply,
            message_id=-1
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Error connecting to Groq API: {str(e)}")


@router.get("/chats", response_model=list[schemas.ChatOut])
def list_chats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista todos os chats do usuário."""
    chats = crud.get_user_chats(db, current_user.id)
    return chats


@router.get("/chats/{chat_id}", response_model=schemas.ChatOut)
def get_chat(chat_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Recupera um chat específico com todo o histórico."""
    chat = crud.get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.post("/chat", response_model=schemas.ChatResponse)
async def chat_endpoint(req: schemas.ChatRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para enviar mensagem com RAG.
    Se chat_id não for fornecido, cria um novo chat.
    """
    # Criar novo chat ou usar existente
    if req.chat_id:
        chat = crud.get_chat(db, req.chat_id, current_user.id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        # Cria novo chat
        chat = crud.create_chat(db, current_user.id)

    # Salvar mensagem do usuário
    user_message = crud.add_message(db, chat.id, "user", req.message)

    # Recuperar histórico de mensagens para contexto
    messages = crud.get_chat_messages(db, chat.id)
    
    # NOVO: Recuperar contexto do RAG
    rag_context = get_context_for_query(req.message, k=5)
    
    # Preparar mensagens para Groq (incluindo histórico)
    groq_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]

    # Chamar Groq API
    GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    # NOVO: Incluir contexto RAG na system prompt
    system_message = """Você é um assistente especializado em informações sobre o vestibular da UTFPR.
Responda com base no contexto fornecido sobre o vestibular da UTFPR.
Se não souber a resposta baseado no contexto, diga que não tem essas informações.

Contexto da UTFPR:
"""
    if rag_context:
        system_message += f"\n{rag_context}"

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_message},
            *groq_messages,
        ],
        "max_tokens": 512,
        "temperature": 0.7,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }

    try:
        async with httpx.AsyncClient() as client:
            groq_resp = await client.post(GROQ_API_URL, json=body, headers=headers)
        if groq_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Groq API error: {groq_resp.text}")
        
        groq_data = groq_resp.json()
        # Extract reply from Groq response
        try:
            reply = groq_data["choices"][0]["message"]["content"]
        except Exception:
            reply = "[Error: Unexpected Groq response format]"
        
        # Salvar resposta do assistente
        assistant_message = crud.add_message(db, chat.id, "assistant", reply)
        
        return schemas.ChatResponse(
            chat_id=chat.id,
            reply=reply,
            message_id=assistant_message.id
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Error connecting to Groq API: {str(e)}")


@router.get("/health")
def health():
    return {"status": "ok"}
