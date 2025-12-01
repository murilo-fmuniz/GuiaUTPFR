import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .rag_simples import initialize_rag

app = FastAPI(title="Chatbot API with Auth")

# CORS Configuration - Accept all origins for now
# In production, restrict to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS configured to accept all origins (*)")

app.include_router(api_router)

@app.on_event("startup")
def startup():
    """Inicializa RAG na startup"""
    initialize_rag()

