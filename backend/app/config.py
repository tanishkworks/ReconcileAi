import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or root directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

MORSE_API_KEY = os.getenv("MORSE_API_KEY", "")
MORSE_ENDPOINT = os.getenv("MORSE_ENDPOINT", "https://api.morsehq.dev/api/v1/traces/batch")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "reconcile_ledger.db"))
AGENT_NAME = "invoice-reconciliation-agent"
AGENT_VERSION = "1.0.0"
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
