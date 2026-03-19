import { CACHE_KEY } from "./config.js";

export const state = {
  activeModule: "ps-edit",
  sections: [],
  confirmed: new Set(),
  confirmedContent: new Map(),
};

export function getFormSnapshot() {
  const form = {};
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    const id = el.id;
    if (!id || el.type === "file") return;
    form[id] = el.type === "checkbox" ? !!el.checked : el.value;
  });
  return form;
}

export function persistCache() {
  const payload = {
    activeModule: state.activeModule,
    form: getFormSnapshot(),
    psEditState: {
      sections: state.sections,
      confirmed: [...state.confirmed],
      confirmedContent: [...state.confirmedContent.entries()],
    },
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function restoreCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}
