"use strict";

const $ = id => document.getElementById(id);
const root = document.documentElement;

/* ============================================================
   helpers
   ============================================================ */

function num(value, fallback, min, max) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fileExt(path) {
  return (path.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();
}

function isVideo(path) {
  return ["mp4", "webm", "mov", "m4v"].includes(fileExt(path));
}

function absolute(path) {
  try { return new URL(path, document.baseURI).href; } catch (e) { return path; }
}

/* ============================================================
   media (images and videos that never get stuck)
   ============================================================ */

const liveVideos = [];

function playVideo(video) {
  const attempt = video.play();
  if (attempt && attempt.catch) attempt.catch(() => {});
}

function keepAlive(video) {
  liveVideos.push(video);
  let lastTime = -1;
  let stuckTicks = 0;

  video.addEventListener("loadeddata", () => playVideo(video));
  video.addEventListener("canplay", () => { if (video.paused && !document.hidden) playVideo(video); });
  video.addEventListener("ended", () => { video.currentTime = 0; playVideo(video); });

  setInterval(() => {
    if (document.hidden) return;
    if (video.ended) { video.currentTime = 0; playVideo(video); return; }
    if (video.paused) { playVideo(video); return; }
    if (video.readyState >= 3 && !video.seeking && video.currentTime === lastTime) {
      stuckTicks++;
      if (stuckTicks >= 2) {
        stuckTicks = 0;
        const nearEnd = video.duration && video.currentTime >= video.duration - 0.3;
        video.currentTime = nearEnd ? 0 : video.currentTime + 0.01;
        playVideo(video);
      }
    } else {
      stuckTicks = 0;
    }
    lastTime = video.currentTime;
  }, 1000);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) liveVideos.forEach(playVideo);
});

function media(path, className) {
  if (isVideo(path)) {
    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.preload = "auto";
    ["muted", "playsinline", "webkit-playsinline", "disableremoteplayback"].forEach(a => video.setAttribute(a, ""));
    video.src = path;
    if (className) video.className = className;
    keepAlive(video);
    return video;
  }
  const image = document.createElement("img");
  image.src = path;
  image.alt = "";
  if (className) image.className = className;
  return image;
}

function fillIcon(target, value) {
  target.textContent = "";
  if (!value) return;
  const isFile = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov|m4v)(\?|#|$)/i.test(value);
  const isLink = /^https?:\/\//i.test(value);
  if (isFile || isLink) target.appendChild(media(value));
  else target.textContent = value;
}

function onGesture(task) {
  const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
  const run = event => {
    let result = false;
    try { result = task(event); } catch (e) { result = false; }
    Promise.resolve(result).then(done => {
      if (done) events.forEach(name => window.removeEventListener(name, run, true));
    }).catch(() => {});
  };
  events.forEach(name => window.addEventListener(name, run, true));
}

function flash(el) {
  el.setAttribute("data-copied", "");
  clearTimeout(el.flashTimer);
  el.flashTimer = setTimeout(() => el.removeAttribute("data-copied"), 900);
}

function copyText(text, el) {
  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;opacity:0;user-select:text;-webkit-user-select:text";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    area.remove();
    if (ok) flash(el);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => flash(el)).catch(fallback);
  } else {
    fallback();
  }
}

/* ============================================================
   page type: profile or not found
   ============================================================ */

const SITE_HOST = (() => {
  try { return new URL(CFG.siteUrl).hostname.toLowerCase(); } catch (e) { return ""; }
})();

