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

# Supabase PostgreSQL & PostgREST configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fiwopzoouydsigskibfz.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd29wem9vdXlkc2lnc2tpYmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNDA4NzMsImV4cCI6MjEwOTYxNjg3M30.bmTiQcuWarCV7vI51lcxo8vXiOtACNJmCnHfayPCjL4")
