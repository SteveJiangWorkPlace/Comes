import { MODULE_ORDER } from "./config.js";
import { mountCv } from "./modules/cv.js";
import { mountPsEdit } from "./modules/psEdit.js";
import { mountRl } from "./modules/rl.js";
import { resetProgress, setGlobalStatus, setLocalStatus, setStatus } from "./status.js";
import { clearCache, persistCache, restoreCache, state } from "./store.js";

function switchModule(moduleName) {
  if (!MODULE_ORDER.includes(moduleName)) return;
  state.activeModule = moduleName;
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.module === moduleName);
  });
  document.querySelectorAll(".module-page").forEach((page) => {
    page.classList.toggle("active", page.id === `module-${moduleName}`);
  });
  persistCache();
}

function applyFormSnapshot(payload) {
  const form = payload?.form || {};
  Object.entries(form).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = !!value;
    } else {
      el.value = value || "";
    }
  });
}

function applyPsEditState(payload, renderSections) {
  const saved = payload?.psEditState || {};
  state.sections = Array.isArray(saved.sections) ? saved.sections : [];
  state.confirmed = new Set(Array.isArray(saved.confirmed) ? saved.confirmed : []);
  state.confirmedContent = new Map(Array.isArray(saved.confirmedContent) ? saved.confirmedContent : []);
  if (state.sections.length > 0) {
    renderSections();
    setStatus(`已从缓存恢复 ${state.sections.length} 段内容`);
  }
}

function bindGlobalEvents() {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    if (el.type === "file") return;
    el.addEventListener("input", persistCache);
    el.addEventListener("change", persistCache);
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchModule(btn.dataset.module));
  });

  document.addEventListener("keydown", (e) => {
    const activeTag = (document.activeElement?.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(activeTag)) return;
    if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    const currentIndex = MODULE_ORDER.indexOf(state.activeModule);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;
    const delta = e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (safeIndex + delta + MODULE_ORDER.length) % MODULE_ORDER.length;
    switchModule(MODULE_ORDER[nextIndex]);
  });

  document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (!window.confirm("确定清空并重新开始吗？")) return;

    clearCache();
    state.sections = [];
    state.confirmed.clear();
    state.confirmedContent.clear();

    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "file") {
        el.value = "";
      } else if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      } else if (el.type === "checkbox") {
        el.checked = true;
      } else {
        el.value = "";
      }
    });

    document.getElementById("sections").innerHTML = "";
    resetProgress();
    setStatus("已清空");
    setLocalStatus("cvStatus", "");
    setLocalStatus("rlStatus", "");
    setGlobalStatus("空闲", "idle");
  });
}

async function bootstrap() {
  const payload = restoreCache();
  applyFormSnapshot(payload);

  const { renderSections } = mountPsEdit(state, persistCache);
  applyPsEditState(payload, renderSections);

  mountCv(persistCache);
  mountRl(persistCache);

  bindGlobalEvents();
  switchModule(payload?.activeModule || "ps-edit");
  if (!document.querySelector(".module-page.active")) {
    switchModule("ps-edit");
  }
  setGlobalStatus("空闲", "idle");
}

bootstrap();
