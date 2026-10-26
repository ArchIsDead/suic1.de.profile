console.log("%chi you can get the whole project at https://github.com/ArchIsDead/suic1.de.profile", "font-size:14px;color:#fff;background:#000;padding:6px 10px;border-radius:6px;");

const VIDEOS = ["mp4", "webm", "mov", "m4v"];

function ext(path) {
  const clean = path.split("?")[0].split("#")[0];
  return (clean.split(".").pop() || "").toLowerCase();
}

function video(path) {
  return VIDEOS.includes(ext(path));
}

const LIVE = [];

function play(v) {
  const r = v.play();
  if (r && r.catch) r.catch(() => {});
}

function keepAlive(v) {
  LIVE.push(v);
  let last = -1;
  let stuck = 0;
  v.addEventListener("loadeddata", () => play(v));
  v.addEventListener("canplay", () => { if (v.paused && !document.hidden) play(v); });
  v.addEventListener("ended", () => { v.currentTime = 0; play(v); });
  setInterval(() => {
    if (document.hidden) return;
    if (v.ended) { v.currentTime = 0; play(v); return; }
    if (v.paused) { play(v); return; }
    if (v.readyState >= 3 && !v.seeking && v.currentTime === last) {
      stuck++;
      if (stuck >= 2) {
        stuck = 0;
        v.currentTime = v.duration && v.currentTime >= v.duration - 0.3 ? 0 : v.currentTime + 0.01;
        play(v);
      }
    } else {
      stuck = 0;
    }
    last = v.currentTime;
  }, 1000);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) LIVE.forEach(play);
});

function media(path, cls) {
  if (video(path)) {
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disableremoteplayback", "");
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.controls = false;
    v.disablePictureInPicture = true;
    v.preload = "auto";
    v.src = path;
    if (cls) v.className = cls;
    keepAlive(v);
    return v;
  }
  const im = document.createElement("img");
  im.src = path;
  im.alt = "";
  if (cls) im.className = cls;
  return im;
}

function icon(target, value) {
  target.innerHTML = "";
  if (!value) return;
  const file = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov|m4v)(\?|#|$)/i.test(value);
  const link = /^https?:\/\//i.test(value);
  if (file || link) {
    target.appendChild(media(value));
  } else {
    target.textContent = value;
  }
}

function meta(name, content, prop) {
  const tag = document.createElement("meta");
  tag.setAttribute(prop ? "property" : "name", name);
  tag.setAttribute("content", content);
  document.head.appendChild(tag);
}

document.title = CFG.siteTitle;
document.getElementById("icon").href = CFG.favicon;
document.documentElement.style.setProperty("--accent", CFG.themeColor);
meta("theme-color", CFG.chromeColor);
meta("description", CFG.siteDescription);
meta("og:title", CFG.siteTitle, true);
meta("og:description", CFG.siteDescription, true);
meta("og:image", CFG.thumbnail, true);
meta("og:type", "website", true);
meta("twitter:card", "summary_large_image");
meta("twitter:title", CFG.siteTitle);
meta("twitter:description", CFG.siteDescription);
meta("twitter:image", CFG.thumbnail);

const PAL = {
  dark: { dot: "#c8c8c8", sparks: ["#ffffff", "#dcdcdc", "#f2f2f2"] },
  light: { dot: "#4a4a4a", sparks: ["#111111", "#333333", "#555555"] },
};
const schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
let theme = "dark";
function setTheme() {
  if (CFG.theme === "light" || CFG.theme === "dark") theme = CFG.theme;
  else theme = schemeQuery.matches ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
}
setTheme();
if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", setTheme);
else if (schemeQuery.addListener) schemeQuery.addListener(setTheme);

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
  const root = document.documentElement;
  root.classList.toggle("rotated", ROT);
  root.style.setProperty("--vw", `${VW}px`);
  root.style.setProperty("--vh", `${VH}px`);
  root.style.setProperty("--sw", `${w}px`);
}

function pt(e) {
  if (!ROT) return { x: e.clientX, y: e.clientY };
  return { x: e.clientY, y: window.innerWidth - e.clientX };
}

layout();
window.addEventListener("resize", layout);
window.addEventListener("orientationchange", layout);

const gt = document.getElementById("gate");
const cd = document.getElementById("card");
const tk = document.getElementById("track");
const sb = document.getElementById("sound");
const si = document.getElementById("speaker");
const lr = document.getElementById("links");
const bt = document.getElementById("buttons");
const line = document.getElementById("line");

