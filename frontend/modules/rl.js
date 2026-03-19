import { callJson } from "../api.js";
import { copyText, setGlobalStatus, setLocalStatus } from "../status.js";

function parseRlDetailsSafe() {
  const raw = document.getElementById("rlDetailsJson").value.trim();
  if (!raw) return { ok: true, details: { name: "", title: "", affiliation: "", phone: "", email: "" } };
  try {
    return { ok: true, details: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: `推荐人信息 JSON 格式错误: ${String(e.message || e)}` };
  }
}

function buildSignoff(details) {
  return [
    details?.name || "",
    details?.title || "",
    details?.affiliation || "",
    details?.email || "",
    details?.phone ? `Tel: ${details.phone}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function hasMeaningfulDetails(details) {
  if (!details || typeof details !== "object") return false;
  return ["name", "title", "affiliation", "phone", "email"].some((key) => String(details[key] || "").trim());
}

function buildChineseSignoff(details) {
  const lines = [
    "此致",
    "敬礼！",
    "",
    details?.name || "",
    details?.title || "",
    details?.affiliation || "",
    details?.email || "",
    details?.phone ? `电话：${details.phone}` : "",
  ].filter((line, idx, arr) => line || (idx > 0 && arr[idx - 1] !== ""));
  return lines.join("\n");
}

function appendChineseSignoff(body, details) {
  const cleanBody = (body || "").trim();
  const signoff = buildChineseSignoff(details).trim();
  if (!cleanBody) return signoff;
  if (!signoff) return cleanBody;
  return `${cleanBody}\n\n${signoff}`;
}

function splitChineseDraftAndSignoff(text) {
  const raw = (text || "").trim();
  if (!raw) return { body: "", signoff: "" };

  const marker = /\n\s*\n此致\s*\n敬礼！[\s\S]*$/;
  const match = raw.match(marker);
  if (!match || match.index == null) {
    return { body: raw, signoff: "" };
  }

  const body = raw.slice(0, match.index).trim();
  const signoff = raw.slice(match.index).trim();
  return { body, signoff };
}

export function mountRl(persistCache) {
  let lastRecommenderSource = "";

  function getRecommenderSourceText() {
    return document.getElementById("rlRecommenderRaw").value.trim();
  }

  async function ensureRecommenderDetails() {
    const parsed = parseRlDetailsSafe();
    if (!parsed.ok && document.getElementById("rlDetailsJson").value.trim()) {
      throw new Error(parsed.error);
    }

    const sourceText = getRecommenderSourceText();
    if (!sourceText) {
      throw new Error("请先输入推荐人信息");
    }

    let details = parsed.details;
    const sourceChanged = sourceText !== lastRecommenderSource;
    if (!hasMeaningfulDetails(details) || sourceChanged) {
      const extracted = await callJson("/rl/extract-details", { draft_text: sourceText });
      details = extracted.details || details;
      document.getElementById("rlDetailsJson").value = JSON.stringify(details, null, 2);
      lastRecommenderSource = sourceText;
    }

    return { details };
  }

  async function buildEnglishSignoffFromDetails() {
    const { details } = await ensureRecommenderDetails();
    const translated = await callJson("/rl/translate-details", { details });
    return buildSignoff(translated.details || {});
  }

  async function handleRlGenerateCn() {
    const draftText = document.getElementById("rlDraftInput").value.trim();
    const recommenderSource = getRecommenderSourceText();
    const studentName = document.getElementById("rlStudentName").value.trim();
    const studentGender = document.getElementById("rlStudentGender").value;
    if (!draftText || !studentName || !recommenderSource) {
      setLocalStatus("rlStatus", "请先填写学生姓名、推荐人信息和素材文本", true);
      return;
    }

    try {
      setGlobalStatus("RL写作：开始生成中文草稿", "running");
      const { details } = await ensureRecommenderDetails();
      const data = await callJson("/rl/generate-chinese", {
        draft_text: draftText,
        student_name: studentName,
        student_gender: studentGender,
        recommender_details: details,
      });
      document.getElementById("rlChinese").value = appendChineseSignoff(data.text || "", details);
      persistCache();
      setLocalStatus("rlStatus", "生成完成");
      setGlobalStatus("RL写作：开始生成中文草稿", "done");
    } catch (e) {
      setLocalStatus("rlStatus", String(e.message || e), true);
      setGlobalStatus("RL写作：开始生成中文草稿", "error");
    }
  }

  async function handleRlRefineCn() {
    const text = document.getElementById("rlChinese").value.trim();
    if (!text) {
      setLocalStatus("rlStatus", "请先提供中文草稿", true);
      return;
    }

    try {
      const { body } = splitChineseDraftAndSignoff(text);
      const { details } = await ensureRecommenderDetails();
      setGlobalStatus("RL写作：中文修改", "running");
      const data = await callJson("/rl/refine-chinese", {
        text: body || text,
        student_gender: document.getElementById("rlStudentGender").value,
        recommender_signoff: "",
      });
      document.getElementById("rlChinese").value = appendChineseSignoff(data.text || "", details);
      persistCache();
      setLocalStatus("rlStatus", "修改完成");
      setGlobalStatus("RL写作：中文修改", "done");
    } catch (e) {
      setLocalStatus("rlStatus", String(e.message || e), true);
      setGlobalStatus("RL写作：中文修改", "error");
    }
  }

  async function handleRlTranslateEn() {
    const chineseDraft = document.getElementById("rlChinese").value.trim();
    if (!chineseDraft) {
      setLocalStatus("rlStatus", "请先提供中文草稿", true);
      return;
    }

    try {
      const { body } = splitChineseDraftAndSignoff(chineseDraft);
      const signoff = (await buildEnglishSignoffFromDetails()).trim();
      if (!signoff) throw new Error("无法生成推荐人英文落款");
      setGlobalStatus("RL写作：英文翻译", "running");
      const data = await callJson("/rl/finalize-english", {
        chinese_draft: body || chineseDraft,
        student_gender: document.getElementById("rlStudentGender").value,
        recommender_signoff: signoff,
      });
      document.getElementById("rlEnglish").value = data.text || "";
      persistCache();
      setLocalStatus("rlStatus", "翻译完成");
      setGlobalStatus("RL写作：英文翻译", "done");
    } catch (e) {
      setLocalStatus("rlStatus", String(e.message || e), true);
      setGlobalStatus("RL写作：英文翻译", "error");
    }
  }

  async function handleRlRefineEn() {
    const text = document.getElementById("rlEnglish").value.trim();
    if (!text) {
      setLocalStatus("rlStatus", "请先提供英文成稿", true);
      return;
    }

    try {
      const signoff = (await buildEnglishSignoffFromDetails()).trim();
      setGlobalStatus("RL写作：英文修改", "running");
      const data = await callJson("/rl/refine-english", {
        text,
        student_gender: document.getElementById("rlStudentGender").value,
        recommender_signoff: signoff,
      });
      document.getElementById("rlEnglish").value = data.text || "";
      persistCache();
      setLocalStatus("rlStatus", "修改完成");
      setGlobalStatus("RL写作：英文修改", "done");
    } catch (e) {
      setLocalStatus("rlStatus", String(e.message || e), true);
      setGlobalStatus("RL写作：英文修改", "error");
    }
  }
  document.getElementById("rlGenerateCnBtn").addEventListener("click", handleRlGenerateCn);
  document.getElementById("rlRefineCnBtn").addEventListener("click", handleRlRefineCn);
  document.getElementById("rlTranslateEnBtn").addEventListener("click", handleRlTranslateEn);
  document.getElementById("rlRefineEnBtn").addEventListener("click", handleRlRefineEn);
  document.getElementById("rlCopyBtn").addEventListener("click", async () => {
    try {
      await copyText(document.getElementById("rlEnglish").value);
      setLocalStatus("rlStatus", "已复制全文");
    } catch (e) {
      setLocalStatus("rlStatus", String(e.message || e), true);
    }
  });
}
