/* ---------- portfolio carousel ---------- */
const ring = $("#ring"), dots = $("#dots"), car = $("#carousel");
let idx = 0;
ring.innerHTML = PROJECTS.map(p => `
  <article class="card" aria-label="${p.name}">
    <div class="model-slot">${CONFIG.projectModels[p.id] ? modelEl(CONFIG.projectModels[p.id]) : '<div class="cube" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>'}</div>
    <span class="when">${p.when}</span>
    <h3>${p.name}</h3>
    <p>${p.blurb}</p>
    <ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join("")}</ul>
    ${p.link ? `<a class="card-link" href="${p.link.href}" target="_blank" rel="noopener" aria-label="${p.link.label}" title="${p.link.label}">${ICONS[p.link.icon]}</a>`
             : `<span class="card-nolink">Research project · no public link</span>`}
  </article>`).join("");
dots.innerHTML = PROJECTS.map((p, i) => `<button aria-label="Show ${p.name}"></button>`).join("");
const cards = [...ring.children], dotBtns = [...dots.children];
function layout() {
  const n = cards.length, active = ((idx % n) + n) % n, w = cards[0].offsetWidth;
  const small = innerWidth < 760, spread = small ? w * 0.55 : w * 0.78;
  cards.forEach((c, i) => {
    let off = i - active; if (off > n / 2) off -= n; if (off < -n / 2) off += n;
    const a = Math.abs(off);
    c.style.transform = `translateX(${off * spread}px) translateZ(${-a * (small ? 220 : 260)}px) rotateY(${-off * 38}deg)`;
    c.style.zIndex = 10 - a;
    c.style.opacity = a > 1.5 ? "0" : ""; c.style.pointerEvents = a > 1.5 ? "none" : "";
  });
  car.style.height = Math.max(...cards.map(c => c.offsetHeight)) + 60 + "px";
}
function go(n) {
  idx = n;
  const active = ((idx % cards.length) + cards.length) % cards.length;
  cards.forEach((c, i) => { c.classList.toggle("front", i === active); c.setAttribute("aria-hidden", i !== active); });
  dotBtns.forEach((d, i) => d.classList.toggle("on", i === active));
  layout();
}
cards.forEach((c, i) => c.addEventListener("click", () => { if (!c.classList.contains("front")) dotBtns[i].click(); }));
$("#prev").onclick = () => go(idx - 1);
$("#next").onclick = () => go(idx + 1);
dotBtns.forEach((d, i) => d.onclick = () => {
  const cur = ((idx % cards.length) + cards.length) % cards.length;
  let delta = i - cur; if (delta > cards.length / 2) delta -= cards.length; if (delta < -cards.length / 2) delta += cards.length;
  go(idx + delta);
});
car.addEventListener("keydown", e => { if (e.key === "ArrowRight") go(idx + 1); if (e.key === "ArrowLeft") go(idx - 1); });
let dragX = null;
car.addEventListener("pointerdown", e => { if (!e.target.closest("a, model-viewer")) dragX = e.clientX; });
addEventListener("pointerup", e => {
  if (dragX === null) return;
  const d = e.clientX - dragX; dragX = null;
  if (Math.abs(d) > 40) go(idx + (d < 0 ? 1 : -1));
});
addEventListener("resize", layout);
document.fonts && document.fonts.ready.then(layout);
go(0);