document.documentElement.style.setProperty("--tagfont", CFG.fontTag);
document.documentElement.style.setProperty("--btnfont", CFG.fontButtons);
document.documentElement.style.setProperty("--cardcorner", CFG.cardCorner);
document.documentElement.style.setProperty("--btncorner", CFG.buttonCorner);
function num(v, d, lo, hi) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
}
const rootStyle = document.documentElement.style;
rootStyle.setProperty("--blur", `${num(CFG.glassBlur, 26, 0, 200)}px`);
rootStyle.setProperty("--backblur", `${num(CFG.backgroundBlur, 0, 0, 200)}px`);
rootStyle.setProperty("--dim", String(num(CFG.bgDim, 0.45, 0, 1)));
rootStyle.setProperty("--backgray", CFG.bgGrayscale === false ? "0%" : "100%");
rootStyle.setProperty("--tint", String(num(CFG.glassTint, 1, 0, 2)));
rootStyle.setProperty("--par", String(num(CFG.parallax, 1, 0, 3)));
if (CFG.cardWidth) rootStyle.setProperty("--cardw", typeof CFG.cardWidth === "number" ? `${CFG.cardWidth}px` : String(CFG.cardWidth));
if (CFG.glassShine === false) document.documentElement.setAttribute("data-noshine", "");

if (!CFG.buttons || CFG.buttons.length === 0) {
  bt.remove();
} else if (CFG.buttonsPosition === "above") {
  cd.insertBefore(bt, lr);
} else {
  cd.insertBefore(lr, bt);
}

if (CFG.showMusic) {
  tk.src = CFG.audio;
  tk.loop = CFG.audioLoop !== false;
  si.src = CFG.playIcon;
} else {
  sb.remove();
  tk.remove();
}

if (CFG.gateIcon) icon(document.getElementById("mark"), CFG.gateIcon);

const back = document.getElementById("back");
back.appendChild(media(CFG.bg, "backmedia"));

if (CFG.showProfile) {
  const pfp = document.getElementById("pfp");
  pfp.appendChild(media(CFG.avatar, "pfpmedia"));
} else {
  document.getElementById("pfp").remove();
}

const handle = document.getElementById("handle");
handle.textContent = CFG.name;
handle.addEventListener("animationend", e => {
  if (e.animationName === "bounce") handle.classList.remove("bounce");
});
handle.addEventListener("click", () => {
  if (handle.classList.contains("bounce")) return;
  handle.classList.add("bounce");
});

const TAGS = Array.isArray(CFG.tag) ? CFG.tag : [CFG.tag];

if (!CFG.showTag) {
  line.remove();
} else {
  reserve();
  window.addEventListener("resize", reserve);
}

function reserve() {
  line.style.minHeight = "0px";
  const original = line.textContent;
  let tallest = 0;
  for (const t of TAGS) {
    line.textContent = t;
    tallest = Math.max(tallest, line.scrollHeight);
  }
  line.style.minHeight = `${tallest}px`;
  line.textContent = original;
}

if (CFG.cursor) {
  const style = document.createElement("style");
  style.textContent = `* { cursor: url("${CFG.cursor}") ${CFG.cursorHotspot}, auto !important; }`;
  document.head.appendChild(style);
}

if (CFG.font) {
  const face = new FontFace("Porky's", `url("${CFG.font}")`);
  face.load().then(f => document.fonts.add(f)).catch(() => {});
}

let timer = null;
function type(el, list, speed) {
  clearTimeout(timer);
  let index = 0;
  let i = 0, deleting = false;
  (function step() {
    const txt = list[index];
    el.textContent = txt.slice(0, i);
    if (!deleting) {
      i++;
      if (i > txt.length) {
        deleting = true;
        timer = setTimeout(step, CFG.typePauseAtEnd);
        return;
      }
    } else {
      i--;
      if (i < 0) {
        i = 0;
        deleting = false;
        index = (index + 1) % list.length;
        timer = setTimeout(step, CFG.typePauseAtStart);
        return;
      }
    }
    timer = setTimeout(step, deleting ? speed / 2 : speed);
  })();
}

CFG.links.forEach(({ n, u, i }) => {
  const a = document.createElement("a");
  a.href = u;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.title = n;
  a.appendChild(media(i));
  lr.appendChild(a);
});

(CFG.copyIcons || []).forEach(({ n, v, i }) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "coin";
  b.title = n;
  b.appendChild(media(i));
  b.addEventListener("click", () => {
    navigator.clipboard.writeText(v);
    b.classList.add("copied");
    setTimeout(() => b.classList.remove("copied"), 900);
  });
  lr.appendChild(b);
});

