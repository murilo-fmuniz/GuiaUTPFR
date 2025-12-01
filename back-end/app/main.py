import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .rag_simples import initialize_rag

app = FastAPI(title="Chatbot API with Auth")

# CORS - MUST be added FIRST before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins
    allow_credentials=False,  # Important: False when using wildcard
    allow_methods=["*"],  # Allow ALL methods
    allow_headers=["*"],  # Allow ALL headers
    expose_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup():
    """Inicializa RAG na startup"""
    print("🚀 API starting up...")
    initialize_rag()
    print("✅ API ready!")

