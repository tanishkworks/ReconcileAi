import os
import uuid
import time
import logging
from typing import Optional, Dict, Any, List
from contextlib import contextmanager

from app.config import (
    MORSE_API_KEY,
    MORSE_ENDPOINT,
    AGENT_NAME,
    AGENT_VERSION,
    ENVIRONMENT
)

logger = logging.getLogger("reconcile_ai.telemetry")

# Token pricing rates (GPT-4o-mini baseline for enterprise telemetry evaluation)
INPUT_TOKEN_RATE = 0.15 / 1_000_000   # $0.15 per 1M tokens
OUTPUT_TOKEN_RATE = 0.60 / 1_000_000  # $0.60 per 1M tokens

_morse_initialized = False

def init_morse():
    global _morse_initialized
    if MORSE_API_KEY and MORSE_API_KEY.strip():
        try:
            import morse_ai
            morse_ai.init(
                api_key=MORSE_API_KEY.strip(),
                endpoint=MORSE_ENDPOINT,
                agent_version=AGENT_VERSION,
                flush_interval=1.0
            )
            _morse_initialized = True
            logger.info("Morse SDK successfully initialized with live ingestion endpoint: %s", MORSE_ENDPOINT)
        except Exception as e:
            logger.warning("Failed to initialize Morse SDK: %s. Falling back to local telemetry mirror.", e)
            _morse_initialized = False
    else:
        logger.info("No MORSE_API_KEY configured. Operating with local SQLite telemetry mirror.")
        _morse_initialized = False

def is_morse_active() -> bool:
    return _morse_initialized

class LocalSpan:
    def __init__(self, name: str, span_type: str = "custom", input_data: Any = None):
        self.span_id = f"span_{uuid.uuid4().hex[:12]}"
        self.name = name
        self.span_type = span_type
        self.input_data = input_data
        self.output_data = None
        self.start_time = 0.0
        self.end_time = 0.0
        self.duration_ms = 0.0
        self.status = "ok"
        self.tokens = 0
        self.morse_span_ctx = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        if _morse_initialized:
            try:
                import morse_ai
                self.morse_span_ctx = morse_ai.span(name=self.name, span_type=self.span_type, input_data=self.input_data)
                self.morse_span_ctx.__enter__()
            except Exception as e:
                logger.debug("Morse span error: %s", e)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.duration_ms = round((self.end_time - self.start_time) * 1000, 2)
        if exc_type is not None:
            self.status = "error"
        if self.morse_span_ctx:
            try:
                self.morse_span_ctx.__exit__(exc_type, exc_val, exc_tb)
            except Exception as e:
                logger.debug("Morse span exit error: %s", e)
        return False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "span_id": self.span_id,
            "name": self.name,
            "span_type": self.span_type,
            "duration_ms": self.duration_ms,
            "status": self.status,
            "tokens": self.tokens,
            "input": str(self.input_data) if self.input_data else None,
            "output": str(self.output_data) if self.output_data else None,
        }

class TelemetryTraceContext:
    def __init__(self, invoice_id: str, agent_name: str = AGENT_NAME):
        self.trace_id = f"tr_{uuid.uuid4().hex[:16]}"
        self.invoice_id = invoice_id
        self.agent_name = agent_name
        self.spans: List[LocalSpan] = []
        self.outcome: Optional[str] = None
        self.success: Optional[bool] = None
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.retry_tokens = 0
        self.start_time = 0.0
        self.end_time = 0.0
        self.latency_ms = 0.0
        self._morse_run_ctx = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        if _morse_initialized:
            try:
                import morse_ai
                self._morse_run_ctx = morse_ai.run(
                    agent_name=self.agent_name,
                    thread_id=self.invoice_id,
                    user_metadata={"env": ENVIRONMENT, "invoice_id": self.invoice_id},
                    record_keys={"invoice_id": self.invoice_id},
                    agent_version=AGENT_VERSION
                )
                self._morse_run_ctx.__enter__()
            except Exception as e:
                logger.debug("Morse run error: %s", e)
        return self

    @property
    def cost_usd(self) -> float:
        total_prompt = self.prompt_tokens + self.retry_tokens
        return round(
            (total_prompt * INPUT_TOKEN_RATE) + (self.completion_tokens * OUTPUT_TOKEN_RATE),
            6
        )

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.latency_ms = round((self.end_time - self.start_time) * 1000, 2)

        if self._morse_run_ctx:
            try:
                if self.outcome and self.success is not None:
                    import morse_ai
                    morse_ai.set_outcome(success=self.success, outcome=self.outcome)
                    morse_ai.flush()
                self._morse_run_ctx.__exit__(exc_type, exc_val, exc_tb)
            except Exception as e:
                logger.debug("Morse run exit error: %s", e)
        return False

    @contextmanager
    def create_span(self, name: str, span_type: str = "custom", input_data: Any = None):
        span = LocalSpan(name, span_type=span_type, input_data=input_data)
        with span:
            self.spans.append(span)
            yield span

    def set_outcome(self, success: bool, outcome: str):
        self.success = success
        self.outcome = outcome
        if _morse_initialized:
            try:
                import morse_ai
                morse_ai.set_outcome(success=success, outcome=outcome)
            except Exception as e:
                logger.debug("Morse set_outcome error: %s", e)

    def record_tokens(self, prompt: int, completion: int, retry: int = 0):
        self.prompt_tokens += prompt
        self.completion_tokens += completion
        self.retry_tokens += retry

    def get_summary(self) -> Dict[str, Any]:
        total_tokens = self.prompt_tokens + self.completion_tokens + self.retry_tokens
        return {
            "trace_id": self.trace_id,
            "invoice_id": self.invoice_id,
            "agent_name": self.agent_name,
            "outcome": self.outcome or "unspecified",
            "success": self.success if self.success is not None else False,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": total_tokens,
            "retry_tokens": self.retry_tokens,
            "cost_usd": self.cost_usd,
            "latency_ms": self.latency_ms,
            "spans": [s.to_dict() for s in self.spans],
        }
