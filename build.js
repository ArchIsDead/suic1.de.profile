"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const os = require("os");
const { execSync } = require("child_process");

const ROOT = __dirname;
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const exists = file => !!file && fs.existsSync(path.join(ROOT, file));
const warnings = [];

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

function loadConfig() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(read("config.js") + "\n;this.__CFG = CFG;", sandbox);
  return sandbox.__CFG;
}

const CFG = loadConfig();

let ORIGIN;
try {
  ORIGIN = new URL(CFG.siteUrl).origin;
} catch (e) {
  process.stderr.write('config.js: siteUrl must be a full address like "https://4ndra.com"\n');
  process.exit(1);
}
const HOST = new URL(ORIGIN).hostname;

const esc = text => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const oneLine = text => String(text || "").replace(/\s+/g, " ").trim();
const abs = file => new URL(encodeURI(String(file).replace(/^\.?\//, "")), ORIGIN + "/").href;
const rootPath = file => "/" + encodeURI(String(file).replace(/^\.?\//, ""));

const TITLE = oneLine(CFG.siteTitle || CFG.name);
const DESCRIPTION = oneLine(CFG.siteDescription);
const NAME = oneLine(CFG.name);
const ABOUT = oneLine(CFG.aboutText);
const TAGS = (Array.isArray(CFG.tag) ? CFG.tag : [CFG.tag]).filter(Boolean);
const KEYWORDS = [...new Set((CFG.keywords || []).map(oneLine).filter(Boolean))];
const ALTERNATE_NAMES = [...new Set(KEYWORDS
  .map(word => (word.match(/^who is (.+)$/i) || [])[1])
  .filter(name => name && name.toLowerCase() !== NAME.toLowerCase()))];
const LOGO = CFG.favicon || CFG.avatar;

function excerpt(text, limit) {
  let out = "";
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = out ? out + " " + sentence : sentence;
    if (next.length > limit) break;
    out = next;
  }
  return out;
}
const BIO = excerpt(ABOUT, 200);

function lastModified() {
  try {
    const out = execSync("git log -1 --format=%cI", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (out) return out;
  } catch (e) {}
  return new Date().toISOString();
}
const MODIFIED = lastModified();
const LASTMOD = MODIFIED.slice(0, 10);

function pngSize(file) {
  try {
    const buf = fs.readFileSync(path.join(ROOT, file));
    if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch (e) {}
  return null;
}

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml" };
const FONT_MIME = { otf: "font/otf", ttf: "font/ttf", woff: "font/woff", woff2: "font/woff2" };
const extOf = file => (String(file).split("?")[0].split(".").pop() || "").toLowerCase();

[
  ["avatar", CFG.avatar], ["favicon", CFG.favicon], ["thumbnail", CFG.thumbnail], ["bg", CFG.bg],
  ["audio", CFG.showMusic ? CFG.audio : ""], ["font", CFG.font], ["fontText", CFG.fontText],
  ["cursor", CFG.cursor], ["playIcon", CFG.playIcon], ["pauseIcon", CFG.pauseIcon],
  ["particleImage", CFG.particleType === "image" ? CFG.particleImage : ""],
  ...(CFG.links || []).map(l => ["links." + l.n, l.i]),
  ...(CFG.copyIcons || []).map(c => ["copyIcons." + c.n, c.i]),
  ...(CFG.buttons || []).map(b => ["buttons." + b.label, b.image]),
].forEach(([key, file]) => {
  if (file && !/^https?:/i.test(file) && !/^[^.\s]{1,4}$/.test(file) && /\.\w+$/.test(file) && !exists(file)) {
    warnings.push(`${key}: file "${file}" was not found`);
  }
});

const FONT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "profile-fonts-"));

function prepareFonts() {
  const files = [CFG.font, CFG.fontText].filter(exists);
  files.forEach(file => fs.copyFileSync(path.join(ROOT, file), path.join(FONT_DIR, path.basename(file))));
  fs.writeFileSync(path.join(FONT_DIR, "fonts.conf"), [
    '<?xml version="1.0"?>',
    '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">',
    "<fontconfig>",
    `  <dir>${FONT_DIR}</dir>`,
    `  <cachedir>${path.join(FONT_DIR, "cache")}</cachedir>`,
    "</fontconfig>",
  ].join("\n"));
  process.env.FONTCONFIG_FILE = path.join(FONT_DIR, "fonts.conf");
}

function loadSharp() {
  prepareFonts();
  try { return require("sharp"); } catch (e) { return null; }
}

const sharp = loadSharp();

function fontFamily(file) {
  const buf = fs.readFileSync(path.join(ROOT, file));
  const tables = buf.readUInt16BE(4);
  for (let i = 0; i < tables; i++) {
    const record = 12 + i * 16;
    if (buf.toString("latin1", record, record + 4) !== "name") continue;
    const base = buf.readUInt32BE(record + 8);
    const count = buf.readUInt16BE(base + 2);
    const strings = base + buf.readUInt16BE(base + 4);
    for (let j = 0; j < count; j++) {
      const entry = base + 6 + j * 12;
      if (buf.readUInt16BE(entry) !== 3 || buf.readUInt16BE(entry + 6) !== 1) continue;
      const start = strings + buf.readUInt16BE(entry + 10);
      const length = buf.readUInt16BE(entry + 8);
      return Buffer.from(buf.subarray(start, start + length)).swap16().toString("utf16le");
    }
  }
  return null;
}

function makeIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size;
  entry[1] = size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

async function buildIcons() {
  if (!sharp || !exists(LOGO) || !MIME[extOf(LOGO)] || extOf(LOGO) === "gif") return;
  const source = path.join(ROOT, LOGO);
  const png = size => sharp(source).resize(size, size, { fit: "cover" }).png().toBuffer();
  fs.writeFileSync(path.join(ROOT, "icon-192.png"), await png(192));
  fs.writeFileSync(path.join(ROOT, "icon-512.png"), await png(512));
  fs.writeFileSync(path.join(ROOT, "apple-touch-icon.png"), await png(180));
  fs.writeFileSync(path.join(ROOT, "favicon.ico"), makeIco(await png(48), 48));
}

const haveIcons = () => ["icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon.ico"].every(exists);

function mixColor(hex, base, percent) {
  const parse = value => value.replace("#", "").match(/../g).map(part => parseInt(part, 16));
  const [a, b] = [parse(hex), parse(base)];
  const out = a.map((channel, i) => Math.round(channel * percent / 100 + b[i] * (100 - percent) / 100));
  return "#" + out.map(channel => channel.toString(16).padStart(2, "0")).join("");
}

async function fontsApplied(family) {
  const render = name => sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120"><text x="10" y="90" font-family="${name}" font-size="80">4ndra</text></svg>`
  )).raw().toBuffer();
  const [real, missing] = await Promise.all([render(family), render("no-such-font-zzz")]);
  return !real.equals(missing);
}

async function buildPreview() {
  const target = CFG.thumbnail;
  const staticImage = /\.(png|jpe?g|webp)$/i.test(CFG.avatar);
  if (target !== "og-image.png" || !sharp || !staticImage) return;
  if (![CFG.avatar, CFG.font, CFG.fontText].every(exists)) return;

  const nameFamily = fontFamily(CFG.font);
  const textFamily = fontFamily(CFG.fontText);
  if (!nameFamily || !textFamily || !(await fontsApplied(nameFamily))) return;

  const accent = /^#[0-9a-f]{6}$/i.test(CFG.accent) ? CFG.accent : "#b2b2b2";
  const bright = mixColor(accent, "#ffffff", 62);
  const mid = mixColor(accent, "#000000", 55);
  const deep = mixColor(accent, "#000000", 30);
  const [width, height] = [1200, 630];

  const nameLayer = async (size, fill) => sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="500"><text x="40" y="360" font-family="${nameFamily}" font-size="${size}" fill="${fill}">${esc(NAME)}</text></svg>`
  )).trim().png().toBuffer({ resolveWithObject: true });

  const probe = await nameLayer(200, "#ffffff");
  const size = Math.max(40, Math.min(150, Math.floor(200 * 560 / probe.info.width)));
  const front = await nameLayer(size, "#f4f4f4");
  const shadow = await nameLayer(size, mid);

  const tagLine = esc(TAGS[0] || DESCRIPTION);
  const blockHeight = front.info.height + 40 + 32 + 36 + 24;
  const top = Math.round((height - 24 - blockHeight) / 2);
  const tagY = top + front.info.height + 40 + 32;
  const host = esc(new URL(ORIGIN).host);
  const avatarLeft = 120;
  const avatarTop = Math.round((height - 24 - 300) / 2);

  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#1c1c1c"/></pattern></defs>
    <rect width="${width}" height="${height}" fill="#060606"/>
    <rect width="${width}" height="${height}" fill="url(#dots)"/>
    <rect x="84" y="84" width="1056" height="486" fill="${deep}"/>
    <rect x="63" y="63" width="1050" height="480" fill="#0c0c0c" stroke="${bright}" stroke-width="6"/>
    <rect x="${avatarLeft + 12}" y="${avatarTop + 12}" width="300" height="300" rx="90" fill="${deep}"/>
    <rect x="${avatarLeft - 6}" y="${avatarTop - 6}" width="312" height="312" rx="96" fill="${bright}"/>
    <text x="480" y="${tagY}" font-family="${textFamily}" font-size="32" fill="${bright}">${tagLine}</text>
    <text x="480" y="${tagY + 68}" font-family="${textFamily}" font-size="24" fill="${mid}">${host}</text>
  </svg>`);

  const avatar = await sharp(path.join(ROOT, CFG.avatar))
    .resize(300, 300, { fit: "cover" })
    .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" rx="90"/></svg>'), blend: "dest-in" }])
    .png()
    .toBuffer();

  const png = await sharp(base)
    .composite([
      { input: avatar, left: avatarLeft, top: avatarTop },
      { input: shadow.data, left: 480 + 8, top: top + 8 },
      { input: front.data, left: 480, top },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(ROOT, "og-image.png"), png);
}

function structuredData() {
  const profileUrl = ORIGIN + "/";
  const image = abs(CFG.avatar);
  const sameAs = (CFG.links || []).map(l => l.u).filter(u => /^https?:\/\//i.test(u));

  const person = {
    "@type": "Person",
    "@id": profileUrl + "#person",
    name: NAME,
    url: profileUrl,
    image,
    description: BIO || DESCRIPTION,
  };
  if (ALTERNATE_NAMES.length) person.alternateName = ALTERNATE_NAMES;
  if (sameAs.length) person.sameAs = sameAs;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": profileUrl + "#website",
        url: profileUrl,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "ProfilePage",
        "@id": profileUrl + "#profile",
        url: profileUrl,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        dateModified: LASTMOD,
        ...(KEYWORDS.length ? { keywords: KEYWORDS.join(", ") } : {}),
        isPartOf: { "@id": profileUrl + "#website" },
        mainEntity: { "@id": profileUrl + "#person" },
        primaryImageOfPage: { "@type": "ImageObject", url: image },
      },
      person,
    ],
  };
}

