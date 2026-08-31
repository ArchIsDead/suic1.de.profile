const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];

function ext(path) {
  const clean = path.split("?")[0].split("#")[0];
  return (clean.split(".").pop() || "").toLowerCase();
}

function isVideo(path) {
  return VIDEO_EXT.includes(ext(path));
}

function mediaEl(path, cls) {
  if (isVideo(path)) {
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

function iconOrText(target, value) {
  target.innerHTML = "";
  if (!value) return;
  const looksLikeFile = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov|m4v)(\?|#|$)/i.test(value);
  const looksLikeUrl = /^https?:\/\//i.test(value);
  if (looksLikeFile || looksLikeUrl) {
    target.appendChild(mediaEl(value));
  } else {
    target.textContent = value;
  }
}

const gt = document.getElementById("gate");
const cd = document.getElementById("card");
const tk = document.getElementById("track");
const sb = document.getElementById("soundToggle");
const si = document.getElementById("soundIcon");
const lr = document.getElementById("links");
const line = document.getElementById("line");

document.getElementById("track").src = CFG.audio;
document.getElementById("soundIcon").src = CFG.playIcon;

iconOrText(document.getElementById("gate-mark"), CFG.gateIcon);

const bgWrap = document.getElementById("bgWrap");
bgWrap.appendChild(mediaEl(CFG.bg, "bg-media"));

if (CFG.showProfile) {
  const pfpWrap = document.getElementById("pfpWrap");
  pfpWrap.appendChild(mediaEl(CFG.avatar, "pfp-media"));
} else {
  document.getElementById("pfpWrap").remove();
}

document.getElementById("handle").textContent = CFG.name;

if (!CFG.showTag) {
  line.remove();
} else {
  reserveTagSpace();
  window.addEventListener("resize", reserveTagSpace);
}

function reserveTagSpace() {
  line.style.minHeight = "0px";
  const original = line.textContent;
  line.textContent = CFG.tag;
  line.style.minHeight = `${line.scrollHeight}px`;
  line.textContent = original;
}

if (CFG.cursor) {
  const st = document.createElement("style");
  st.textContent = `* { cursor: url("${CFG.cursor}") ${CFG.cursorHotspot}, auto !important; }`;
  document.head.appendChild(st);
}

if (CFG.font) {
  const ff = new FontFace("Porky's", `url("${CFG.font}")`);
  ff.load().then(f => document.fonts.add(f)).catch(() => {});
}

let typeTimer = null;
function typeInto(el, txt, speed) {
  clearTimeout(typeTimer);
  let i = 0, deleting = false;
  (function step() {
    el.textContent = txt.slice(0, i);
    if (!deleting) {
      i++;
      if (i > txt.length) {
        deleting = true;
        typeTimer = setTimeout(step, CFG.typePauseAtEnd);
        return;
      }
    } else {
      i--;
      if (i < 0) {
        i = 0;
        deleting = false;
        typeTimer = setTimeout(step, CFG.typePauseAtStart);
        return;
      }
    }
    typeTimer = setTimeout(step, deleting ? speed / 2 : speed);
  })();
}

CFG.links.forEach(({ n, u, i }) => {
  const a = document.createElement("a");
  a.href = u;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.title = n;
  a.appendChild(mediaEl(i));
  lr.appendChild(a);
});

(CFG.copyIcons || []).forEach(({ n, v, i }) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "iconCopy";
  b.title = n;
  b.appendChild(mediaEl(i));
  b.addEventListener("click", () => {
    navigator.clipboard.writeText(v);
    b.classList.add("copied");
    setTimeout(() => b.classList.remove("copied"), 900);
  });
  lr.appendChild(b);
});

gt.addEventListener("click", () => {
  gt.classList.add("gone");
  tk.volume = 0.6;
  tk.play().catch(() => {});
  si.src = CFG.pauseIcon;
  startBackdrop();
  sb.classList.add("in");
  setTimeout(() => {
    cd.classList.add("in");
    if (CFG.showTag && CFG.typeText) {
      typeInto(line, CFG.tag, CFG.typeSpeed);
    } else if (CFG.showTag) {
      line.textContent = CFG.tag;
    }
  }, CFG.typeStartDelay);
});

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

const TILT_MAX = 12;
function tilt(x, y) {
  const r = cd.getBoundingClientRect();
  const px = (x - r.left) / r.width - 0.5;
  const py = (y - r.top) / r.height - 0.5;
  cd.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${(-py * 2 * TILT_MAX).toFixed(2)}deg) rotateY(${(px * 2 * TILT_MAX).toFixed(2)}deg)`;
}
function untilt() {
  cd.style.transform = "translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg)";
}
cd.addEventListener("mousemove", e => tilt(e.clientX, e.clientY));
cd.addEventListener("mouseleave", untilt);
cd.addEventListener("touchmove", e => tilt(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
cd.addEventListener("touchend", untilt);

function startBackdrop() {
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
      swaySpeed: (Math.random() * 0.6 + 0.7) / 3,
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
      const sway = Math.sin(performance.now() * 0.001 * d.swaySpeed + d.phase) * 80;
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

(function startSparkTrail() {
  const c = document.getElementById("trail");
  const ctx = c.getContext("2d");
  let particles = [];
  let mx = -999, my = -999, lastX = -999, lastY = -999;

  document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

  function size() { c.width = window.innerWidth; c.height = window.innerHeight; }

  function star(px, py, s, rot) {
    ctx.save();
    ctx.translate(px, py);
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

  const palette = ["#ffffff", "#dcdcdc", "#f2f2f2"];

  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    if (mx !== lastX || my !== lastY) {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          l: 1,
          s: 3 * (0.5 + Math.random() * 0.7),
          r: Math.random() * Math.PI * 2,
          rs: (Math.random() - 0.5) * 0.12,
          tw: Math.random() * Math.PI * 2,
          c: palette[Math.floor(Math.random() * palette.length)],
        });
      }
      lastX = mx; lastY = my;
    }
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      p.r += p.rs;
      p.l -= 1 / 30;
      const l = Math.max(p.l, 0);
      const tw = 0.75 + 0.25 * Math.sin(performance.now() * 0.015 + p.tw);
      ctx.globalAlpha = l;
      ctx.fillStyle = p.c;
      ctx.shadowColor = p.c;
      ctx.shadowBlur = 8;
      star(p.x, p.y, p.s * l * tw, p.r);
    }
    particles = particles.filter(p => p.l > 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }

  size();
  window.addEventListener("resize", size);
  requestAnimationFrame(frame);
})();
