from __future__ import annotations

import json
from datetime import date
from typing import Any

from backend.prompts import DEAI_BANNED_TERMS

HARD_OUTPUT_CONTRACT_EN = """
HARD OUTPUT CONTRACT (MUST FOLLOW):
- Output ONLY the final rewritten result.
- No explanation, no commentary, no feedback.
- No headings, no bullet points, no markdown, no code blocks.
- Do not provide multiple versions.
- Do not ask questions.
""".strip()

HARD_OUTPUT_CONTRACT_ZH = """
Hard Output Contract (Must Follow):
1. Output only the final rewritten result.
2. Do not explain, comment, or provide feedback.
3. No headings, bullet points, markdown, or code blocks.
4. Do not provide multiple versions.
5. Do not ask rhetorical questions.
""".strip()


def strip_fenced_json(text: str) -> str:
    t = (text or "").strip()
    if t.startswith("```json"):
        t = t[7:]
    if t.startswith("```"):
        t = t[3:]
    if t.endswith("```"):
        t = t[:-3]
    return t.strip()


def parse_json_or_raise(text: str) -> Any:
    return json.loads(strip_fenced_json(text))


def build_cv_generate_prompt(text_input: str) -> str:
    return f"""
You are an expert Resume Writer. Synthesize information from all supplied materials into a single cohesive JSON.

CONTENT RULES:
1. Max 3-4 bullet points per role. Merge similar tasks.
2. Add realistic execution details, but do not fabricate numbers.
3. Use strong action verbs in simple past tense where appropriate.
4. Extract GPA, Honors, and Core Courses when present.
5. Do not include political status information such as CPC member or similar.
6. Use logical punctuation. If quoting tools or terms, place punctuation outside the quotes.
7. Output valid JSON only.

Target JSON keys:
header, education, professional_experience, leadership_experience, project_experience, honours, additional_info

Input material:
{text_input}
""".strip()


def build_cv_gap_prompt(json_payload: str) -> str:
    return f"""
Review the resume JSON and identify missing critical info.
Output in Chinese, numbered list (1. 2. 3.), no markdown symbols.
Start with: 您好，为了让您的简历更加完善，建议您补充以下信息：

JSON:
{json_payload}
""".strip()


def build_cv_update_prompt(current_json: str, user_feedback: str) -> str:
    return f"""
Update this resume JSON based on user feedback.

Rules:
1. Keep JSON schema unchanged.
2. Max 3-4 bullets per role.
3. No fake numbers.
4. Return valid JSON only.
5. All output content must remain in English only.

Current JSON:
{current_json}

User Feedback:
{user_feedback}
""".strip()


def build_cv_english_json_prompt(current_json: str) -> str:
    return f"""
You are an expert resume editor and translator.

Task:
Convert the following resume JSON into a fully English version while preserving the original JSON schema.

Rules:
1. Return valid JSON only.
2. Keep the same top-level keys and nested structure.
3. Translate every Chinese field into professional resume English.
4. Ensure all bullet points, titles, degrees, project descriptions, honours, and additional info are in English only.
5. Do not leave any Chinese characters in the output.
6. Keep resume style concise and professional.
7. Use British English spelling.

Input JSON:
{current_json}
""".strip()


def build_rl_extract_prompt(draft_text: str) -> str:
    return f"""
You are an extraction system.
Extract recommender details into JSON with keys:
name, title, affiliation, phone, email
If missing, use empty string.
Return JSON only.

Input:
{draft_text}
""".strip()


def build_rl_translate_details_prompt(details_json: str) -> str:
    return f"""
You are a translation expert. Translate only name/title/affiliation values in this JSON from Chinese to professional English.
Return JSON only.

Input JSON:
{details_json}
""".strip()


def build_rl_chinese_draft_prompt(
    draft_text: str,
    student_name: str,
    student_gender: str,
    recommender_name: str,
    recommender_title: str,
) -> str:
    pronoun = "他" if student_gender == "男" else "她"
    return f"""
You are an expert academic and professional consultant.
Task: Write a Chinese draft body for a recommendation letter.

Input:
- Student: {student_name} ({student_gender}, use "{pronoun}")
- Recommender: {recommender_name}, {recommender_title}
- Source material: {draft_text}

Constraints:
1. Output body text only; no salutation or signature block.
2. No markdown output.
3. Professional and natural tone.
4. Do not output explanations, commentary, or suggestion language.
5. If the recommender is academic, elaborate on specific methods or theories when the source supports them.
6. If the recommender is professional, infer realistic responsibilities and achievements from the role context without fake metrics.
{HARD_OUTPUT_CONTRACT_ZH}
""".strip()


def build_rl_refine_cn_prompt(text_with_instructions: str, student_gender: str) -> str:
    pronoun = "他" if student_gender == "男" else "她"
    return f"""
You are a Chinese language editor. Execute bracketed revision instructions and remove markers.
Keep unchanged parts intact, maintain formal tone, and keep pronoun consistency ({pronoun}).
Output body text only with no explanation.

Input:
{text_with_instructions}
""".strip()


def build_rl_finalize_en_prompt(
    chinese_draft: str,
    student_gender: str,
    recommender_signoff: str,
) -> str:
    today = date.today().strftime("%B %d, %Y")
    pron = "he" if student_gender == "男" else "she"
    return f"""
You are an expert translator specializing in academic admissions and professional statements.
Your goal is to produce a formal, persuasive, and highly professional English recommendation letter.

Core task:
Translate the provided Chinese recommendation-letter draft into professional English suitable for high-stakes academic applications.

Translation requirements:
1. Maintain a professional, formal, and persuasive tone.
2. Preserve the original paragraph structure and logical flow.
3. Ensure all terminology and institutional references are translated accurately.
4. Use British English spelling.
5. Do not use the following expressions or their inflected forms:
   {", ".join(DEAI_BANNED_TERMS)}.

Strict syntactic and grammatical constraints:
1. Avoid adverb-heavy phrasing.
2. Avoid using gerunds as abstract nouns when a finite clause or precise noun phrase is clearer.
3. Strictly avoid main clause + comma + -ing participial phrase.
4. Use semicolons only when two closely related independent clauses genuinely warrant them.
5. Place punctuation outside quotation marks in general prose.

Structure:
- Date at top-left: {today}
- Correct pronouns: {pron}
- End with:
Sincerely,
{recommender_signoff}

{HARD_OUTPUT_CONTRACT_EN}
- Output must be the letter content only; no analysis or notes.

Input:
{chinese_draft}
""".strip()


def build_rl_refine_en_prompt(
    english_text_with_instructions: str,
    student_gender: str,
    recommender_signoff: str,
) -> str:
    pron = "he" if student_gender == "男" else "she"
    return f"""
You are a professional editor for recommendation letters.
Execute user instructions in brackets, remove markers, and keep untouched text stable.

Constraints:
1. Keep formal tone.
2. Avoid adverbs, gerunds as sentence subjects, and comma + -ing structures.
3. Enforce the banned vocabulary list from the English generation step.
4. Keep pronouns consistent ({pron}).
5. Keep sign-off block unchanged:
Sincerely,
{recommender_signoff}
6. Do not output feedback or rationale.
{HARD_OUTPUT_CONTRACT_EN}

Input:
{english_text_with_instructions}
""".strip()
