from __future__ import annotations

import os
import warnings
from typing import Any

from fastapi import HTTPException
from google import genai
from google.genai import types as genai_types
from pydantic.warnings import ArbitraryTypeWarning

from backend.config import BACKUP_MODEL_NAME, GEMINI_TIMEOUT_MS, PRIMARY_MODEL_NAME, load_env_settings, load_google_api_key

warnings.filterwarnings("ignore", category=UserWarning, module=r"pydantic\._internal\._generate_schema")
warnings.filterwarnings("ignore", message=r".*built-in function any.*", module=r"pydantic\._internal\._generate_schema")
warnings.filterwarnings("ignore", category=ArbitraryTypeWarning)


PROXY_KEYS = ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy")


def _to_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    v = value.strip().lower()
    return v in {"1", "true", "yes", "on"}


def resolve_proxy_mode(settings: dict[str, str]) -> dict[str, str | bool]:
    use_proxy = _to_bool(settings.get("USE_PROXY"), default=False)
    proxy_url = (settings.get("PROXY_URL") or "").strip()
    http_proxy = (settings.get("HTTP_PROXY") or proxy_url).strip()
    https_proxy = (settings.get("HTTPS_PROXY") or proxy_url).strip()
    return {
        "use_proxy": use_proxy,
        "http_proxy": http_proxy,
        "https_proxy": https_proxy,
    }


def apply_proxy_mode(settings: dict[str, str]) -> dict[str, str | bool]:
    mode = resolve_proxy_mode(settings)
    if mode["use_proxy"]:
        http_proxy = str(mode["http_proxy"] or "")
        https_proxy = str(mode["https_proxy"] or "")
        if http_proxy:
            os.environ["HTTP_PROXY"] = http_proxy
            os.environ["http_proxy"] = http_proxy
        if https_proxy:
            os.environ["HTTPS_PROXY"] = https_proxy
            os.environ["https_proxy"] = https_proxy
        os.environ.pop("ALL_PROXY", None)
        os.environ.pop("all_proxy", None)
    else:
        for proxy_key in PROXY_KEYS:
            os.environ.pop(proxy_key, None)
    return mode


def init_client() -> genai.Client:
    settings = load_env_settings()
    apply_proxy_mode(settings)
    api_key = load_google_api_key(settings)
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY 未配置")
    return genai.Client(
        api_key=api_key,
        http_options=genai_types.HttpOptions(timeout=GEMINI_TIMEOUT_MS),
    )


def call_gemini_fail_fast(
    client: genai.Client,
    contents: Any,
    primary_model: str = PRIMARY_MODEL_NAME,
    backup_model: str = BACKUP_MODEL_NAME,
) -> Any:
    try:
        res = client.models.generate_content(model=primary_model, contents=contents)
        setattr(res, "_used_model_name", primary_model)
        return res
    except Exception as primary_err:
        if "NOT_FOUND" in str(primary_err) or "not found" in str(primary_err).lower():
            try:
                res = client.models.generate_content(model=backup_model, contents=contents)
                setattr(res, "_used_model_name", backup_model)
                return res
            except Exception as backup_err:
                raise HTTPException(
                    status_code=503,
                    detail=f"Gemini fail-fast failed. Primary: {primary_err}; Backup: {backup_err}",
                ) from backup_err
        raise HTTPException(status_code=503, detail=f"Gemini fail-fast failed: {primary_err}") from primary_err


def gemini_text(
    client: genai.Client,
    prompt: Any,
    primary_model: str = PRIMARY_MODEL_NAME,
    backup_model: str = BACKUP_MODEL_NAME,
) -> tuple[str, str]:
    res = call_gemini_fail_fast(client, prompt, primary_model=primary_model, backup_model=backup_model)
    txt = (getattr(res, "text", "") or "").strip()
    model = getattr(res, "_used_model_name", primary_model)
    return txt, model


def stream_generate_content(
    client: genai.Client,
    contents: Any,
    primary_model: str = PRIMARY_MODEL_NAME,
    backup_model: str = BACKUP_MODEL_NAME,
):
    try:
        stream = client.models.generate_content_stream(model=primary_model, contents=contents)
        return stream, primary_model
    except Exception as primary_err:
        if "NOT_FOUND" in str(primary_err) or "not found" in str(primary_err).lower():
            stream = client.models.generate_content_stream(model=backup_model, contents=contents)
            return stream, backup_model
        raise primary_err
