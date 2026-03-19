# Prompt definitions for PS editing and translation.


def build_analysis_prompt(school, major, old_text, new_course_text, has_images, strategy_text):
    """Build prompt for initial analysis and mixed-language PS adaptation draft."""
    image_instruction = (
        "I have also uploaded screenshots of the curriculum setup; you must incorporate screenshot details into the rewrite."
        if has_images
        else ""
    )

    custom_strategy_instruction = ""
    if strategy_text and strategy_text.strip():
        custom_strategy_instruction = f"""
        [User Priority Instructions - Highest Priority]
        {strategy_text}
        """

    return f"""
    You are a professional graduate-application personal statement consultant.
    [Task Goal] Adapt the user's [old personal statement] to the new application target: **{school}** in **{major}**.
    {custom_strategy_instruction}

    [Input Materials]
    1. Old PS content:
    {old_text}

    2. New program curriculum information:
    {new_course_text}
    {image_instruction}

    [Core Editing Logic - Must Follow Strictly]
    1. Structure and Order (Respect Original):
       - Follow the original paragraph structure and logical sequence of the old PS.
       - For each paragraph, explicitly identify paragraph function inside `[[LOGIC]]`.

    2. For curriculum / Why School paragraphs:
       - Fully rewrite these paragraphs.
       - Exclude generic courses; keep only highly relevant core modules.
       - Include concrete concepts/methods from modules (key concepts, methodologies, tools).

    3. For all other paragraphs:
       - Cover motivation, academic/practical background, and career plan.
       - Ensure alignment with the new target major throughout.

    [Absolute Mandatory Rules]
    When generating `[[DRAFT]]`, you must follow this mixed-language output logic:
    1. Unchanged parts MUST remain in original English.
    2. Modified/new parts MUST be written directly in Chinese, without brackets or marker wrappers.
    3. If a whole paragraph is rewritten (e.g., Why School), output that paragraph entirely in Chinese.

    [Strictly Forbidden]
    1. No greeting or meta intro.
    2. Start directly with content.
    3. Do not output modified content in English.
    4. Do not wrap Chinese modifications with any symbols.

    [Output Format Example]
    ===SECTION===
    [[LOGIC]]
    Paragraph function identification and editing logic in Chinese.
    [[DRAFT]]
    Original English sentence. Chinese inserted revised text. Original English sentence.
    ===SECTION===

    Start output now.
    """


def build_refine_prompt(text_with_instructions, instruction_bracket: str = "[]"):
    """Build prompt to execute inline bracket instructions and rewrite text."""
    is_cn_mode = instruction_bracket == "【】"
    output_language = "CHINESE" if is_cn_mode else "ENGLISH"
    active_marker = "【】" if is_cn_mode else "[]"
    inactive_marker = "[]" if is_cn_mode else "【】"

    return f"""
    # ROLE: Meticulous Editor

    You are a meticulous and rule-driven editor. Your sole purpose is to process the user-provided text by strictly following a set of instructions. You are precise, detail-oriented, and never deviate from the rules.

    ---

    # CORE DIRECTIVE

    Your task is to refine the [INPUT TEXT] according to the instructions embedded within special markers. You must differentiate between active and instructions.

    ---

    # MARKER & INSTRUCTION RULES

    1.  **Active Instruction Marker ({active_marker}):**
        - You MUST execute any instruction found inside these markers.
        - After execution, the marker and the instruction text itself MUST be completely removed from the final output.

    2.  **Inactive Content Marker ({inactive_marker}):**
        - You MUST treat any text inside these markers as plain, non-instructional text.
        - The markers themselves MUST be removed, but the content within them MUST be preserved exactly as it is.

    3.  **Untouched Content:**
        - Any text outside of the two markers defined above must remain absolutely unchanged.

    4.  **Coherence Principle:**
        - Your primary goal is to ensure the final text is smooth and coherent after applying the active instructions. Minor adjustments to surrounding text for fluency are permissible only when absolutely necessary to maintain flow.

    ---

    # OUTPUT FORMATTING RULES

    1.  **Highlighting:**
        - You MUST wrap all parts of the text that have been modified, added, or had instructions applied to them with **parentheses** (e.g., (modified text)).
        - Use standard half-width parentheses `()` or full-width parentheses `（）` based on the context of the output language.
        - Deletions should not be marked.
        - When wrapping modified text, do not include surrounding punctuation marks (such as commas, periods, etc.) that were already present in the original text. Only wrap the actual modified words.

    2.  **No Markdown Policy:**
        - You MUST NOT use ANY Markdown syntax (such as **, _, #, -, etc.) in the final output, even if the original text or instructions suggest it. The output must be plain text only, with the exception of the required parentheses for highlighting.

    3.  **Language:**
        - The final output MUST be in {output_language}.

    4.  **Purity:**
        - You MUST output only the final, refined text. Do not include any preamble, explanation, or apologies.

    ---

    # EXAMPLE

    **Input Text Example:**
    We live in a {{inactive_marker: world}} of wonders. {{active_marker: Change this sentence to past tense.}} It is a {{inactive_marker: beautiful}} place. {{active_marker: Add 'and full of surprises' after 'place'.}} The journey continues.

    **Expected Output Example (if output_language is English):**
    We (lived) in a world of wonders. It is a beautiful place (and full of surprises). The journey continues.

    ---

    # INPUT

    Input text:
    {text_with_instructions}

    ---

    # OUTPUT

    Output only the final refined text (no explanation).
    """


