import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .rag_simples import initialize_rag

app = FastAPI(title="Chatbot API with Auth")

# Allow requests from the frontend (adjust in production)
cors_origins = os.getenv("CORS_ORIGINS", "https://guia-utpfr.vercel.app,http://localhost:5173,http://localhost:3000")

# Debug log
print(f"CORS_ORIGINS env: {cors_origins}")

if cors_origins == "*":
    allow_origins = ["*"]
    allow_origin_regex = None
else:
    origins_list = [origin.strip() for origin in cors_origins.split(",")]
    allow_origins = origins_list
    # Also allow any vercel.app subdomain for flexibility
    allow_origin_regex = r"https://.*\.vercel\.app"
    print(f"Allowed origins: {allow_origins}")
    print(f"Allow origin regex: {allow_origin_regex}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup():
    """Inicializa RAG na startup"""
    initialize_rag()