(CFG.buttons || []).forEach(({ label, desc, image, u, copy }) => {
  const isCopy = !!copy;
  const el = document.createElement(isCopy ? "button" : "a");
  el.className = "btn";
  if (isCopy) {
    el.type = "button";
  } else {
    el.href = u;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  }

  if (image) {
    el.appendChild(media(image, "btnimg"));
  }

  const text = document.createElement("span");
  text.className = "btntext";

  const title = document.createElement("span");
  title.className = "btnlabel";
  title.textContent = label;
  text.appendChild(title);

  const sub = document.createElement("span");
  sub.className = "btndesc";
  sub.textContent = desc || "";
  if (desc || isCopy) text.appendChild(sub);

  el.appendChild(text);

  if (isCopy) {
    const restoreText = desc || "";
    el.addEventListener("click", () => {
      navigator.clipboard.writeText(copy);
      sub.textContent = "Copied!";
      el.classList.add("copied");
      setTimeout(() => {
        sub.textContent = restoreText;
        el.classList.remove("copied");
      }, 1200);
    });
  }

  bt.appendChild(el);
});

let entered = false;

function enter() {
  if (entered) return;
  entered = true;
  gt.classList.add("gone");
  if (CFG.showMusic) {
    tk.volume = num(CFG.audioVolume, 0.6, 0, 1);
    tk.play().catch(() => {});
    sb.classList.add("in");
  }
  backdrop();
  setTimeout(() => {
    cd.classList.add("in");
    if (CFG.showTag && CFG.typeText) {
      type(line, TAGS, CFG.typeSpeed);
    } else if (CFG.showTag) {
      line.textContent = TAGS[0];
    }
  }, CFG.typeStartDelay);
}

function whenReady(fn) {
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    fn();
  };
  if (document.readyState === "complete") go();
  else {
    window.addEventListener("load", go);
    setTimeout(go, 3000);
  }
}

function onGesture(fn) {
  const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
  const run = e => {
    let r = false;
    try { r = fn(e); } catch (err) { r = false; }
    Promise.resolve(r).then(done => {
      if (done) events.forEach(ev => window.removeEventListener(ev, run, true));
    }).catch(() => {});
  };
  events.forEach(ev => window.addEventListener(ev, run, true));
}

if (CFG.showMusic) {
  tk.addEventListener("play", () => { si.src = CFG.pauseIcon; });
  tk.addEventListener("pause", () => { si.src = CFG.playIcon; });

  sb.addEventListener("click", () => {
    if (tk.paused) tk.play().catch(() => {});
    else tk.pause();
    si.style.transform = "scale(0.6)";
    requestAnimationFrame(() => { si.style.transform = "scale(1)"; });
  });

  onGesture(e => {
    if (!entered) return false;
    if (!tk.paused) return true;
    if (e && e.target && sb.contains(e.target)) return false;
    return tk.play().then(() => true).catch(() => false);
  });
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const coarse = window.matchMedia("(pointer: coarse)").matches;
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TRIGGER = CFG.tiltTrigger === "hold" ? "hold" : "move";
const MODE = !CFG.tilt || CFG.tiltMode === "off" ? "off"
  : TRIGGER === "hold" ? "hold"
  : (CFG.tiltMode === "pointer" || CFG.tiltMode === "gyro") ? CFG.tiltMode
  : (coarse ? "gyro" : "pointer");
const SPAN = num(CFG.tiltStrength, 12, 0, 60);
const SPANDIV = SPAN || 1;
const BASEX = MODE === "off" ? 0 : num(CFG.tiltRestX, 6, -60, 60);
const BASEY = MODE === "off" ? 0 : num(CFG.tiltRestY, -8, -60, 60);
const PERSP = num(CFG.tiltPerspective, 1100, 300, 5000);
const TSPEED = num(CFG.tiltSpeed, 9, 1, 40);
const DIR = CFG.tiltInvert ? -1 : 1;

const m = { x: 0, y: 0, vx: 0, vy: 0, rx: BASEX, ry: BASEY, s: 0.92, ix: 0, iy: 0, idle: 1 };
let lastMove = -1e9;
let gyroLive = false;
let gyroRef = null;
let holding = null;
let holdCard = false;

function aim(p) {
  m.ix = clamp((p.y - (VH / 2 + m.y)) / (VH / 2), -1, 1);
  m.iy = clamp((p.x - (VW / 2 + m.x)) / (VW / 2), -1, 1);
  lastMove = performance.now();
}

if (MODE === "pointer") {
  window.addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    aim(pt(e));
  }, true);
  document.documentElement.addEventListener("mouseleave", () => { m.ix = 0; m.iy = 0; });
}