function analyticsTag() {
  const id = oneLine(CFG.analyticsId);
  if (!id) return "";
  return [
    '<link rel="preconnect" href="https://www.googletagmanager.com">',
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(id)}"></script>`,
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(id)}');</script>`,
  ].join("\n");
}

function fontTags() {
  const files = [CFG.font, CFG.fontText].filter(exists);
  const face = (family, file) => (file && exists(file) ? `@font-face{font-family:"${family}";src:url("${encodeURI(file)}");font-display:block}` : "");
  const preload = files.map(f => `<link rel="preload" href="${rootPath(f)}" as="font" type="${FONT_MIME[extOf(f)] || "font/ttf"}" crossorigin>`);
  return [...preload, `<style id="fonts">${face("Name Font", CFG.font)}${face("Text Font", CFG.fontText)}</style>`].join("\n");
}

function iconTags() {
  if (haveIcons()) {
    return [
      '<link rel="icon" href="/favicon.ico" sizes="48x48">',
      '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    ].join("\n");
  }
  const type = MIME[extOf(LOGO)];
  return `<link rel="icon"${type ? ` type="${type}"` : ""} href="${rootPath(LOGO)}">\n<link rel="apple-touch-icon" href="${rootPath(LOGO)}">`;
}

function profileHead() {
  const image = abs(CFG.thumbnail || CFG.avatar);
  const size = pngSize(CFG.thumbnail || CFG.avatar);
  const imageAlt = oneLine(`${NAME}, ${DESCRIPTION}`);
  const ld = JSON.stringify(structuredData()).replace(/</g, "\\u003c");

  return [
    `<title>${esc(TITLE)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}">`,
    KEYWORDS.length ? `<meta name="keywords" content="${esc(KEYWORDS.join(", "))}">` : "",
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
    `<link rel="canonical" href="${ORIGIN}/">`,
    `<meta name="author" content="${esc(NAME)}">`,
    `<meta name="application-name" content="${esc(TITLE)}">`,
    `<meta name="apple-mobile-web-app-title" content="${esc(TITLE)}">`,
    `<meta name="theme-color" content="${esc(CFG.chromeColor || "#060606")}">`,
    '<meta name="color-scheme" content="dark light">',
    '<meta name="format-detection" content="telephone=no">',
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(TITLE)}">`,
    `<meta property="og:title" content="${esc(TITLE)}">`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
    `<meta property="og:url" content="${ORIGIN}/">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}">`,
    size ? `<meta property="og:image:width" content="${size.width}">\n<meta property="og:image:height" content="${size.height}">` : "",
    MIME[extOf(CFG.thumbnail || CFG.avatar)] ? `<meta property="og:image:type" content="${MIME[extOf(CFG.thumbnail || CFG.avatar)]}">` : "",
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(TITLE)}">`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}">`,
    iconTags(),
    '<link rel="manifest" href="/site.webmanifest">',
    '<link rel="sitemap" type="application/xml" href="/sitemap.xml">',
    fontTags(),
    analyticsTag(),
    `<script type="application/ld+json">${ld}</script>`,
  ].filter(Boolean).join("\n");
}

function notFoundHead() {
  return [
    '<base href="/">',
    `<title>${esc(CFG.notFoundTitle || "404")} | ${esc(TITLE)}</title>`,
    '<meta name="robots" content="noindex, nofollow">',
    `<meta name="theme-color" content="${esc(CFG.chromeColor || "#060606")}">`,
    '<meta name="color-scheme" content="dark light">',
    iconTags(),
    fontTags(),
    analyticsTag(),
  ].filter(Boolean).join("\n");
}

