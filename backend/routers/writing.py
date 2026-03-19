from __future__ import annotations

import json
from io import BytesIO
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from backend.infra.genai_client import gemini_text, init_client
from backend.schemas import (
    CVGapRequest,
    CVUpdateRequest,
    RLChineseDraftRequest,
    RLExtractRequest,
    RLFinalizeRequest,
    RLRefineRequest,
    RLTranslateDetailsRequest,
)
from backend.services.documents import (
    extract_text_from_pdf,
    generate_resume_docx,
    post_process_resume_data,
    sort_resume_data,
)
from backend.services.utils import clean_asterisks
from backend.workflows import (
    build_cv_english_json_prompt,
    build_cv_gap_prompt,
    build_cv_generate_prompt,
    build_cv_update_prompt,
    build_rl_chinese_draft_prompt,
    build_rl_extract_prompt,
    build_rl_finalize_en_prompt,
    build_rl_refine_cn_prompt,
    build_rl_refine_en_prompt,
    build_rl_translate_details_prompt,
    parse_json_or_raise,
)

router = APIRouter(prefix="/api", tags=["writing"])


def _ensure_resume_json_english(payload: dict[str, Any] | list[Any]) -> dict[str, Any] | list[Any]:
    raw = json.dumps(payload, ensure_ascii=False)
    if not any("\u4e00" <= ch <= "\u9fff" for ch in raw):
        return payload
    client = init_client()
    txt, _ = gemini_text(client, build_cv_english_json_prompt(raw))
    parsed = parse_json_or_raise(txt)
    if isinstance(parsed, dict):
        return sort_resume_data(post_process_resume_data(parsed))
    return parsed


@router.post("/cv/generate")
async def cv_generate(
    text: str = Form(""),
    files: list[UploadFile] | None = File(None),
) -> dict[str, Any]:
    if not text.strip() and not files:
        raise HTTPException(status_code=400, detail="请至少提供文本或文件素材")

    client = init_client()
    prompt_parts: list[Any] = [build_cv_generate_prompt(text.strip())]
    if files:
        for upload in files:
            raw = await upload.read()
            if not raw:
                continue
            content_type = (upload.content_type or "").lower()
            filename = upload.filename or "upload"
            if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
                prompt_parts.append(f"\n### PDF Content ({filename}):\n{extract_text_from_pdf(BytesIO(raw))}")
            elif content_type.startswith("image/"):
                prompt_parts.append(f"\n### Image Input ({filename}):")
                prompt_parts.append(Image.open(BytesIO(raw)))

    txt, model = gemini_text(client, prompt_parts)
    try:
        parsed = parse_json_or_raise(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV JSON parse failed: {e}") from e
    parsed = sort_resume_data(post_process_resume_data(parsed))
    return {"resume_json": parsed, "model": model}


@router.post("/cv/analyze-gaps")
def cv_analyze_gaps(req: CVGapRequest) -> dict[str, Any]:
    client = init_client()
    payload = json.dumps(req.resume_json, ensure_ascii=False)
    txt, model = gemini_text(client, build_cv_gap_prompt(payload))
    return {"report": txt, "model": model}


@router.post("/cv/update")
def cv_update(req: CVUpdateRequest) -> dict[str, Any]:
    client = init_client()
    current_json = json.dumps(req.current_json, ensure_ascii=False)
    txt, model = gemini_text(client, build_cv_update_prompt(current_json, req.feedback))
    try:
        parsed = parse_json_or_raise(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV update JSON parse failed: {e}") from e
    parsed = sort_resume_data(post_process_resume_data(parsed))
    return {"resume_json": parsed, "model": model}


@router.post("/cv/export-docx")
def cv_export_docx(resume_json: str = Form(...)):
    payload = _ensure_resume_json_english(json.loads(resume_json))
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="CV resume_json 必须是对象")
    return StreamingResponse(
        generate_resume_docx(payload),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": 'attachment; filename="Resume_Optimized.docx"'},
    )


@router.post("/rl/extract-details")
def rl_extract_details(req: RLExtractRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(client, build_rl_extract_prompt(req.draft_text))
    try:
        details = parse_json_or_raise(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RL details JSON parse failed: {e}") from e
    keys = ["name", "title", "affiliation", "phone", "email"]
    normalized = {k: str(details.get(k, "") or "") for k in keys}
    return {"details": normalized, "model": model}


@router.post("/rl/translate-details")
def rl_translate_details(req: RLTranslateDetailsRequest) -> dict[str, Any]:
    client = init_client()
    src = {
        "name": req.details.get("name", ""),
        "title": req.details.get("title", ""),
        "affiliation": req.details.get("affiliation", ""),
    }
    if all((not v) or v.isascii() for v in src.values()):
        return {"details": req.details, "model": "pass-through"}
    txt, model = gemini_text(client, build_rl_translate_details_prompt(json.dumps(src, ensure_ascii=False)))
    try:
        translated = parse_json_or_raise(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RL translated details JSON parse failed: {e}") from e
    merged = dict(req.details)
    merged.update({k: str(translated.get(k, "") or "") for k in ("name", "title", "affiliation")})
    return {"details": merged, "model": model}


@router.post("/rl/generate-chinese")
def rl_generate_chinese(req: RLChineseDraftRequest) -> dict[str, Any]:
    client = init_client()
    details = req.recommender_details or {}
    txt, model = gemini_text(
        client,
        build_rl_chinese_draft_prompt(
            draft_text=req.draft_text,
            student_name=req.student_name,
            student_gender=req.student_gender,
            recommender_name=str(details.get("name", "")),
            recommender_title=str(details.get("title", "")),
        ),
    )
    return {"text": clean_asterisks(txt), "model": model}


@router.post("/rl/refine-chinese")
def rl_refine_chinese(req: RLRefineRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(client, build_rl_refine_cn_prompt(req.text, req.student_gender))
    return {"text": clean_asterisks(txt), "model": model}


@router.post("/rl/finalize-english")
def rl_finalize_english(req: RLFinalizeRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(
        client,
        build_rl_finalize_en_prompt(req.chinese_draft, req.student_gender, req.recommender_signoff),
    )
    return {"text": clean_asterisks(txt), "model": model}


@router.post("/rl/refine-english")
def rl_refine_english(req: RLRefineRequest) -> dict[str, Any]:
    client = init_client()
    txt, model = gemini_text(
        client,
        build_rl_refine_en_prompt(req.text, req.student_gender, req.recommender_signoff),
    )
    return {"text": clean_asterisks(txt), "model": model}
