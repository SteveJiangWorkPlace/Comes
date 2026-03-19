import { callForm, callJson } from "../api.js";
import { copyText, resetProgress, setGlobalStatus, setProgress, setStatus } from "../status.js";

function sanitizeDraftText(text) {
  let out = (text || "").replace(/\r\n/g, "\n");
  out = out.replace(/\[\[\s*LOG(?:\s*[-_ ]\s*IC|IC)\s*\]\]/gi, "");
  out = out.replace(/\[\[\s*DRAFT\s*\]\]/gi, "");
  out = out.replace(/===\s*SECTION\s*===/gi, "");
  return out.trim();
}

function sanitizeSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((s) => ({
    logic: sanitizeDraftText(s?.logic || ""),
    draft: sanitizeDraftText(s?.draft || ""),
  }));
}

function containsAnnotation(text) {
  return (text.includes("[") && text.includes("]")) || (text.includes("【") && text.includes("】"));
}

function inferTopic(logic, draft) {
  if (!logic) {
    const fromDraft = (draft || "").split("\n").find((x) => x.trim());
    return fromDraft ? fromDraft.trim().slice(0, 28) : "Section";
  }
  const firstLine = logic.split("\n").find((x) => x.trim());
  return firstLine ? firstLine.trim().slice(0, 28) : "Section";
}

function setSectionBusy(actions, statusNode, busy, message = "") {
  actions.querySelectorAll("button").forEach((btn) => {
    btn.disabled = busy;
  });
  statusNode.textContent = message;
}

