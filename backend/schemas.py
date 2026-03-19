from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class RefineRequest(BaseModel):
    text: str


class TranslateRequest(BaseModel):
    text: str
    style: str = "US"


class CVGenerateRequest(BaseModel):
    text: str


class CVUpdateRequest(BaseModel):
    current_json: dict[str, Any] | list[Any]
    feedback: str


class CVGapRequest(BaseModel):
    resume_json: dict[str, Any] | list[Any]


class RLExtractRequest(BaseModel):
    draft_text: str


class RLChineseDraftRequest(BaseModel):
    draft_text: str
    student_name: str
    student_gender: str = "男"
    recommender_details: dict[str, str] = Field(default_factory=dict)


class RLTranslateDetailsRequest(BaseModel):
    details: dict[str, str]


class RLFinalizeRequest(BaseModel):
    chinese_draft: str
    student_gender: str = "男"
    recommender_signoff: str


class RLRefineRequest(BaseModel):
    text: str
    student_gender: str = "男"
    recommender_signoff: str = ""
