from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .db import init_db
from .routes import upload, verify, heal, chat, override, reset

app = FastAPI(title="ValiDossier Gatekeeper", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload.router)
app.include_router(verify.router)
app.include_router(heal.router)
app.include_router(chat.router)
app.include_router(override.router)
app.include_router(reset.router)


@app.on_event("startup")
def startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "healthy"}