export function mountPsEdit(state, persistCache) {
  const sectionsEl = document.getElementById("sections");
  const finalPreviewEl = document.getElementById("finalPreview");
  state.sections = sanitizeSections(state.sections);

  function rebuildPreview() {
    const ordered = [...state.confirmed].sort((a, b) => a - b);
    const paragraphs = [];
    for (const idx of ordered) {
      const text = state.confirmedContent.get(idx);
      if (text && text.trim()) paragraphs.push(text);
    }
    finalPreviewEl.value = paragraphs.join("\n\n");
    persistCache();
  }

  function renderSections() {
    sectionsEl.innerHTML = "";
    state.sections.forEach((section, idx) => {
      const item = document.createElement("div");
      item.className = "section-item";

      const head = document.createElement("div");
      head.className = "section-head";
      const title = document.createElement("div");
      title.className = "section-title";
      const renderTitle = () => {
        const confirmedMark = state.confirmed.has(idx) ? " ✓" : "";
        const deAiMark = section.deAiDone ? " · 已去AI化" : "";
        title.textContent = `${idx + 1}. ${inferTopic(section.logic, section.draft)}${confirmedMark}${deAiMark}`;
      };
      renderTitle();
      head.appendChild(title);
      item.appendChild(head);

      const logic = document.createElement("div");
      logic.className = "section-logic";
      logic.textContent = (section.logic || "（未返回逻辑说明）").trim();
      item.appendChild(logic);

      const ta = document.createElement("textarea");
      ta.rows = 9;
      ta.value = sanitizeDraftText(section.draft || "");
      ta.addEventListener("input", () => {
        state.sections[idx].draft = ta.value;
        if (state.sections[idx].deAiDone) {
          state.sections[idx].deAiDone = false;
          renderTitle();
        }
        persistCache();
      });
      ta.addEventListener("blur", () => {
        const cleaned = sanitizeDraftText(ta.value);
        if (cleaned !== ta.value) {
          ta.value = cleaned;
          state.sections[idx].draft = cleaned;
          persistCache();
        }
      });
      item.appendChild(ta);

      const actions = document.createElement("div");
      actions.className = "section-actions";
      const localStatus = document.createElement("div");
      localStatus.className = "section-status";

      const run = async (path, statusText, payload) => {
        setGlobalStatus(`PS修改：段落 ${idx + 1} ${statusText}`, "running");
        setSectionBusy(actions, localStatus, true, `${statusText}中...`);
        const data = await callJson(path, payload);
        ta.value = sanitizeDraftText(data.text || "");
        state.sections[idx].draft = ta.value;
        if (path !== "/de-ai" && state.sections[idx].deAiDone) {
          state.sections[idx].deAiDone = false;
          renderTitle();
        }
        setSectionBusy(actions, localStatus, false, `${statusText}完成`);
        setGlobalStatus(`PS修改：段落 ${idx + 1} ${statusText}`, "done");
        persistCache();
      };

      const refineBtn = document.createElement("button");
      refineBtn.textContent = "执行修改";
      refineBtn.onclick = async () => {
        if (!containsAnnotation(ta.value)) {
          setStatus(`第 ${idx + 1} 段未发现批注标记`, true);
          return;
        }
        try {
          await run("/refine", "执行修改", { text: ta.value });
        } catch (e) {
          setSectionBusy(actions, localStatus, false, "");
          setStatus(String(e.message || e), true);
          setGlobalStatus(`PS修改：段落 ${idx + 1} 执行修改`, "error");
        }
      };

      const translateBtn = document.createElement("button");
      translateBtn.textContent = "英文翻译";
      translateBtn.onclick = async () => {
        try {
          await run("/translate", "英文翻译", { text: ta.value, style: "UK" });
        } catch (e) {
          setSectionBusy(actions, localStatus, false, "");
          setStatus(String(e.message || e), true);
          setGlobalStatus(`PS修改：段落 ${idx + 1} 英文翻译`, "error");
        }
      };

      const deAiBtn = document.createElement("button");
      deAiBtn.textContent = "去AI化";
      deAiBtn.onclick = async () => {
        try {
          await run("/de-ai", "去AI化", { text: ta.value });
          state.sections[idx].deAiDone = true;
          renderTitle();
          persistCache();
        } catch (e) {
          setSectionBusy(actions, localStatus, false, "");
          setStatus(String(e.message || e), true);
          setGlobalStatus(`PS修改：段落 ${idx + 1} 去AI化`, "error");
        }
      };

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "确认段落";
      confirmBtn.className = "primary";
      confirmBtn.onclick = () => {
        ta.value = sanitizeDraftText(ta.value);
        state.confirmed.add(idx);
        state.confirmedContent.set(idx, ta.value);
        renderTitle();
        localStatus.textContent = "已确认";
        rebuildPreview();
        setGlobalStatus(`PS修改：段落 ${idx + 1} 已确认`, "done");
        persistCache();
      };

      actions.appendChild(refineBtn);
      actions.appendChild(translateBtn);
      actions.appendChild(deAiBtn);
      actions.appendChild(confirmBtn);
      item.appendChild(actions);
      item.appendChild(localStatus);
      sectionsEl.appendChild(item);
    });
  }

  document.getElementById("generateBtn").addEventListener("click", async () => {
    const oldPs = document.getElementById("oldPs").value.trim();
    const targetSchool = document.getElementById("targetSchool").value.trim();
    const targetMajor = document.getElementById("targetMajor").value.trim();
    const newCourseText = document.getElementById("courseText").value.trim();
    const strategyText = document.getElementById("strategyText").value.trim();
    const images = document.getElementById("images").files;

    if (!oldPs || !targetSchool) {
      setStatus("请至少提供原始文书和目标学校", true);
      return;
    }

    const form = new FormData();
    form.append("old_ps", oldPs);
    form.append("target_school", targetSchool);
    form.append("target_major", targetMajor);
    form.append("new_course_text", newCourseText);
    form.append("strategy_text", strategyText);
    for (const file of images) form.append("images", file);

    try {
      setGlobalStatus("PS修改：开始生成", "running");
      setProgress(3, "任务提交中");
      setStatus("生成中...");

      const res = await callForm("/generate-stream", form);
      if (!res.body) throw new Error("后端未返回流式结果");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let doneData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const row = line.trim();
          if (!row) continue;
          let evt;
          try {
            evt = JSON.parse(row);
          } catch {
            continue;
          }
          if (evt.event === "progress") {
            setProgress(evt.progress ?? 0, evt.message || "");
            setGlobalStatus(`PS修改：${evt.message || "处理中"}`, "running");
          } else if (evt.event === "done") {
            doneData = evt;
            setProgress(100, "完成");
            setGlobalStatus("PS修改：生成完成", "done");
          } else if (evt.event === "error") {
            throw new Error(evt.message || "生成失败");
          }
        }
      }

      if (!doneData) throw new Error("未收到最终结果");
      state.sections = sanitizeSections(doneData.sections || []);
      state.confirmed.clear();
      state.confirmedContent.clear();
      finalPreviewEl.value = "";
      renderSections();
      persistCache();
      setStatus(`已生成 ${state.sections.length} 段，模型：${doneData.model || "-"}`);
    } catch (e) {
      resetProgress();
      setStatus(String(e.message || e), true);
      setGlobalStatus("PS修改：生成失败", "error");
    }
  });

  document.getElementById("copyAllBtn").addEventListener("click", async () => {
    try {
      await copyText(finalPreviewEl.value);
      setStatus("已复制全文");
      setGlobalStatus("PS修改：复制全文", "done");
    } catch (e) {
      setStatus(String(e.message || e), true);
      setGlobalStatus("PS修改：复制全文", "error");
    }
  });

  return { renderSections };
}