function profileCard() {
  const links = (CFG.links || []).map(l => `<a href="${esc(l.u)}" rel="me noopener noreferrer">${esc(l.n)}</a>`).join("");
  const buttons = (CFG.buttons || []).filter(b => b.u).map(b => `<a class="btn" href="${esc(b.u)}">${esc(b.label)}</a>`).join("");
  const about = ABOUT
    ? `<section id="about"><h2 id="about-title">${esc(CFG.aboutTitle || "")}</h2><p id="about-text">${esc(CFG.aboutText)}</p></section>`
    : "";
  return [
    '    <header id="head">',
    '      <div id="pfp"></div>',
    '      <div id="who">',
    `        <h1 id="handle">${esc(NAME)}</h1>`,
    `        <p id="line">${esc(TAGS[0] || "")}</p>`,
    "      </div>",
    "    </header>",
    `    <div id="buttons">${buttons}</div>`,
    about ? `    ${about}` : "",
    `    <nav id="links" aria-label="links">${links}</nav>`,
  ].filter(Boolean).join("\n");
}

function notFoundCard(absoluteLink) {
  const target = CFG.notFoundLink || "/";
  const href = absoluteLink && target.startsWith("/") ? new URL(target, ORIGIN).href : target;
  return [
    '    <div id="lost">',
    `      <h1 id="lost-code">${esc(CFG.notFoundTitle || "404")}</h1>`,
    `      <p id="lost-text">${esc(CFG.notFoundText || "this page doesn't exist")}</p>`,
    `      <a id="lost-link" class="btn" href="${esc(href)}">${esc(CFG.notFoundButton || "back home")}</a>`,
    "    </div>",
  ].join("\n");
}

