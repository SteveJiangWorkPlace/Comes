from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.config import BACKUP_MODEL_NAME, GEMINI_TIMEOUT_MS, PRIMARY_MODEL_NAME, load_env_settings, load_google_api_key
from backend.infra.genai_client import apply_proxy_mode, gemini_text, init_client, resolve_proxy_mode
from backend.services.utils import network_diagnose

router = APIRouter(prefix="/api", tags=["common"])


@router.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True}


@router.get("/key-status")
def key_status() -> dict[str, Any]:
    settings = load_env_settings()
    proxy_mode = resolve_proxy_mode(settings)
    key = load_google_api_key(settings)
    return {
        "loaded": bool(key),
        "length": len(key),
        "prefix": key[:6] if key else "",
        "client": "google-genai",
        "primary_model": PRIMARY_MODEL_NAME,
        "backup_model": BACKUP_MODEL_NAME,
        "timeout_ms": GEMINI_TIMEOUT_MS,
        "timeout_seconds": GEMINI_TIMEOUT_MS / 1000,
        "proxy_enabled": bool(proxy_mode["use_proxy"]),
        "http_proxy": str(proxy_mode["http_proxy"] or ""),
        "https_proxy": str(proxy_mode["https_proxy"] or ""),
    }


@router.get("/connectivity-test")
def connectivity_test() -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(client, "Reply with exactly: OK")
    return {"ok": bool(txt), "model": model, "response": txt}


@router.get("/network-diagnose")
def network_diagnose_endpoint() -> dict[str, Any]:
    settings = load_env_settings()
    apply_proxy_mode(settings)
    result = network_diagnose()
    try:
        client = init_client()
        txt, model = gemini_text(client, "Reply with exactly: OK")
        result["gemini_api_probe"] = {"ok": bool(txt), "model": model, "error": ""}
    except Exception as e:
        result["gemini_api_probe"] = {"ok": False, "model": "", "error": str(e)}
    return result
