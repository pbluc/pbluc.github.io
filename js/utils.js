/* Shared helpers used by the other scripts. */

const ICONS = {
  github: '<svg viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 16 8c0-4.4-3.6-8-8-8z"/></svg>',
  play: '<svg viewBox="0 0 16 16"><path d="M5 3.2v9.6L12.8 8z"/></svg>'
};

const $ = s => document.querySelector(s);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- optional 3D model loader ---------- */
const anyModel = CONFIG.avatar.staticModel || CONFIG.avatar.animatedModel || Object.values(CONFIG.projectModels).some(Boolean);
if (anyModel) {
  const s = document.createElement("script");
  s.type = "module"; s.src = "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
  document.head.appendChild(s);
}
function modelEl(src, extra = "") {
  return `<model-viewer src="${src}" camera-controls disable-zoom auto-rotate rotation-per-second="18deg" interaction-prompt="none" shadow-intensity="0" ${extra}></model-viewer>`;
}
