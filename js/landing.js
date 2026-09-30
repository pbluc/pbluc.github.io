/* ---------- landing: meet + introduction ---------- */
const avatar = $("#avatar"), caption = $("#caption"), intro = $("#intro"), meetBtn = $("#meetBtn");
let met = false, playToken = 0, audio = null;

const hasAvatarModel = CONFIG.avatar.staticModel || CONFIG.avatar.animatedModel;
if (hasAvatarModel) {
  avatar.innerHTML = modelEl(hasAvatarModel, 'id="avatarModel"');
} else {
  // No model yet: hide the avatar and its hint. "Meet me" comes back after
  // each introduction so visitors can replay it.
  avatar.hidden = true;
  document.querySelector(".avatar-hint").hidden = true;
}
function setTalking(on) {
  avatar.classList.toggle("talking", on);
  const mv = document.getElementById("avatarModel");
  if (!mv) return;
  const { staticModel, animatedModel, animationName } = CONFIG.avatar;
  if (on && animatedModel) {
    if (mv.getAttribute("src") !== animatedModel) mv.setAttribute("src", animatedModel);
    if (animationName) mv.setAttribute("animation-name", animationName);
    mv.setAttribute("autoplay", ""); mv.play && mv.play();
  } else if (!on) {
    mv.pause && mv.pause();
    if (staticModel && mv.getAttribute("src") !== staticModel) mv.setAttribute("src", staticModel);
  }
}
function showCaption(text) {
  if (caption.textContent === text) return;
  caption.classList.add("swap");
  setTimeout(() => { caption.textContent = text; caption.classList.remove("swap"); }, 260);
}
function finishIntro(token) {
  if (token !== playToken) return;
  setTalking(false);
  setTimeout(() => {
    if (token !== playToken) return;
    showCaption("");
    if (!hasAvatarModel) showMeetButton();
  }, 1800);
}
function hideMeetButton() {
  meetBtn.classList.add("gone");
  setTimeout(() => { if (meetBtn.classList.contains("gone")) meetBtn.hidden = true; }, 700);
}
function showMeetButton() {
  // Without an avatar, the button returns in the avatar's place, above the captions
  if (meetBtn.parentElement !== intro) intro.insertBefore(meetBtn, caption);
  meetBtn.hidden = false;
  meetBtn.classList.remove("gone");
}
function stopAll() {
  playToken++;
  if (audio) { audio.pause(); }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
function playIntro() {
  stopAll();
  const token = playToken;
  const cues = CONFIG.introCues;
  setTalking(true);
  if (CONFIG.introAudio) {
    audio = audio || new Audio(CONFIG.introAudio);
    audio.currentTime = 0;
    audio.ontimeupdate = () => {
      if (token !== playToken) return;
      let cur = cues[0]; for (const c of cues) if (audio.currentTime >= c.t) cur = c;
      showCaption(cur.text);
    };
    audio.onended = () => finishIntro(token);
    showCaption(cues[0].text);
    audio.play().catch(() => timedCaptions(token));
    return;
  }
  // No recording yet: use the browser's voice as a stand-in, or captions alone.
  let i = 0;
  const next = () => {
    if (token !== playToken) return;
    if (i >= cues.length) return finishIntro(token);
    const line = cues[i++].text;
    showCaption(line);
    let done = false;
    const go = () => { if (!done) { done = true; setTimeout(next, 250); } };
    setTimeout(go, 1200 + line.length * 75); // safety net if the voice never reports back
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(line);
      u.rate = 1; u.pitch = 1.1; u.onend = go; u.onerror = go;
      speechSynthesis.speak(u);
    }
  };
  next();
}
function timedCaptions(token) {
  const cues = CONFIG.introCues; let i = 0;
  const step = () => {
    if (token !== playToken) return;
    if (i >= cues.length) return finishIntro(token);
    showCaption(cues[i].text);
    setTimeout(step, 1200 + cues[i++].text.length * 60);
  };
  step();
}
function meet() {
  hideMeetButton();
  if (!met) {
    met = true;
    intro.classList.add("on");
    hideRoamer();
  }
  setTimeout(playIntro, 500);
}
meetBtn.addEventListener("click", meet);
avatar.addEventListener("click", playIntro);

/* ---------- the roaming "Meet me" ---------- */
const roamer = $("#roamer");
let landingVisible = true, roamTimer = null;
new IntersectionObserver(([e]) => { landingVisible = e.isIntersecting; }, { threshold: .25 }).observe($("#me"));
function hideRoamer() { roamer.classList.remove("show"); }
function roam() {
  if (met) return;
  if (!landingVisible && !roamer.classList.contains("show")) {
    const w = 150, h = 50, left = innerWidth > 760 ? 150 : 16, bottom = innerWidth > 760 ? 16 : 90;
    roamer.style.left = rand(left, innerWidth - w - 16) + "px";
    roamer.style.top = rand(24, innerHeight - h - bottom) + "px";
    roamer.classList.add("show");
    setTimeout(hideRoamer, rand(2400, 3400));
  }
  roamTimer = setTimeout(roam, rand(4200, 7500));
}
roamTimer = setTimeout(roam, 3500);
roamer.addEventListener("click", () => {
  hideRoamer();
  $("#me").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  setTimeout(meet, reduced ? 50 : 750);
});
