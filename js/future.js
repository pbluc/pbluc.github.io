/* ---------- what's next: floating phrases ---------- */
const field = $("#field");
const phrases = Object.keys(CONFIG.futureAudio);
const starts = [[.12, .22], [.46, .52], [.2, .78]];
const nodes = phrases.map((text, i) => {
  const b = document.createElement("button");
  b.className = "phrase show"; b.textContent = text;
  b.style.fontSize = ["3.4rem", "2.4rem", "4rem"][i];
  field.appendChild(b);
  place(b, ...starts[i]);
  b.addEventListener("click", () => speakPhrase(b, text));
  return b;
});
function place(el, fx, fy) {
  const maxX = Math.max(0, field.clientWidth - el.offsetWidth), maxY = Math.max(0, field.clientHeight - el.offsetHeight);
  el.style.left = Math.min(maxX, fx * field.clientWidth) + "px";
  el.style.top = Math.min(maxY, fy * field.clientHeight) + "px";
}
function overlaps(el) {
  const r = el.getBoundingClientRect();
  return nodes.some(n => n !== el && n.classList.contains("show") && (() => {
    const o = n.getBoundingClientRect();
    return !(r.right < o.left - 12 || r.left > o.right + 12 || r.bottom < o.top - 12 || r.top > o.bottom + 12);
  })());
}
function drift(el) {
  if (el.classList.contains("speaking")) return setTimeout(() => drift(el), 1500);
  el.classList.remove("show");
  setTimeout(() => {
    const small = innerWidth < 760;
    el.style.fontSize = (small ? rand(1.4, 2.8) : rand(1.6, 5)).toFixed(2) + "rem";
    for (let t = 0; t < 8; t++) { place(el, Math.random(), Math.random()); if (!overlaps(el)) break; }
    el.classList.add("show");
    setTimeout(() => drift(el), rand(3200, 5600));
  }, 1300);
}
if (!reduced) nodes.forEach((n, i) => setTimeout(() => drift(n), 2600 + i * 1500));
let phraseAudio = null;
function speakPhrase(el, text) {
  nodes.forEach(n => n.classList.remove("speaking"));
  if (phraseAudio) phraseAudio.pause();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  el.classList.add("speaking");
  const done = () => el.classList.remove("speaking");
  const src = CONFIG.futureAudio[text];
  if (src) {
    phraseAudio = new Audio(src); phraseAudio.onended = done;
    phraseAudio.play().catch(done);
  } else if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text); u.onend = done; u.onerror = done;
    speechSynthesis.speak(u); setTimeout(done, 4000);
  } else setTimeout(done, 1500);
}
addEventListener("resize", () => nodes.forEach(n => place(n, parseFloat(n.style.left) / field.clientWidth || .1, parseFloat(n.style.top) / field.clientHeight || .1)));
