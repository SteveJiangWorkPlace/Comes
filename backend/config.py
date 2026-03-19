from __future__ import annotations

import os
from pathlib import Path

PRIMARY_MODEL_NAME = "gemini-2.5-pro"
BACKUP_MODEL_NAME = "gemini-2.5-flash"
FLASH_MODEL_NAME = "gemini-2.5-flash"
ENV_PATH = Path(__file__).resolve().parent / ".env"
GEMINI_TIMEOUT_MS = 600_000


def load_env_settings() -> dict[str, str]:
    settings: dict[str, str] = {}
    if not ENV_PATH.exists():
        return settings
    for raw_line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        settings[key.strip()] = value.strip().strip("'").strip('"')
    return settings


def load_google_api_key(settings: dict[str, str]) -> str:
    if not os.getenv("GOOGLE_API_KEY", "").strip():
        env_key = settings.get("GOOGLE_API_KEY", "").strip()
        if env_key:
            os.environ["GOOGLE_API_KEY"] = env_key
    return os.getenv("GOOGLE_API_KEY", "").strip()