if (MODE === "hold") {
  const letGo = e => {
    if (holding === null || (e && e.pointerId !== holding)) return;
    holding = null;
    holdCard = false;
    m.ix = 0;
    m.iy = 0;
    lastMove = performance.now();
  };
  window.addEventListener("pointerdown", e => {
    if (holding !== null || e.button > 0) return;
    holding = e.pointerId;
    holdCard = cd.contains(e.target);
    aim(pt(e));
  }, true);
  window.addEventListener("pointermove", e => {
    if (holding === null || e.pointerId !== holding) return;
    aim(pt(e));
  }, true);
  window.addEventListener("pointerup", letGo, true);
  window.addEventListener("pointercancel", letGo, true);
  window.addEventListener("blur", () => letGo(null));
}

function onGyro(e) {
  if (e.beta === null || e.gamma === null) return;
  const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  let x = e.beta, y = e.gamma;
  const a = ((angle + (ROT ? 90 : 0)) % 360 + 360) % 360;
  if (a === 90) { x = -e.gamma; y = e.beta; }
  else if (a === 270) { x = e.gamma; y = -e.beta; }
  else if (a === 180) { x = -e.beta; y = -e.gamma; }
  if (!gyroRef) gyroRef = { x, y };
  gyroRef.x += (x - gyroRef.x) * 0.003;
  gyroRef.y += (y - gyroRef.y) * 0.003;
  m.ix = clamp((x - gyroRef.x) / 28, -1, 1);
  m.iy = clamp((y - gyroRef.y) / 28, -1, 1);
  gyroLive = true;
}

function startGyro() {
  window.addEventListener("deviceorientation", onGyro);
  window.addEventListener("orientationchange", () => { gyroRef = null; });
}

if (MODE === "gyro" && window.isSecureContext && typeof DeviceOrientationEvent !== "undefined") {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    onGesture(() => DeviceOrientationEvent.requestPermission().then(state => {
      if (state === "granted") startGyro();
      return true;
    }).catch(() => false));
  } else {
    startGyro();
  }
}

let drag = null;
let suppress = false;

if (CFG.drag !== false) {
  cd.addEventListener("dragstart", e => e.preventDefault());

  cd.addEventListener("pointerdown", e => {
    if (e.button > 0 || drag) return;
    const p = pt(e);
    drag = {
      id: e.pointerId,
      sx: p.x,
      sy: p.y,
      gx: p.x - VW / 2 - m.x,
      gy: p.y - VH / 2 - m.y,
      tx: m.x,
      ty: m.y,
      active: false,
    };
  });

  window.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = pt(e);
    if (!drag.active) {
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) < 6) return;
      drag.active = true;
    }
    const maxX = Math.max(0, (VW - cd.offsetWidth) / 2 - 8);
    const maxY = Math.max(0, (VH - cd.offsetHeight) / 2 - 8);
    drag.tx = soft(p.x - VW / 2 - drag.gx, maxX);
    drag.ty = soft(p.y - VH / 2 - drag.gy, maxY);
  });

  const release = e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.active) {
      suppress = true;
      setTimeout(() => { suppress = false; }, 60);
    }
    drag = null;
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);

  cd.addEventListener("click", e => {
    if (!suppress) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}

function soft(v, max) {
  const over = Math.abs(v) - max;
  if (over <= 0) return v;
  return Math.sign(v) * (max + over * 0.25);
}

let lastTime = performance.now();

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
      const K = 140, C = 17;
      m.vx += (-K * m.x - C * m.vx) * dt;
      m.vy += (-K * m.y - C * m.vy) * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (Math.abs(m.x) < 0.01 && Math.abs(m.vx) < 0.05) { m.x = 0; m.vx = 0; }
      if (Math.abs(m.y) < 0.01 && Math.abs(m.vy) < 0.05) { m.y = 0; m.vy = 0; }
    } else {
      const d = Math.exp(-dt * 8);
      m.vx *= d;
      m.vy *= d;
    }

    const wantIdle = !CFG.tiltIdle || calm || MODE === "off" ? 0
      : MODE === "gyro" ? (gyroLive ? 0 : 1)
      : holding !== null ? 0
      : (now - lastMove > 2500 ? 1 : 0);
    m.idle += (wantIdle - m.idle) * (1 - Math.exp(-dt * 1.5));

    const swayX = Math.sin(now * 0.0006) * SPAN * 0.22 * m.idle;
    const swayY = Math.cos(now * 0.0004) * SPAN * 0.3 * m.idle;
    const dragX = MODE === "off" ? 0 : clamp(-m.vy * 0.012, -16, 16);
    const dragY = MODE === "off" ? 0 : clamp(m.vx * 0.012, -16, 16);

    const tx = BASEX - DIR * m.ix * SPAN + swayX + dragX;
    const ty = BASEY + DIR * m.iy * SPAN + swayY + dragY;
    const ease = 1 - Math.exp(-dt * TSPEED);
    m.rx += (tx - m.rx) * ease;
    m.ry += (ty - m.ry) * ease;

    const shown = cd.classList.contains("in");
    const ts = !shown ? 0.92 : dragging ? 1.02 : holdCard ? 0.985 : 1;
    m.s += (ts - m.s) * (1 - Math.exp(-dt * 10));

    cd.style.transform =
      `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0) translate(-50%, -50%) ` +
      `perspective(${PERSP}px) rotateX(${m.rx.toFixed(3)}deg) rotateY(${m.ry.toFixed(3)}deg) scale(${m.s.toFixed(4)})`;

    const nx = clamp((m.ry - BASEY) / SPANDIV, -1.5, 1.5);
    const ny = clamp(-(m.rx - BASEX) / SPANDIV, -1.5, 1.5);
    cd.style.setProperty("--px", nx.toFixed(3));
    cd.style.setProperty("--py", ny.toFixed(3));
    cd.style.setProperty("--sx", `${(50 + nx * 22).toFixed(2)}%`);
    cd.style.setProperty("--sy", `${(50 + ny * 22).toFixed(2)}%`);
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

