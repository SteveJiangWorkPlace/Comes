import { API_BASE } from "./config.js";

function formatErrorDetail(detail) {
  if (!detail) return "Request failed";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((x) => String(x)).join("; ");

  const msg = detail.message || detail.error || detail.detail || "Request failed";
  const violations = Array.isArray(detail.violations) ? detail.violations : [];
  if (violations.length > 0) {
    return `${msg}；违规项：${violations.join(" | ")}`;
  }
  return String(msg);
}

export async function callJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const txt = await res.text();
  let data;
  try {
    data = txt ? JSON.parse(txt) : {};
  } catch {
    data = { detail: txt };
  }

  if (!res.ok) {
    throw new Error(formatErrorDetail(data.detail));
  }
  return data;
}

export async function callForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Request failed");
  }
  return res;
}

export async function getJson(path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatErrorDetail(data.detail));
  }
  return data;
}

export async function downloadForm(path, formData, fallbackFilename) {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Request failed");
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition") || "";
  const filename = contentDisposition.match(/filename="?([^"]+)"?/i)?.[1] || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
