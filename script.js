console.log("%chi you can get the whole project at https://github.com/ArchIsDead/suic1.de.profile", "font-size:14px;color:#fff;background:#000;padding:6px 10px;border-radius:6px;");

const VIDEOS = ["mp4", "webm", "mov", "m4v"];

function ext(path) {
  const clean = path.split("?")[0].split("#")[0];
  return (clean.split(".").pop() || "").toLowerCase();
}

function video(path) {
  return VIDEOS.includes(ext(path));
}

function media(path, cls) {
  if (video(path)) {
    const v = document.createElement("video");
    v.src = path;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    if (cls) v.className = cls;
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

if (!CFG.buttons || CFG.buttons.length === 0) {
  bt.remove();
} else if (CFG.buttonsPosition === "above") {
  cd.insertBefore(bt, lr);
} else {
  cd.insertBefore(lr, bt);
}

if (CFG.showMusic) {
  tk.src = CFG.audio;
  si.src = CFG.playIcon;
} else {
  sb.remove();
  tk.remove();
}

icon(document.getElementById("mark"), CFG.gateIcon);

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

gt.addEventListener("click", () => {
  gt.classList.add("gone");
  if (CFG.showMusic) {
    tk.volume = 0.6;
    tk.play().catch(() => {});
    si.src = CFG.pauseIcon;
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
});

if (CFG.showMusic) {
  sb.addEventListener("click", () => {
    if (tk.paused) {
      tk.play();
      si.src = CFG.pauseIcon;
    } else {
      tk.pause();
      si.src = CFG.playIcon;
    }
    si.style.transform = "scale(0.6)";
    requestAnimationFrame(() => { si.style.transform = "scale(1)"; });
  });
}

const SPAN = CFG.tiltStrength;
const BASEX = CFG.tilt ? CFG.tiltRestX : 0;
const BASEY = CFG.tilt ? CFG.tiltRestY : 0;
let smoothX = BASEX;
let smoothY = BASEY;

document.documentElement.style.setProperty("--tx", `${BASEX}deg`);
document.documentElement.style.setProperty("--ty", `${BASEY}deg`);
document.documentElement.style.setProperty("--tx2", `${CFG.tilt ? BASEX * 2.3 : 0}deg`);
document.documentElement.style.setProperty("--ty2", `${CFG.tilt ? BASEY * 2 : 0}deg`);
document.documentElement.style.setProperty("--txm", `${CFG.tilt ? BASEX * 0.7 : 0}deg`);
document.documentElement.style.setProperty("--tym", `${CFG.tilt ? BASEY * 0.5 : 0}deg`);

function apply(rx, ry) {
  cd.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
}

function gyro(e) {
  if (e.beta === null || e.gamma === null) return;
  const beta = Math.max(-45, Math.min(45, e.beta - 45));
  const gamma = Math.max(-45, Math.min(45, e.gamma));
  const targetX = BASEX - (beta / 45) * SPAN;
  const targetY = BASEY + (gamma / 45) * SPAN;
  smoothX += (targetX - smoothX) * 0.15;
  smoothY += (targetY - smoothY) * 0.15;
  apply(smoothX, smoothY);
}

function startGyro() {
  window.addEventListener("deviceorientation", gyro);
}

if (CFG.tilt && CFG.tiltGyro && window.isSecureContext) {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    gt.addEventListener("click", () => {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === "granted") startGyro();
      }).catch(() => {});
    }, { once: true });
  } else if (typeof DeviceOrientationEvent !== "undefined") {
    startGyro();
  }
}

function backdrop() {
  const c = document.getElementById("drift");
  const ctx = c.getContext("2d");
  let dots = [];
  let mx = window.innerWidth / 2;
  document.addEventListener("mousemove", e => { mx = e.clientX; });

  function size() { c.width = window.innerWidth; c.height = window.innerHeight; }
  function seed() {
    dots = Array.from({ length: 70 }, () => ({
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
    ctx.fillStyle = "#c8c8c8";
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
  const ctx = c.getContext("2d");
  let bits = [];
  let mx = -999, my = -999, px = -999, py = -999;

  document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

  function size() { c.width = window.innerWidth; c.height = window.innerHeight; }

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

  const colors = ["#ffffff", "#dcdcdc", "#f2f2f2"];

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
          c: colors[Math.floor(Math.random() * colors.length)],
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
      ctx.shadowColor = b.c;
      ctx.shadowBlur = 8;
      star(b.x, b.y, b.s * l * tw, b.r);
    }
    bits = bits.filter(b => b.l > 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }

  size();
  window.addEventListener("resize", size);
  requestAnimationFrame(frame);
})();