function render(template, { head, card, bodyAttr }) {
  return template
    .replace(/(<meta name="viewport"[^>]*>\n)[\s\S]*?(<link rel="stylesheet" href="style\.css">)/, (match, before, after) => `${before}${head}\n${after}`)
    .replace(/(<main id="card">\n)[\s\S]*?(\n  <\/main>)/, (match, before, after) => `${before}${card}${after}`)
    .replace(/<body[^>]*>/, bodyAttr ? `<body ${bodyAttr}>` : "<body>");
}

function sitemap() {
  const pages = [...new Set((CFG.sitemapPages && CFG.sitemapPages.length ? CFG.sitemapPages : ["/"]).map(p => "/" + String(p).replace(/^\/+/, "")))];
  const images = [...new Set([CFG.avatar, CFG.thumbnail].filter(exists).map(abs))];
  const entries = pages.map(p => {
    const lines = [`    <loc>${esc(new URL(p, ORIGIN).href)}</loc>`, `    <lastmod>${LASTMOD}</lastmod>`];
    if (p === "/") images.forEach(img => lines.push(`    <image:image>\n      <image:loc>${esc(img)}</image:loc>\n    </image:image>`));
    return `  <url>\n${lines.join("\n")}\n  </url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;

function manifest() {
  const icons = haveIcons()
    ? [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ]
    : [];
  return JSON.stringify({
    name: TITLE,
    short_name: NAME,
    description: DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: CFG.chromeColor || "#060606",
    theme_color: CFG.chromeColor || "#060606",
    icons,
  }, null, 2) + "\n";
}

const headers = () => [
  "/*",
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  X-Frame-Options: SAMEORIGIN",
  "",
].join("\n");

function loadRedirects() {
  if (!exists("redirect.json")) return {};
  let data;
  try {
    data = JSON.parse(read("redirect.json"));
  } catch (e) {
    warnings.push("redirect.json is not valid JSON");
    return {};
  }
  const redirects = {};
  for (const [from, to] of Object.entries(data)) {
    const key = "/" + String(from).trim().replace(/^\/+|\/+$/g, "").toLowerCase();
    const target = String(to).trim();
    const valid = /^https?:\/\//i.test(target) || target.startsWith("/");
    if (key === "/" || !valid || target.replace(/\/+$/, "").toLowerCase() === key) {
      warnings.push(`redirect.json: skipped "${from}"`);
      continue;
    }
    redirects[key] = target;
  }
  return redirects;
}

function worker(notFoundHtml) {
  const extra = (CFG.allowedHosts || []).map(h => String(h).toLowerCase());
  return `const SITE_HOST = ${JSON.stringify(HOST)};
const EXTRA_HOSTS = ${JSON.stringify(extra)};
const REDIRECTS = ${JSON.stringify(loadRedirects())};
const NOT_FOUND_HTML = ${JSON.stringify(notFoundHtml)};

function hostAllowed(host) {
  host = host.toLowerCase();
  if (host === SITE_HOST || host === "www." + SITE_HOST) return true;
  if (host === "localhost" || host === "[::1]" || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host)) return true;
  if (/\\.(pages\\.dev|workers\\.dev|local)$/.test(host)) return true;
  return EXTRA_HOSTS.includes(host);
}

function redirectTarget(url) {
  const key = url.pathname.replace(/\\/+$/, "").toLowerCase() || "/";
  const target = REDIRECTS[key];
  return target ? new URL(target, url.origin).href : null;
}

function isPage(url) {
  const last = url.pathname.split("/").pop();
  return !last.includes(".") || last.endsWith(".html");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www." + SITE_HOST) {
      url.hostname = SITE_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (!hostAllowed(url.hostname) && isPage(url)) {
      return new Response(request.method === "HEAD" ? null : NOT_FOUND_HTML, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex",
          "cache-control": "no-store",
        },
      });
    }

    const target = hostAllowed(url.hostname) ? redirectTarget(url) : null;
    if (target) return Response.redirect(target, 302);

    const response = await env.ASSETS.fetch(request);
    if (url.hostname === SITE_HOST) return response;

    const hidden = new Response(response.body, response);
    hidden.headers.set("x-robots-tag", "noindex");
    return hidden;
  },
};
`;
}

const NOT_DEPLOYED = new Set([
  "build.js", "package.json", "package-lock.json", "wrangler.jsonc", "wrangler.json", "wrangler.toml",
  "worker.js", "_worker.js", "redirect.json", "dist", "node_modules",
]);

function assemble() {
  const out = path.join(ROOT, "dist");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out);
  for (const entry of fs.readdirSync(ROOT)) {
    if (entry.startsWith(".") || NOT_DEPLOYED.has(entry)) continue;
    fs.cpSync(path.join(ROOT, entry), path.join(out, entry), { recursive: true });
  }
}

(async () => {
  await buildPreview();
  await buildIcons();

  const template = read("index.html");
  write("index.html", render(template, { head: profileHead(), card: profileCard() }));
  write("404.html", render(template, { head: notFoundHead(), card: notFoundCard(false), bodyAttr: 'data-view="notfound"' }));

  const workerPage = render(template, { head: notFoundHead(), card: notFoundCard(true), bodyAttr: 'data-view="notfound"' });
  write("worker.js", worker(workerPage));
  fs.rmSync(path.join(ROOT, "_worker.js"), { force: true });
  write("sitemap.xml", sitemap());
  write("robots.txt", robots());
  write("site.webmanifest", manifest());
  write("_headers", headers());
  assemble();

  if (!sharp && !haveIcons()) warnings.push("icons were not generated (run npm i sharp once, or keep the icon files already in the folder), the logo is used as the icon instead");
  warnings.forEach(message => process.stderr.write(`warning: ${message}\n`));
})();