function hostAllowed(host) {
  host = host.toLowerCase();
  if (!SITE_HOST) return true;
  if (host === SITE_HOST || host === "www." + SITE_HOST) return true;
  if (host === "localhost" || host === "[::1]" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  if (/\.(pages\.dev|workers\.dev|local)$/.test(host)) return true;
  return (CFG.allowedHosts || []).some(h => String(h).toLowerCase() === host);
}

const WRONG_HOST = !hostAllowed(location.hostname);
const NOT_FOUND = document.body.getAttribute("data-view") === "notfound" || WRONG_HOST;

if (NOT_FOUND) root.setAttribute("data-view", "notfound");

/* ============================================================
   config to css variables, fonts and fallback metadata
   ============================================================ */

(function applyConfig() {
  const set = (name, value) => root.style.setProperty(name, value);

  set("--accent", CFG.accent || "#4f7cff");
  set("--blur", `${num(CFG.glassBlur, 26, 0, 200)}px`);
  set("--backblur", `${num(CFG.backgroundBlur, 0, 0, 200)}px`);
  set("--dim", String(num(CFG.bgDim, 0.45, 0, 1)));
  set("--backgray", CFG.bgGrayscale === false ? "0%" : "100%");
  set("--tint", String(num(CFG.glassTint, 1, 0, 2)));
  set("--par", String(num(CFG.parallax, 1, 0, 3)));
  if (CFG.cardCorner) set("--cardcorner", CFG.cardCorner);
  if (CFG.buttonCorner) set("--btncorner", CFG.buttonCorner);
  if (CFG.avatarCorner) set("--avatar-corner", CFG.avatarCorner);
  if (CFG.cardWidth) set("--cardw", typeof CFG.cardWidth === "number" ? `${CFG.cardWidth}px` : String(CFG.cardWidth));
  if (CFG.glassShine !== true) root.setAttribute("data-noshine", "");

  if (!$("fonts")) {
    const face = (family, file) => file ? `@font-face{font-family:"${family}";src:url("${file}");font-display:block}` : "";
    const style = document.createElement("style");
    style.id = "fonts";
    style.textContent = face("Name Font", CFG.font) + face("Text Font", CFG.fontText);
    document.head.appendChild(style);
  }

  if (CFG.cursor) {
    const style = document.createElement("style");
    style.textContent = `* { cursor: url("${CFG.cursor}") ${CFG.cursorHotspot || "0 0"}, auto !important; }`;
    document.head.appendChild(style);
  }

  const addMeta = (attr, name, content, force) => {
    let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (tag && !force) return;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  if (NOT_FOUND) {
    document.title = `${CFG.notFoundTitle || "404"} | ${CFG.siteTitle}`;
    addMeta("name", "robots", "noindex, nofollow", true);
    document.head.querySelectorAll('link[rel="canonical"], script[type="application/ld+json"]').forEach(el => el.remove());
  } else {
    document.title = CFG.siteTitle;
    addMeta("name", "description", CFG.siteDescription);
    addMeta("name", "theme-color", CFG.chromeColor);
    addMeta("property", "og:title", CFG.siteTitle);
    addMeta("property", "og:description", CFG.siteDescription);
    addMeta("property", "og:image", absolute(CFG.thumbnail));
    addMeta("property", "og:type", "website");
    addMeta("name", "twitter:card", "summary_large_image");
  }

  if (!document.head.querySelector('link[rel~="icon"]') && CFG.favicon) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = CFG.favicon;
    document.head.appendChild(link);
  }

  const devHost = /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  const hasTag = !!document.querySelector('script[src*="googletagmanager.com"]');
  if (CFG.analyticsId && !WRONG_HOST && !devHost && !hasTag) {
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${CFG.analyticsId}`;
    document.head.appendChild(tag);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.analyticsId);
  }
})();

/* ============================================================
   theme (auto follows the device)
   ============================================================ */

const PALETTE = {
  dark: { particle: "#c8c8c8", sparks: ["#ffffff", CFG.accent || "#4f7cff"] },
  light: { particle: "#4a4a4a", sparks: ["#111111", CFG.accent || "#4f7cff"] },
};

const schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
let theme = "dark";

function applyTheme() {
  if (CFG.theme === "light" || CFG.theme === "dark") theme = CFG.theme;
  else theme = schemeQuery.matches ? "light" : "dark";
  root.setAttribute("data-theme", theme);
}

applyTheme();
if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", applyTheme);
else if (schemeQuery.addListener) schemeQuery.addListener(applyTheme);

/* ============================================================
   viewport (wide layout on phones when forceLandscape is on)
   ============================================================ */

const MOBILE_UA = navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean"
  ? navigator.userAgentData.mobile
  : /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
const PHONE = MOBILE_UA && window.matchMedia("(pointer: coarse)").matches;

let VW = window.innerWidth;
let VH = window.innerHeight;
let ROT = false;

function layout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mode = CFG.forceLandscape;
  const allowed = mode === "always" || (!!mode && mode !== "off" && PHONE);
  ROT = allowed && w / h < (CFG.rotateBelow || 1);
  VW = ROT ? h : w;
  VH = ROT ? w : h;
  root.classList.toggle("rotated", ROT);
  root.style.setProperty("--vw", `${VW}px`);
  root.style.setProperty("--vh", `${VH}px`);
  root.style.setProperty("--sw", `${w}px`);
}

function pointOf(event) {
  if (!ROT) return { x: event.clientX, y: event.clientY };
  return { x: event.clientY, y: window.innerWidth - event.clientX };
}

layout();
window.addEventListener("resize", layout);
window.addEventListener("orientationchange", layout);

/* ============================================================
   page content
   ============================================================ */

const gate = $("gate");
const card = $("card");
const track = $("track");
const soundButton = $("sound");
const speaker = $("speaker");

$("back").appendChild(media(CFG.bg, "backmedia"));

function buildProfile() {
  const links = $("links");
  const buttons = $("buttons");
  const about = $("about");
  const line = $("line");
  const handle = $("handle");

  links.textContent = "";
  buttons.textContent = "";
  handle.textContent = CFG.name;
  handle.addEventListener("click", () => {
    handle.classList.remove("hop");
    void handle.offsetWidth;
    handle.classList.add("hop");
  });
  handle.addEventListener("animationend", () => handle.classList.remove("hop"));

  if (CFG.showProfile) {
    const pfp = $("pfp");
    pfp.textContent = "";
    pfp.appendChild(media(CFG.avatar, "pfpmedia"));
  } else {
    $("pfp").remove();
  }

  if (!CFG.showTag) line.remove();

  (CFG.links || []).forEach(({ n, u, i }) => {
    const a = document.createElement("a");
    a.href = u;
    a.target = "_blank";
    a.rel = "me noopener noreferrer";
    a.title = n;
    a.setAttribute("aria-label", n);
    a.appendChild(media(i));
    links.appendChild(a);
  });

  (CFG.copyIcons || []).forEach(({ n, v, i }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "coin";
    b.title = n;
    b.setAttribute("aria-label", `copy ${n}`);
    b.appendChild(media(i));
    b.addEventListener("click", () => copyText(v, b));
    links.appendChild(b);
  });

  (CFG.buttons || []).forEach(({ label, desc, image, u, copy }) => {
    const el = document.createElement(copy ? "button" : "a");
    el.className = "btn";
    if (copy) {
      el.type = "button";
      el.addEventListener("click", () => copyText(copy, el));
    } else {
      el.href = u;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
    if (image) el.appendChild(media(image, "btnimg"));

    const text = document.createElement("span");
    text.className = "btntext";
    const title = document.createElement("span");
    title.textContent = label;
    text.appendChild(title);
    if (desc) {
      const sub = document.createElement("span");
      sub.className = "btndesc";
      sub.textContent = desc;
      text.appendChild(sub);
    }
    el.appendChild(text);
    buttons.appendChild(el);
  });

  if (!buttons.children.length) buttons.remove();

  if (CFG.aboutText) {
    $("about-title").textContent = CFG.aboutTitle || "";
    if (!CFG.aboutTitle) $("about-title").remove();
    $("about-text").textContent = CFG.aboutText;
  } else {
    about.remove();
  }

  const group = [];
  const aboutAbove = CFG.aboutPosition === "above";
  if (aboutAbove && about.isConnected) group.push(about);
  if (buttons.isConnected) group.push(buttons);
  if (!aboutAbove && about.isConnected) group.push(about);

  if (CFG.buttonsPosition === "above") card.append(...group, links);
  else card.append(links, ...group);
}

function buildNotFound() {
  card.textContent = "";
  const wrap = document.createElement("div");
  wrap.id = "lost";

  const code = document.createElement("h1");
  code.id = "lost-code";
  code.textContent = CFG.notFoundTitle || "404";

  const text = document.createElement("p");
  text.id = "lost-text";
  text.textContent = CFG.notFoundText || "this page doesn't exist";

  const link = document.createElement("a");
  link.id = "lost-link";
  link.className = "btn";
  link.textContent = CFG.notFoundButton || "back home";
  const target = CFG.notFoundLink || "/";
  link.href = WRONG_HOST && target.startsWith("/") ? new URL(target, CFG.siteUrl).href : target;

  wrap.append(code, text, link);
  card.appendChild(wrap);
}

/* ---------- typed line ---------- */

const TAGS = (Array.isArray(CFG.tag) ? CFG.tag : [CFG.tag]).filter(Boolean);
let typeTimer = null;

function typeLines(el, lines, speed) {
  clearTimeout(typeTimer);
  const single = lines.length === 1;
  let index = 0;
  let count = 0;
  let deleting = false;

  (function step() {
    const text = lines[index];
    el.textContent = text.slice(0, count);

    if (!deleting) {
      count++;
      if (count > text.length) {
        if (single) return;
        deleting = true;
        typeTimer = setTimeout(step, CFG.typePauseAtEnd);
        return;
      }
    } else {
      count--;
      if (count < 0) {
        count = 0;
        deleting = false;
        index = (index + 1) % lines.length;
        typeTimer = setTimeout(step, CFG.typePauseAtStart);
        return;
      }
    }
    typeTimer = setTimeout(step, deleting ? speed / 2 : speed);
  })();
}

function reserveLineHeight() {
  const line = $("line");
  if (!line) return;
  const original = line.textContent;
  line.style.minHeight = "0px";
  let tallest = 0;
  for (const text of TAGS) {
    line.textContent = text;
    tallest = Math.max(tallest, line.scrollHeight);
  }
  line.style.minHeight = `${tallest}px`;
  line.textContent = original;
}

/* ============================================================
   audio, gate and entrance
   ============================================================ */

let entered = false;

function setupAudio() {
  if (NOT_FOUND || !CFG.showMusic) {
    soundButton.remove();
    track.remove();
    return;
  }

  track.src = CFG.audio;
  track.loop = CFG.audioLoop !== false;
  track.volume = num(CFG.audioVolume, 0.6, 0, 1);
  speaker.src = CFG.playIcon;
  track.addEventListener("play", () => { speaker.src = CFG.pauseIcon; });
  track.addEventListener("pause", () => { speaker.src = CFG.playIcon; });

  if (CFG.musicToggle === false) {
    soundButton.remove();
  } else {
    soundButton.addEventListener("click", () => {
      if (track.paused) track.play().catch(() => {});
      else track.pause();
    });
  }

  onGesture(event => {
    if (!entered) return false;
    if (!track.paused) return true;
    if (event && event.target && soundButton.contains(event.target)) return false;
    return track.play().then(() => true).catch(() => false);
  });
}

function enter() {
  if (entered) return;
  entered = true;
  gate.classList.add("gone");

  if (!NOT_FOUND && CFG.showMusic) {
    track.play().catch(() => {});
    soundButton.classList.add("in");
  }

  setTimeout(() => {
    card.classList.add("in");
    const line = $("line");
    if (NOT_FOUND || !line || !CFG.showTag || !TAGS.length) return;
    if (CFG.typeText === false) line.textContent = TAGS[0];
    else typeLines(line, TAGS, CFG.typeSpeed);
  }, CFG.typeStartDelay);
}

function whenReady(task) {
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    task();
  };
  const loaded = document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve));
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fonts]).then(go);
  setTimeout(go, 3000);
}

/* ============================================================
   3D tilt and dragging (only runs when tilt or drag is on)
   ============================================================ */

function startMotion() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dragOn = CFG.drag === true;
  const trigger = CFG.tiltTrigger === "hold" ? "hold" : "move";

  let mode = "off";
  if (CFG.tilt === true) {
    if (trigger === "hold") mode = "hold";
    else if (CFG.tiltMode === "off") mode = "off";
    else if (CFG.tiltMode === "pointer" || CFG.tiltMode === "gyro") mode = CFG.tiltMode;
    else mode = coarse ? "gyro" : "pointer";
  }

  const span = num(CFG.tiltStrength, 12, 0, 60);
  const spanDiv = span || 1;
  const baseX = mode === "off" ? 0 : num(CFG.tiltRestX, 6, -60, 60);
  const baseY = mode === "off" ? 0 : num(CFG.tiltRestY, -8, -60, 60);
  const perspective = num(CFG.tiltPerspective, 1100, 300, 5000);
  const follow = num(CFG.tiltSpeed, 9, 1, 40);
  const dir = CFG.tiltInvert ? -1 : 1;

  const m = { x: 0, y: 0, vx: 0, vy: 0, rx: baseX, ry: baseY, ix: 0, iy: 0, idle: 1 };
  let lastActive = -1e9;
  let gyroLive = false;
  let gyroRef = null;
  let holding = null;
  let drag = null;
  let suppressClick = false;

  function aim(p) {
    m.ix = clamp((p.y - (VH / 2 + m.y)) / (VH / 2), -1, 1);
    m.iy = clamp((p.x - (VW / 2 + m.x)) / (VW / 2), -1, 1);
    lastActive = performance.now();
  }

  if (mode === "pointer") {
    window.addEventListener("pointermove", e => {
      if (e.pointerType !== "touch") aim(pointOf(e));
    }, true);
    root.addEventListener("mouseleave", () => { m.ix = 0; m.iy = 0; });
  }

  if (mode === "hold") {
    const letGo = e => {
      if (holding === null || (e && e.pointerId !== holding)) return;
      holding = null;
      m.ix = 0;
      m.iy = 0;
      lastActive = performance.now();
    };
    window.addEventListener("pointerdown", e => {
      if (holding !== null || e.button > 0) return;
      holding = e.pointerId;
      aim(pointOf(e));
    }, true);
    window.addEventListener("pointermove", e => {
      if (holding !== null && e.pointerId === holding) aim(pointOf(e));
    }, true);
    window.addEventListener("pointerup", letGo, true);
    window.addEventListener("pointercancel", letGo, true);
    window.addEventListener("blur", () => letGo(null));
  }

  if (mode === "gyro") {
    const onGyro = e => {
      if (e.beta === null || e.gamma === null) return;
      const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      const a = ((angle + (ROT ? 90 : 0)) % 360 + 360) % 360;
      let x = e.beta, y = e.gamma;
      if (a === 90) { x = -e.gamma; y = e.beta; }
      else if (a === 270) { x = e.gamma; y = -e.beta; }
      else if (a === 180) { x = -e.beta; y = -e.gamma; }
      if (!gyroRef) gyroRef = { x, y };
      gyroRef.x += (x - gyroRef.x) * 0.003;
      gyroRef.y += (y - gyroRef.y) * 0.003;
      m.ix = clamp((x - gyroRef.x) / 28, -1, 1);
      m.iy = clamp((y - gyroRef.y) / 28, -1, 1);
      gyroLive = true;
    };
    const startGyro = () => {
      window.addEventListener("deviceorientation", onGyro);
      window.addEventListener("orientationchange", () => { gyroRef = null; });
    };
    if (window.isSecureContext && typeof DeviceOrientationEvent !== "undefined") {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        onGesture(() => DeviceOrientationEvent.requestPermission().then(state => {
          if (state === "granted") startGyro();
          return true;
        }).catch(() => false));
      } else {
        startGyro();
      }
    }
  }

  function soften(value, max) {
    const over = Math.abs(value) - max;
    return over <= 0 ? value : Math.sign(value) * (max + over * 0.25);
  }

  if (dragOn) {
    card.addEventListener("dragstart", e => e.preventDefault());

    card.addEventListener("pointerdown", e => {
      if (e.button > 0 || drag) return;
      const p = pointOf(e);
      drag = { id: e.pointerId, sx: p.x, sy: p.y, gx: p.x - VW / 2 - m.x, gy: p.y - VH / 2 - m.y, tx: m.x, ty: m.y, active: false };
    });

    window.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = pointOf(e);
      if (!drag.active) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) < 6) return;
        drag.active = true;
      }
      const maxX = Math.max(0, (VW - card.offsetWidth) / 2 - 8);
      const maxY = Math.max(0, (VH - card.offsetHeight) / 2 - 8);
      drag.tx = soften(p.x - VW / 2 - drag.gx, maxX);
      drag.ty = soften(p.y - VH / 2 - drag.gy, maxY);
    });

    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.active) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 60);
      }
      drag = null;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);

    card.addEventListener("click", e => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  let lastTime = performance.now();
  let lastTransform = "";
  let lastVars = "";

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;

    if (dt > 0) {
      const dragging = !!(drag && drag.active);

      if (dragging) {
        const k = 1 - Math.exp(-dt * 20);
        const px = m.x, py = m.y;
        m.x += (drag.tx - m.x) * k;
        m.y += (drag.ty - m.y) * k;
        m.vx += ((m.x - px) / dt - m.vx) * 0.3;
        m.vy += ((m.y - py) / dt - m.vy) * 0.3;
      } else if (CFG.dragReturn !== false) {
        const stiffness = 140, damping = 17;
        m.vx += (-stiffness * m.x - damping * m.vx) * dt;
        m.vy += (-stiffness * m.y - damping * m.vy) * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (Math.abs(m.x) < 0.01 && Math.abs(m.vx) < 0.05) { m.x = 0; m.vx = 0; }
        if (Math.abs(m.y) < 0.01 && Math.abs(m.vy) < 0.05) { m.y = 0; m.vy = 0; }
      } else {
        const decay = Math.exp(-dt * 8);
        m.vx *= decay;
        m.vy *= decay;
      }

      let wantIdle = 0;
      if (CFG.tiltIdle !== false && !calm && mode !== "off") {
        if (mode === "gyro") wantIdle = gyroLive ? 0 : 1;
        else if (holding !== null) wantIdle = 0;
        else wantIdle = now - lastActive > 2500 ? 1 : 0;
      }
      m.idle += (wantIdle - m.idle) * (1 - Math.exp(-dt * 1.5));

      const swayX = Math.sin(now * 0.0006) * span * 0.22 * m.idle;
      const swayY = Math.cos(now * 0.0004) * span * 0.3 * m.idle;
      const leanX = mode === "off" ? 0 : clamp(-m.vy * 0.012, -16, 16);
      const leanY = mode === "off" ? 0 : clamp(m.vx * 0.012, -16, 16);

      const targetX = baseX - dir * m.ix * span + swayX + leanX;
      const targetY = baseY + dir * m.iy * span + swayY + leanY;
      const ease = 1 - Math.exp(-dt * follow);
      m.rx += (targetX - m.rx) * ease;
      m.ry += (targetY - m.ry) * ease;

      const transform =
        `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0) translate(-50%, -50%) ` +
        `perspective(${perspective}px) rotateX(${m.rx.toFixed(3)}deg) rotateY(${m.ry.toFixed(3)}deg)`;
      if (transform !== lastTransform) {
        card.style.transform = transform;
        lastTransform = transform;
      }

      const nx = clamp((m.ry - baseY) / spanDiv, -1.5, 1.5);
      const ny = clamp(-(m.rx - baseX) / spanDiv, -1.5, 1.5);
      const vars = `${nx.toFixed(3)}|${ny.toFixed(3)}`;
      if (vars !== lastVars) {
        card.style.setProperty("--px", nx.toFixed(3));
        card.style.setProperty("--py", ny.toFixed(3));
        card.style.setProperty("--sx", `${(50 + nx * 22).toFixed(2)}%`);
        card.style.setProperty("--sy", `${(50 + ny * 22).toFixed(2)}%`);
        lastVars = vars;
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ============================================================
   rain particles and mouse sparks
   ============================================================ */

function startParticles() {
  const canvas = $("drift");
  const count = Math.round(num(CFG.particleCount, 70, 0, 400));
  if (CFG.particles === false || count === 0) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  const kind = CFG.particleType === "text" || CFG.particleType === "image" ? CFG.particleType : "dot";
  const glyphs = String(CFG.particleText || "").split(/\s+/).filter(Boolean);
  const baseSize = num(CFG.particleSize, 8, 2, 96);
  const speed = num(CFG.particleSpeed, 1, 0.05, 10);
  const customColor = CFG.particleColor && CFG.particleColor !== "auto" ? CFG.particleColor : null;

  let sprite = null;
  if (kind === "image" && CFG.particleImage) {
    sprite = new Image();
    sprite.src = CFG.particleImage;
    sprite.onerror = () => { sprite = null; };
  }

  let ratio = 1;
  let drops = [];

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(VW * ratio);
    canvas.height = Math.round(VH * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drop(anywhere) {
    return {
      x: Math.random() * VW,
      y: anywhere ? Math.random() * VH : -baseSize * 2,
      size: baseSize * (0.7 + Math.random() * 0.6),
      fall: VH * 0.11 * (0.7 + Math.random() * 0.6),
      sway: 0.5 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.55,
      glyph: glyphs.length ? glyphs[Math.floor(Math.random() * glyphs.length)] : "*",
    };
  }

  function seed() {
    drops = Array.from({ length: count }, () => drop(true));
  }

  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, VW, VH);
    ctx.fillStyle = customColor || PALETTE[theme].particle;
    ctx.textBaseline = "top";

    for (const d of drops) {
      d.y += d.fall * speed * dt;
      if (d.y > VH + d.size) Object.assign(d, drop(false));
      const x = Math.round(d.x + Math.sin(now * 0.001 * d.sway + d.phase) * 18);
      const y = Math.round(d.y);
      ctx.globalAlpha = d.alpha;

      if (kind === "image") {
        if (sprite && sprite.complete && sprite.naturalWidth) {
          const w = d.size;
          const h = d.size * sprite.naturalHeight / sprite.naturalWidth;
          ctx.drawImage(sprite, x, y, w, h);
        }
      } else if (kind === "text" && glyphs.length) {
        ctx.font = `${Math.round(d.size)}px "Text Font", monospace`;
        ctx.fillText(d.glyph, x, y);
      } else {
        const side = Math.max(2, Math.round(d.size / 2));
        ctx.fillRect(x, y, side, side);
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  resize();
  seed();
  window.addEventListener("resize", () => { resize(); seed(); });
  requestAnimationFrame(frame);
}

function startSparks() {
  const canvas = $("trail");
  if (CFG.sparks === false || !window.matchMedia("(hover: hover)").matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  let bits = [];
  let running = false;
  let lastX = -999;
  let lastY = -999;

  function resize() {
    canvas.width = VW;
    canvas.height = VH;
  }

  document.addEventListener("mousemove", e => {
    const p = pointOf(e);
    if (Math.abs(p.x - lastX) + Math.abs(p.y - lastY) < 3) return;
    lastX = p.x;
    lastY = p.y;
    const colors = PALETTE[theme].sparks;
    for (let i = 0; i < 3; i++) {
      bits.push({
        x: p.x, y: p.y,
        vx: (Math.random() - 0.5) * 2.4,
        vy: (Math.random() - 0.5) * 2.4,
        life: 1,
        side: 2 + Math.floor(Math.random() * 3),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  });

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of bits) {
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.94;
      b.vy *= 0.94;
      b.life -= 1 / 28;
      ctx.globalAlpha = Math.max(b.life, 0);
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), b.side, b.side);
    }
    ctx.globalAlpha = 1;
    bits = bits.filter(b => b.life > 0);
    if (bits.length) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  resize();
  window.addEventListener("resize", resize);
}

/* ============================================================
   start
   ============================================================ */

if (NOT_FOUND) buildNotFound();
else buildProfile();

if (!NOT_FOUND && CFG.showTag && TAGS.length) {
  $("line").textContent = TAGS[0];
  reserveLineHeight();
  $("line").textContent = "";
  window.addEventListener("resize", reserveLineHeight);
}

setupAudio();
startParticles();
startSparks();
if (!NOT_FOUND && (CFG.tilt === true || CFG.drag === true)) startMotion();

if (!NOT_FOUND && CFG.gateIcon) {
  fillIcon($("mark"), CFG.gateIcon);
  if (CFG.gateSpin !== false) $("mark").setAttribute("data-spin", "");
  gate.addEventListener("click", enter);
} else {
  gate.remove();
  whenReady(enter);
}

onGesture(() => {
  liveVideos.forEach(v => { if (v.paused) playVideo(v); });
  return liveVideos.every(v => !v.paused);
});
