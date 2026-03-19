export function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = isError ? "#b00020" : "#666666";
}

export function setLocalStatus(id, text, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text || "";
  el.style.color = isError ? "#b00020" : "#666666";
}

export function setGlobalStatus(task, mode = "idle") {
  const taskEl = document.getElementById("globalTaskText");
  const stateEl = document.getElementById("globalStateText");
  if (!taskEl || !stateEl) return;

  const map = {
    idle: { label: "空闲", cls: "is-idle" },
    running: { label: "进行中", cls: "is-running" },
    done: { label: "已完成", cls: "is-done" },
    error: { label: "失败", cls: "is-error" },
  };
  const info = map[mode] || map.idle;
  taskEl.textContent = `当前任务：${task}`;
  stateEl.textContent = info.label;
  stateEl.className = `global-state ${info.cls}`;
}

export function setProgress(percent, message = "") {
  const wrap = document.getElementById("progressWrap");
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");
  const msg = document.getElementById("progressMsg");
  if (!wrap || !fill || !text || !msg) return;

  const safe = Math.max(0, Math.min(100, Number(percent) || 0));
  wrap.hidden = false;
  fill.style.width = `${safe}%`;
  text.textContent = `${safe}%`;
  msg.textContent = message;
}

export function resetProgress() {
  const wrap = document.getElementById("progressWrap");
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");
  const msg = document.getElementById("progressMsg");
  if (!wrap || !fill || !text || !msg) return;

  wrap.hidden = true;
  fill.style.width = "0%";
  text.textContent = "0%";
  msg.textContent = "";
}

export async function copyText(text) {
  if (!text || !text.trim()) throw new Error("没有可复制内容");
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const tmp = document.createElement("textarea");
  tmp.value = text;
  document.body.appendChild(tmp);
  tmp.select();
  document.execCommand("copy");
  document.body.removeChild(tmp);
}
