from __future__ import annotations

from io import BytesIO
import re
from typing import Any

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from backend.config import FLASH_MODEL_NAME, PRIMARY_MODEL_NAME
from backend.infra.genai_client import gemini_text, init_client, stream_generate_content
from backend.prompts import (
    build_analysis_prompt,
    build_deai_step_prompt,
    build_english_refine_prompt,
    build_refine_prompt,
    build_translate_prompt,
)
from backend.schemas import RefineRequest, TranslateRequest
from backend.services.utils import (
    clean_asterisks,
    clean_parentheses,
    detect_deai_violations,
    filter_ai_greeting,
    ndjson_line,
    parse_sections,
)

router = APIRouter(prefix="/api", tags=["ps-edit"])


def _resolve_refine_marker_mode(text: str) -> str:
    src = text or ""
    cn_match = re.search(r"【[^】]*】", src)
    en_match = re.search(r"\[[^\[\]]*\]", src)
    if cn_match and en_match:
        # When both markers exist, decide mode by nearby language context.
        pattern = re.compile(r"【[^】]*】|\[[^\[\]]*\]")
        zh_count = 0
        en_count = 0
        for m in pattern.finditer(src):
            start, end = m.span()
            left = max(0, start - 24)
            right = min(len(src), end + 24)
            ctx = src[left:start] + src[end:right]
            zh_count += len(re.findall(r"[\u4e00-\u9fff]", ctx))
            en_count += len(re.findall(r"[A-Za-z]", ctx))
        if zh_count > en_count:
            return "【】"
        if en_count > zh_count:
            return "[]"
        # Tie-breaker: preserve previous deterministic behavior.
        return "【】" if cn_match.start() <= en_match.start() else "[]"
    if cn_match:
        return "【】"
    return "[]"


async def _build_content_parts(
    old_ps: str,
    target_school: str,
    target_major: str,
    new_course_text: str,
    strategy_text: str,
    images: list[UploadFile] | None,
) -> list[Any]:
    prompt_text = build_analysis_prompt(
        target_school,
        target_major,
        old_ps,
        new_course_text,
        bool(images),
        strategy_text,
    )
    content_parts: list[Any] = [prompt_text]
    if images:
        for image_file in images:
            raw = await image_file.read()
            if raw:
                content_parts.append(Image.open(BytesIO(raw)))
    return content_parts


@router.post("/generate")
async def generate(
    old_ps: str = Form(...),
    target_school: str = Form(...),
    target_major: str = Form(""),
    new_course_text: str = Form(""),
    strategy_text: str = Form(""),
    images: list[UploadFile] | None = File(None),
) -> dict[str, Any]:
    client = init_client()
    content_parts = await _build_content_parts(
        old_ps,
        target_school,
        target_major,
        new_course_text,
        strategy_text,
        images,
    )

    txt, _ = gemini_text(client, content_parts)
    full_response = filter_ai_greeting(clean_asterisks(txt))
    sections = parse_sections(full_response)
    return {"full_response": full_response, "sections": sections}


@router.post("/generate-stream")
async def generate_stream(
    old_ps: str = Form(...),
    target_school: str = Form(...),
    target_major: str = Form(""),
    new_course_text: str = Form(""),
    strategy_text: str = Form(""),
    images: list[UploadFile] | None = File(None),
):
    client = init_client()
    content_parts = await _build_content_parts(
        old_ps,
        target_school,
        target_major,
        new_course_text,
        strategy_text,
        images,
    )

    def event_stream():
        try:
            yield ndjson_line({"event": "progress", "progress": 10, "message": "请求已发送，开始生成"})
            stream, used_model = stream_generate_content(client, content_parts)
            full_text = ""
            generated_chars = 0
            yield ndjson_line({"event": "progress", "progress": 20, "message": f"模型 {used_model} 处理中"})
            for chunk in stream:
                chunk_text = getattr(chunk, "text", "") or ""
                if not chunk_text:
                    continue
                full_text += chunk_text
                generated_chars += len(chunk_text)
                progress = min(92, 20 + generated_chars // 180)
                yield ndjson_line({"event": "progress", "progress": int(progress), "message": "正在接收生成内容"})

            full_response = filter_ai_greeting(clean_asterisks(full_text))
            sections = parse_sections(full_response)
            yield ndjson_line({"event": "progress", "progress": 98, "message": "正在解析段落"})
            yield ndjson_line(
                {
                    "event": "done",
                    "progress": 100,
                    "model": used_model,
                    "full_response": full_response,
                    "sections": sections,
                }
            )
        except Exception as e:
            yield ndjson_line({"event": "error", "message": str(e)})

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


@router.post("/refine")
def refine(req: RefineRequest) -> dict[str, Any]:
    client = init_client()
    marker_mode = _resolve_refine_marker_mode(req.text)
    txt, model = gemini_text(
        client,
        build_refine_prompt(req.text, marker_mode),
        primary_model=PRIMARY_MODEL_NAME,
        backup_model=FLASH_MODEL_NAME,
    )
    txt = clean_parentheses(txt)
    return {"text": txt, "model": model, "marker_mode": marker_mode}


@router.post("/translate")
def translate(req: TranslateRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(
        client,
        build_translate_prompt(req.text, "UK"),
        primary_model=FLASH_MODEL_NAME,
        backup_model=PRIMARY_MODEL_NAME,
    )
    return {"text": txt, "style": "UK", "model": model}


@router.post("/refine-english")
def refine_english(req: RefineRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(
        client,
        build_english_refine_prompt(req.text),
        primary_model=PRIMARY_MODEL_NAME,
        backup_model=FLASH_MODEL_NAME,
    )
    txt = clean_parentheses(txt)
    return {"text": txt, "model": model}


@router.post("/de-ai")
def de_ai(req: RefineRequest) -> dict[str, Any]:
    client = init_client()
    txt = req.text
    model = FLASH_MODEL_NAME

    # Apply de-AI rules sequentially: one prompt per rule, chaining outputs.
    for step in range(1, 7):
        txt, model = gemini_text(
            client,
            build_deai_step_prompt(txt, step),
            primary_model=FLASH_MODEL_NAME,
            backup_model=PRIMARY_MODEL_NAME,
        )
    first_pass_violations = detect_deai_violations(txt)

    return {
        "text": txt,
        "model": model,
        "repaired": False,
        "first_pass_violations": first_pass_violations,
    }