function backdrop() {
  const c = document.getElementById("drift");
  if (CFG.particles === false) {
    c.remove();
    return;
  }
  const ctx = c.getContext("2d");
  const COUNT = Math.round(num(CFG.particleCount, 70, 0, 400));
  let dots = [];
  let mx = VW / 2;
  document.addEventListener("mousemove", e => { mx = pt(e).x; });

  function size() { c.width = VW; c.height = VH; }
  function seed() {
    dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height * 1.5 - c.height * 0.5,
      r: 1 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.6 + 0.7) / 3,
      fall: (c.height * 1.1) / (10 * 60) * (0.7 + Math.random() * 0.6),
      a: 0.4 + Math.random() * 0.6,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = PAL[theme].dot;
    const shift = -(mx - c.width / 2) * 0.08;
    for (const d of dots) {
      d.y += d.fall;
      if (d.y > c.height + 10) { d.y = -10; d.x = Math.random() * c.width; }
      const sway = Math.sin(performance.now() * 0.001 * d.speed + d.phase) * 80;
      const x = ((d.x + sway + shift) % c.width + c.width) % c.width;
      ctx.globalAlpha = d.a;
      ctx.beginPath();
      ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  size();
  seed();
  window.addEventListener("resize", () => { size(); seed(); });
  requestAnimationFrame(frame);
}

(function sparks() {
  const c = document.getElementById("trail");
  if (CFG.sparks === false) {
    c.remove();
    return;
  }
  const ctx = c.getContext("2d");
  let bits = [];
  let mx = -999, my = -999, px = -999, py = -999;

  document.addEventListener("mousemove", e => { const p = pt(e); mx = p.x; my = p.y; });

  function size() { c.width = VW; c.height = VH; }

  function star(x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.2, s, 0);
    ctx.quadraticCurveTo(s * 0.2, s * 0.2, 0, s);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.2, -s, 0);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.2, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    if (mx !== px || my !== py) {
      for (let i = 0; i < 4; i++) {
        bits.push({
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          l: 1,
          s: 3 * (0.5 + Math.random() * 0.7),
          r: Math.random() * Math.PI * 2,
          rs: (Math.random() - 0.5) * 0.12,
          tw: Math.random() * Math.PI * 2,
          c: PAL[theme].sparks[Math.floor(Math.random() * 3)],
        });
      }
      px = mx; py = my;
    }
    for (const b of bits) {
      b.x += b.vx; b.y += b.vy;
      b.vx *= 0.97; b.vy *= 0.97;
      b.r += b.rs;
      b.l -= 1 / 30;
      const l = Math.max(b.l, 0);
      const tw = 0.75 + 0.25 * Math.sin(performance.now() * 0.015 + b.tw);
      ctx.globalAlpha = l;
      ctx.fillStyle = b.c;
      star(b.x, b.y, b.s * l * tw, b.r);
    }
    bits = bits.filter(b => b.l > 0);
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  size();
  window.addEventListener("resize", size);
  requestAnimationFrame(frame);
})();

onGesture(() => {
  LIVE.forEach(v => { if (v.paused) play(v); });
  return LIVE.every(v => !v.paused);
});

if (CFG.gateIcon) {
  gt.addEventListener("click", enter);
} else {
  gt.remove();
  whenReady(enter);
}