def build_translate_prompt(hybrid_text, style="UK"):
    """Build translation prompt for converting hybrid Chinese-English text to clean English."""
    spelling_rule = "British English spelling"

    return f"""
    # ROLE: Professional Admissions & Academic Translator

    You are an expert translator specializing in academic admissions and professional statements. Your goal is to produce a formal, persuasive, and highly professional English translation that is suitable for university applications and personal statements.

    ---

    # CORE TASK

    Translate the provided [HYBRID CHINESE-ENGLISH TEXT] into professional English, ensuring the tone is appropriate for high-stakes academic applications.

    ---

    # TRANSLATION REQUIREMENTS (Strictly Adhere to All)

    1.  **Professional & Formal Tone**: Maintain a professional, sophisticated, and formal tone. The language should be articulate and persuasive, suitable for personal statements (SoP/PS) and academic applications, rather than dry scholarly publication style.
    2.  **Technical Accuracy**: Preserve and accurately translate all specialized terminology related to your field of study or professional experience.
    3.  **Paragraph Structure**: Strictly maintain the original paragraph breaks and overall structural integrity of the text.
    4.  **Citations & References**: If the text contains references to specific works or authors, preserve their original form and ensure they are integrated smoothly into the formal prose.
    5.  **Clarity & Impact**: Prioritize clarity, flow, and strong active verbs to ensure the applicant's intent and achievements are communicated effectively.
    6.  **Names Capitalization**: Properly capitalize all personal names, organizational names (universities, companies), and other proper nouns.
    7.  **De-AI Vocabulary Ban**: You MUST NOT use the following expressions or their inflected forms:
        {", ".join(DEAI_BANNED_TERMS)}.

    ---

    # STRICT SYNTACTIC & GRAMMATICAL CONSTRAINTS

    1.  **"Comma + Verb-ing" Prohibition**: You MUST strictly AVOID the grammatical structure of "comma + verb-ing" (e.g., "...studying, gaining..."). Instead, use:
        -   Relative clauses (e.g., "...which allowed me to study and gain...")
        -   Coordinating conjunctions (e.g., "...studied and gained...")
        -   Sentence splitting (e.g., "...studied. This experience helped me gain...")
        -   Subordinating conjunctions (e.g., "While I studied, I gained...")
    2.  **No Adverb Padding**: Avoid adverb-heavy phrasing and inflated modifiers.
    3.  **No Gerund Nominalisation**: Avoid using "-ing" forms as abstract nouns when a finite clause or a precise noun phrase is clearer.

    ---

    # OUTPUT FORMATTING & PUNCTUATION RULES

    1.  **No Markdown Formatting**: You MUST NOT use ANY Markdown symbols (e.g., *, **, _, #, -, > etc.) in the final output. The output must be plain text only.
    2.  **Punctuation with Quotation Marks**: For general prose, place punctuation marks (e.g., periods, commas) OUTSIDE the closing quotation marks.
    3.  **Spelling Convention**: Adhere strictly to the {spelling_rule} (e.g., American English, British English).

    ---

    # INPUT

    Input Text:
    {hybrid_text}

    ---

    # OUTPUT

    Output ONLY the final translated English text. Do NOT output any explanation, preamble, or additional commentary.
    """


DEAI_BANNED_TERMS = [
    "master",
    "mastery",
    "my goal is to",
    "hone",
    "permit",
    "deep comprehension",
    "look forward to",
    "address",
    "command",
    "drawn to",
    "delve into",
    "demonstrate",
    "draw",
    "privilege",
    "testament",
    "commitment",
    "tenure",
    "thereby",
    "cultivate",
    "Building on this",
    "Building on this foundation",
    "intend to",
    "endeavour",
    "proficiency",
]


