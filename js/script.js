/* ============================================================
   PRABHAT ❤ SONALI — ROYAL INDIAN WEDDING INVITATION
   script.js  |  Vanilla JavaScript only
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   CONFIG — edit these values easily
------------------------------------------------------------ */
const CONFIG = {
  // Main wedding date & time (03 December 2026, midnight IST)
  weddingDateTime: "2026-12-03T00:00:00+05:30",

  // Contact numbers — also update the tel:/wa.me links in index.html
  phones: ["919931119661", "916200532441"],

  // Background music file (place your royalty-free file at audio/wedding-music.mp3)
  musicSrc: "audio/wedding-music.mp3"
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   1. PRELOADER
------------------------------------------------------------ */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader")?.classList.add("hidden"), 900);
});
// Safety: never trap the user behind the preloader
setTimeout(() => document.getElementById("preloader")?.classList.add("hidden"), 5000);

/* ------------------------------------------------------------
   2. ENVELOPE OPENING EXPERIENCE
------------------------------------------------------------ */
const envelope = document.getElementById("envelope");
const overlay  = document.getElementById("envelope-overlay");
let siteOpened = false;

function openInvitation() {
  if (siteOpened) return;
  siteOpened = true;
  envelope?.classList.add("open");
  burstPetals();                       // celebratory petal burst
  setTimeout(() => overlay?.classList.add("opened"), 1150);
  document.body.style.overflow = "";
  startMusic();                        // music starts only AFTER user interaction
}
document.getElementById("open-btn")?.addEventListener("click", openInvitation);
envelope?.addEventListener("click", openInvitation);
// lock scroll while envelope is shown
document.body.style.overflow = "hidden";

/* ------------------------------------------------------------
   3. FX CANVAS — falling rose petals + golden particles
------------------------------------------------------------ */
const canvas = document.getElementById("fx-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let petals = [], sparkles = [], fxRunning = false;

function sizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
sizeCanvas();
window.addEventListener("resize", sizeCanvas);

function makePetal(burst = false) {
  return {
    x: Math.random() * canvas.width,
    y: burst ? -30 - Math.random() * 200 : -30,
    r: 5 + Math.random() * 8,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.006 + Math.random() * 0.012,
    fallSpeed: 0.5 + Math.random() * 1.2,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    hue: 340 + Math.random() * 15,           // rose pink
    alpha: 0.55 + Math.random() * 0.35
  };
}
function makeSparkle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.8 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.02,
    drift: 0.15 + Math.random() * 0.35
  };
}
function initFX() {
  const base = Math.min(26, Math.floor(window.innerWidth / 55));
  petals = Array.from({ length: prefersReducedMotion ? 0 : base }, () => makePetal());
  sparkles = Array.from({ length: prefersReducedMotion ? 0 : base * 2 }, makeSparkle);
}
function burstPetals() {
  if (prefersReducedMotion || !ctx) return;
  for (let i = 0; i < 60; i++) petals.push(makePetal(true));
}
function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;
  const grd = ctx.createLinearGradient(0, -p.r, 0, p.r);
  grd.addColorStop(0, `hsla(${p.hue},72%,78%,.95)`);
  grd.addColorStop(1, `hsla(${p.hue},65%,58%,.9)`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function fxLoop() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // golden sparkles
  for (const s of sparkles) {
    s.phase += s.speed;
    s.y -= s.drift * 0.3;
    if (s.y < -10) { s.y = canvas.height + 10; s.x = Math.random() * canvas.width; }
    const tw = (Math.sin(s.phase) + 1) / 2;
    ctx.globalAlpha = tw * 0.85;
    ctx.fillStyle = "#e9cf8f";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * (0.6 + tw * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
  // petals
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.sway += p.swaySpeed;
    p.y += p.fallSpeed;
    p.x += Math.sin(p.sway) * 0.9;
    p.rot += p.rotSpeed;
    if (p.y > canvas.height + 40) {
      if (petals.length > 90) { petals.splice(i, 1); continue; }  // trim after burst
      Object.assign(p, makePetal());
    }
    drawPetal(p);
  }
  ctx.globalAlpha = 1;
  if (fxRunning) requestAnimationFrame(fxLoop);
}
// enable FX only after the envelope opens; skip on low-end / reduced-motion
function startFX() {
  if (prefersReducedMotion || fxRunning) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    document.body.classList.add("low-fx"); return;
  }
  fxRunning = true;
  initFX();
  requestAnimationFrame(fxLoop);
}
document.getElementById("open-btn")?.addEventListener("click", startFX);

/* ------------------------------------------------------------
   4. LIVE WEDDING COUNTDOWN  (03 December 2026)
------------------------------------------------------------ */
const target = new Date(CONFIG.weddingDateTime).getTime();
const cdEls = {
  d: document.getElementById("cd-days"),
  h: document.getElementById("cd-hours"),
  m: document.getElementById("cd-mins"),
  s: document.getElementById("cd-secs")
};
let lastVals = { d: null, h: null, m: null, s: null };
function setNum(el, key, val) {
  if (!el || lastVals[key] === val) return;
  el.textContent = String(val).padStart(2, "0");
  el.classList.remove("tick");
  void el.offsetWidth;               // restart animation
  el.classList.add("tick");
  lastVals[key] = val;
}
function tickCountdown() {
  const diff = target - Date.now();
  if (diff <= 0) {
    document.querySelector(".count-grid")?.style.setProperty("display", "none");
    const done = document.querySelector(".countdown-done");
    if (done) done.style.display = "block";
    return;
  }
  setNum(cdEls.d, "d", Math.floor(diff / 86400000));
  setNum(cdEls.h, "h", Math.floor(diff / 3600000) % 24);
  setNum(cdEls.m, "m", Math.floor(diff / 60000) % 60);
  setNum(cdEls.s, "s", Math.floor(diff / 1000) % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ------------------------------------------------------------
   5. SCROLL REVEAL (IntersectionObserver)
------------------------------------------------------------ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------
   6. CINEMATIC SCENE VIDEOS — play only the scene in view
------------------------------------------------------------ */
const scenes = document.querySelectorAll(".scene video");
const sceneObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      v.play().catch(() => {/* autoplay blocked — poster/first frame shows */});
    } else {
      v.pause();
    }
  });
}, { threshold: 0.35 });
scenes.forEach(v => sceneObserver.observe(v));

