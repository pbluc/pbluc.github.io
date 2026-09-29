/* ---------- experience: one role at a time ---------- */
const roles = [...document.querySelectorAll("#roles .role")], roleTabs = $("#roleTabs");
roleTabs.innerHTML = roles.map((r, i) =>
  `<button class="role-tab" role="tab" id="roletab${i}" aria-controls="role${i}"><span class="t-name">${ROLE_TABS[i].name}</span><span class="t-year">${ROLE_TABS[i].year}</span></button>`).join("");
const tabBtns = [...roleTabs.children];
let roleIdx = 0;
function showRole(n, focus) {
  n = (n + roles.length) % roles.length;
  const dir = n > roleIdx || (roleIdx === roles.length - 1 && n === 0) ? 1 : -1;
  roles.forEach((r, i) => {
    r.id = "role" + i; r.setAttribute("role", "tabpanel"); r.setAttribute("aria-labelledby", "roletab" + i);
    r.style.setProperty("--dir", dir);
    const was = r.classList.contains("on");
    r.classList.toggle("on", i === n);
    r.classList.toggle("leaving", was && i !== n);
    if (i !== n && !was) r.classList.remove("leaving");
  });
  tabBtns.forEach((b, i) => { b.setAttribute("aria-selected", i === n); b.tabIndex = i === n ? 0 : -1; });
  if (focus) tabBtns[n].focus();
  $("#roleCount").textContent = `${n + 1} / ${roles.length}`;
  roleIdx = n;
}
tabBtns.forEach((b, i) => b.addEventListener("click", () => showRole(i)));
roleTabs.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") showRole(roleIdx + 1, true);
  if (e.key === "ArrowLeft") showRole(roleIdx - 1, true);
});
$("#rolePrev").onclick = () => showRole(roleIdx - 1);
$("#roleNext").onclick = () => showRole(roleIdx + 1);
let roleX = null;
$("#roles").addEventListener("pointerdown", e => { if (!e.target.closest("a")) roleX = e.clientX; });
$("#roles").addEventListener("pointerup", e => {
  if (roleX === null) return; const d = e.clientX - roleX; roleX = null;
  if (Math.abs(d) > 50) showRole(roleIdx + (d < 0 ? 1 : -1));
});
showRole(0);
