import { callForm, callJson, downloadForm } from "../api.js";
import { copyText, setGlobalStatus, setLocalStatus } from "../status.js";

export function mountCv(persistCache) {
  async function handleCvGenerate() {
    const text = document.getElementById("cvInput").value.trim();
    const files = document.getElementById("cvFiles").files;
    if (!text && (!files || files.length === 0)) {
      setLocalStatus("cvStatus", "请先输入或上传 CV 素材", true);
      return;
    }

    try {
      setGlobalStatus("CV写作：开始生成", "running");
      const form = new FormData();
      form.append("text", text);
      for (const file of files) form.append("files", file);
      const res = await callForm("/cv/generate", form);
      const data = await res.json();
      document.getElementById("cvJson").value = JSON.stringify(data.resume_json || {}, null, 2);
      persistCache();
      setLocalStatus("cvStatus", "生成完成");
      setGlobalStatus("CV写作：开始生成", "done");
    } catch (e) {
      setLocalStatus("cvStatus", String(e.message || e), true);
      setGlobalStatus("CV写作：开始生成", "error");
    }
  }

  async function handleCvGaps() {
    const raw = document.getElementById("cvJson").value.trim();
    if (!raw) {
      setLocalStatus("cvStatus", "请先生成或粘贴 CV JSON", true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setGlobalStatus("CV写作：缺失项分析", "running");
      const data = await callJson("/cv/analyze-gaps", { resume_json: parsed });
      document.getElementById("cvGapReport").value = data.report || "";
      persistCache();
      setLocalStatus("cvStatus", "分析完成");
      setGlobalStatus("CV写作：缺失项分析", "done");
    } catch (e) {
      setLocalStatus("cvStatus", String(e.message || e), true);
      setGlobalStatus("CV写作：缺失项分析", "error");
    }
  }

  async function handleCvUpdate() {
    const raw = document.getElementById("cvJson").value.trim();
    const feedback = document.getElementById("cvFeedback").value.trim();
    if (!raw || !feedback) {
      setLocalStatus("cvStatus", "请先提供 JSON 和更新指令", true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setGlobalStatus("CV写作：执行修改", "running");
      const data = await callJson("/cv/update", { current_json: parsed, feedback });
      document.getElementById("cvJson").value = JSON.stringify(data.resume_json || {}, null, 2);
      persistCache();
      setLocalStatus("cvStatus", "修改完成");
      setGlobalStatus("CV写作：执行修改", "done");
    } catch (e) {
      setLocalStatus("cvStatus", String(e.message || e), true);
      setGlobalStatus("CV写作：执行修改", "error");
    }
  }

  async function handleDownload(path, filename, successText) {
    const raw = document.getElementById("cvJson").value.trim();
    if (!raw) {
      setLocalStatus("cvStatus", "请先生成或粘贴 CV JSON", true);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const form = new FormData();
      form.append("resume_json", JSON.stringify(parsed));
      await downloadForm(path, form, filename);
      setLocalStatus("cvStatus", successText);
    } catch (e) {
      setLocalStatus("cvStatus", String(e.message || e), true);
    }
  }

  document.getElementById("cvGenerateBtn").addEventListener("click", handleCvGenerate);
  document.getElementById("cvGapBtn").addEventListener("click", handleCvGaps);
  document.getElementById("cvUpdateBtn").addEventListener("click", handleCvUpdate);
  document.getElementById("cvWordBtn").addEventListener("click", () =>
    handleDownload("/cv/export-docx", "Resume_Optimized.docx", "已下载Word")
  );
  document.getElementById("cvCopyBtn").addEventListener("click", async () => {
    try {
      await copyText(document.getElementById("cvJson").value);
      setLocalStatus("cvStatus", "已复制全文");
    } catch (e) {
      setLocalStatus("cvStatus", String(e.message || e), true);
    }
  });
}