/* ------------------------------------------------------------
   7. GALLERY — category filter + lightbox
------------------------------------------------------------ */
const filterBtns = document.querySelectorAll(".filter-btn");
const gItems = document.querySelectorAll(".g-item");
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.filter;
    gItems.forEach(item => {
      const show = cat === "all" || item.dataset.cat === cat;
      item.classList.toggle("hide", !show);
      if (show) { item.style.animation = "none"; void item.offsetWidth; item.style.animation = ""; }
    });
  });
});

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbCap = document.getElementById("lb-caption");
let lbIndex = 0;
function visibleItems() { return [...gItems].filter(i => !i.classList.contains("hide")); }
function showLightbox(i) {
  const items = visibleItems();
  if (!items.length) return;
  lbIndex = (i + items.length) % items.length;
  const it = items[lbIndex];
  const img = it.querySelector("img");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = it.dataset.caption || img.alt || "";
  lightbox?.classList.add("show");
}
gItems.forEach(item => item.addEventListener("click", () => {
  showLightbox(visibleItems().indexOf(item));
}));
document.querySelector(".lb-prev")?.addEventListener("click", e => { e.stopPropagation(); showLightbox(lbIndex - 1); });
document.querySelector(".lb-next")?.addEventListener("click", e => { e.stopPropagation(); showLightbox(lbIndex + 1); });
document.querySelector(".lb-close")?.addEventListener("click", () => lightbox?.classList.remove("show"));
lightbox?.addEventListener("click", e => { if (e.target === lightbox) lightbox.classList.remove("show"); });
document.addEventListener("keydown", e => {
  if (!lightbox?.classList.contains("show")) return;
  if (e.key === "Escape") lightbox.classList.remove("show");
  if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
  if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
});

/* ------------------------------------------------------------
   8. VIDEO GALLERY — click-to-play cards (one at a time)
------------------------------------------------------------ */
const videoCards = document.querySelectorAll(".video-card");
videoCards.forEach(card => {
  const vid = card.querySelector("video");
  card.addEventListener("click", () => {
    if (card.classList.contains("playing")) {
      vid.pause(); card.classList.remove("playing"); return;
    }
    videoCards.forEach(c => {                       // pause every other card
      if (c !== card) { c.querySelector("video").pause(); c.classList.remove("playing"); }
    });
    scenes.forEach(v => v.pause());                 // pause background scenes too
    vid.muted = false;                              // user gesture → sound allowed
    vid.play().catch(() => vid.play());
    card.classList.add("playing");
    vid.addEventListener("ended", () => card.classList.remove("playing"), { once: true });
  });
});

/* ------------------------------------------------------------
   9. BACKGROUND MUSIC — starts only after user interaction
------------------------------------------------------------ */
const audio = document.getElementById("bg-music");
const player = document.getElementById("music-player");
const discBtn = document.getElementById("music-disc");
const volSlider = document.getElementById("music-vol");
if (audio) audio.src = CONFIG.musicSrc;
let musicOn = false;

function startMusic() {
  if (!audio) return;
  audio.volume = volSlider ? volSlider.value : 0.55;
  audio.play().then(() => {
    musicOn = true;
    player?.classList.add("playing");
  }).catch(() => {
    /* audio/wedding-music.mp3 not found yet — user can tap the disc once
       the file is added. Nothing breaks. */
  });
}
discBtn?.addEventListener("click", () => {
  if (musicOn) { audio.pause(); player?.classList.remove("playing"); }
  else { audio.play().catch(() => alert("Add your music file at audio/wedding-music.mp3")); }
  musicOn = !musicOn;
  player?.classList.toggle("playing", musicOn);
});
volSlider?.addEventListener("input", () => { if (audio) audio.volume = volSlider.value; });

/* ------------------------------------------------------------
   10. FLOATING HEARTS (story section decoration)
------------------------------------------------------------ */
const heartsBox = document.querySelector(".floating-hearts");
if (heartsBox && !prefersReducedMotion) {
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.textContent = "❤";
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 12 + Math.random() * 20 + "px";
    s.style.animationDuration = 9 + Math.random() * 12 + "s";
    s.style.animationDelay = Math.random() * 12 + "s";
    heartsBox.appendChild(s);
  }
}

/* ------------------------------------------------------------
   11. SUBTLE PARALLAX on scene text while scrolling
------------------------------------------------------------ */
if (!prefersReducedMotion) {
  const sceneContents = document.querySelectorAll(".scene-content");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    sceneContents.forEach(c => {
      const rect = c.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        c.style.transform = `translateY(${rect.top * -0.08}px)`;
      }
    });
  }, { passive: true });
}

/* ------------------------------------------------------------
   12. 3D TILT on event cards (desktop pointers only)
------------------------------------------------------------ */
if (window.matchMedia("(pointer:fine)").matches && !prefersReducedMotion) {
  document.querySelectorAll(".event-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
      card.style.transform = `translateY(-12px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}
