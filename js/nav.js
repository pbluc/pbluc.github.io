/* ---------- nav icon + active section ---------- */
if (CONFIG.navIcon) $("#railIcon").innerHTML = `<img src="${CONFIG.navIcon}" alt="">`;
const navLinks = [...document.querySelectorAll(".rail a.nav")];
const sectionIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section").forEach(s => sectionIO.observe(s));

/* ---------- reveal on scroll (content stays readable at rest) ---------- */
if (!reduced) {
  const riseIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove("pre"); riseIO.unobserve(e.target); }
  }), { threshold: .15 });
  document.querySelectorAll(".rise").forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); riseIO.observe(el); }
  });
}