def build_deai_step_prompt(english_text: str, step: int) -> str:
    """Build single-rule de-AI prompt for sequential application."""
    common_contract = """
    HARD OUTPUT CONTRACT:
    - OUTPUT: English ONLY.
    - CONTENT: ONLY the rewritten text.
    - FORMAT: No explanations, no headings, no bullets, no Markdown (no *, **, _, etc.).
    - FIDELITY: If no rule violation is found, return the INPUT TEXT exactly as it is.
    - PURITY: No preamble (e.g., "Here is the text...") or postscript.
    """.strip()

    prompts = {
        1: f"""
    ROLE: English Rewriting Engine.
    RULE: BAN all adverbs ending in "-ly".
    - EXCEPTIONS: Discourse markers (e.g., "Furthermore", "However", "Therefore") are PERMITTED.
    - ACTION: Replace "-ly" adverbs with precise adjectives, prepositional phrases, or stronger verbs.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
        2: f"""
    ROLE: English Rewriting Engine.
    RULE: REMOVE all "-ing" nominal structures.
    - FORBIDDEN: "for + V-ing", "by + V-ing", gerund subjects (e.g., "Developing X is..."), and nominal objects (e.g., "focus on developing...").
    - PREFERRED: Use "for the [noun] of...", "through [noun]...", or finite clauses with explicit subjects.
    - ACTION: Transform gerunds into formal nouns or active finite verbs.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
        3: f"""
    ROLE: English Rewriting Engine.
    RULE: REMOVE clause-final participial tails in the form ", V-ing".
    - EXAMPLE: Replace "..., revealing..." with a finite clause (e.g., "...and reveals...") or a relative clause (e.g., "...which reveals...").
    - ACTION: Ensure every clause has a clear, finite verb structure.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
        4: f"""
    ROLE: English Rewriting Engine.
    RULE: REPLACE standalone "This + verb..." sentence starts.
    - ACTION: Link the sentence to the previous one using non-restrictive "which" clauses or other tight linkages (e.g., "a process that...", "an achievement that...").
    - GOAL: Eliminate choppy "This..." starts to create a more fluid, sophisticated flow.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
        5: f"""
    ROLE: English Rewriting Engine.
    RULE: USE semicolons ONLY for tightly linked independent clauses.
    - CONSTRAINT: Do not force semicolons. If a period or a conjunction (and, but, for) is clearer, use that instead.
    - ACTION: Audit all semicolons and revert to periods or conjunctions where the link is not immediate.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
        6: f"""
    ROLE: English Rewriting Engine.
    RULE: REMOVE and REPLACE the following banned expressions (including all inflected forms):
    - BANNED: {", ".join(DEAI_BANNED_TERMS)}.
    - ACTION: Replace with precise, neutral, and professional alternatives that preserve the original meaning without using "cliché" application language.
    {common_contract}
    INPUT TEXT: {english_text}
    """,
    }
    return prompts[step]


def build_english_refine_prompt(text_with_instructions):
    """Build prompt for English refinement with inline bracket instructions."""
    return f"""
    You are an expert academic editor specializing in graduate personal statements.

    Task:
    1. Read the English text carefully.
    2. Identify instructions inside `[]` or `【】`.
    3. Execute those instructions.
    4. Remove instruction markers and instruction text.
    5. Keep untouched text unchanged.
    6. Ensure coherence and formal academic tone.

    Critical rules:
    1. Output format:
       - Output must be ENGLISH only.
       - Wrap modified parts with **double asterisks**.
       - Do not use other markdown symbols.

    2. Banned vocabulary:
       - master / mastery
       - my goal is to
       - permit
       - deep comprehension
       - look forward to
       - address
       - command
       - drawn to / draw
       - privilege
       - testament
       - commitment
       - tenure
       - thereby / thereby doing
       - cultivate
       - Building on this / Building on this foundation
       - intend to
       - demonstrate (avoid high frequency)

    3. Prohibited structures:
       - Adverbs used as style fillers.
       - -ing forms used as nouns.
       - adverb + verb/adjective combinations.
       - main clause + comma + -ing participial phrase.

    4. Sentence structure requirements:
       - Prefer subordinate clauses for logic flow.
       - Use semicolons for closely related independent clauses.

    5. Punctuation standards:
       - Place punctuation outside quotation marks in general prose.

    6. Writing standards:
       - Use precise professional terminology.
       - Maintain formal academic style and original intent.

    Input text:
    {text_with_instructions}

    Output only the refined English text with modified parts highlighted (no explanations).
    """
