import os

DATABASE_PATH = os.environ.get("DATABASE_PATH", "/app/validossier.db")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-lite"
MAX_HEALING_ITERATIONS = 3
CORS_ORIGINS = ["*"]
DATA_DIR = "/data"
