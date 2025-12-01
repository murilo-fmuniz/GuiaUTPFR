import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .rag_simples import initialize_rag

app = FastAPI(title="Chatbot API with Auth")

# Allow requests from the frontend (adjust in production)
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

# Debug log
print(f"CORS_ORIGINS env: {cors_origins}")
print(f"Allowed origins: {allow_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup():
    """Inicializa RAG na startup"""
    initialize_rag()

