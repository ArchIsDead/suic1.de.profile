#!/usr/bin/env node
"use strict";

/*
  Reads config.js and generates everything search engines and browsers need:
  head metadata, structured data, sitemap.xml, robots.txt, site.webmanifest,
  icons, _headers, 404.html and _worker.js.

  Run it with:  node build.js
  On Cloudflare Pages set: Build command = node build.js, Output directory = .
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");

const ROOT = __dirname;
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const exists = file => !!file && fs.existsSync(path.join(ROOT, file));
const warnings = [];

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
  console.log("wrote", file);
}

function loadConfig() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(read("config.js") + "\n;this.__CFG = CFG;", sandbox);
  return sandbox.__CFG;
}

const CFG = loadConfig();

/* ---------- basics ---------- */

let ORIGIN;
try {
  ORIGIN = new URL(CFG.siteUrl).origin;
} catch (e) {
  console.error('config.js: siteUrl must be a full address like "https://4ndra.com"');
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

/* ---------- check referenced files ---------- */

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

/* ---------- icons from the logo ---------- */

let sharp = null;
try { sharp = require("sharp"); } catch (e) {}

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
  console.log("wrote icon-192.png icon-512.png apple-touch-icon.png favicon.ico");
}

const haveIcons = () => ["icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon.ico"].every(exists);

/* ---------- structured data ---------- */

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
  if (CFG.personAliases && CFG.personAliases.length) person.alternateName = CFG.personAliases;
  if (CFG.personJob) person.jobTitle = CFG.personJob;
  if (CFG.personWorksFor) person.worksFor = { "@type": "Organization", name: CFG.personWorksFor };
  if (CFG.personCountry) person.address = { "@type": "PostalAddress", addressCountry: CFG.personCountry };
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
        isPartOf: { "@id": profileUrl + "#website" },
        mainEntity: { "@id": profileUrl + "#person" },
        primaryImageOfPage: { "@type": "ImageObject", url: image },
      },
      person,
    ],
  };
}

/* ---------- head blocks ---------- */

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

/* ---------- card blocks (prerendered so crawlers can read the text) ---------- */

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
  let html = template
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => `<!-- seo:start -->\n${head}\n<!-- seo:end -->`)
    .replace(/<!-- card:start -->[\s\S]*?<!-- card:end -->/, () => `<!-- card:start -->\n${card}\n<!-- card:end -->`);
  html = html.replace(/<body[^>]*>/, bodyAttr ? `<body ${bodyAttr}>` : "<body>");
  return html;
}

/* ---------- sitemap, robots, manifest, headers, worker ---------- */

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
  "https://:project.pages.dev/*",
  "  X-Robots-Tag: noindex",
  "",
].join("\n");

function worker(notFoundHtml) {
  const extra = (CFG.allowedHosts || []).map(h => String(h).toLowerCase());
  return `// generated by build.js, edit config.js and run node build.js instead
const SITE_HOST = ${JSON.stringify(HOST)};
const EXTRA_HOSTS = ${JSON.stringify(extra)};
const NOT_FOUND_HTML = ${JSON.stringify(notFoundHtml)};

function hostAllowed(host) {
  host = host.toLowerCase();
  if (host === SITE_HOST || host === "www." + SITE_HOST) return true;
  if (host === "localhost" || host === "[::1]" || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host)) return true;
  if (/\\.(pages\\.dev|workers\\.dev|local)$/.test(host)) return true;
  return EXTRA_HOSTS.includes(host);
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

    return env.ASSETS.fetch(request);
  },
};
`;
}

/* ---------- run ---------- */

(async () => {
  await buildIcons();

  const template = read("index.html");
  write("index.html", render(template, { head: profileHead(), card: profileCard() }));
  write("404.html", render(template, { head: notFoundHead(), card: notFoundCard(false), bodyAttr: 'data-view="notfound"' }));

  const workerPage = render(template, { head: notFoundHead(), card: notFoundCard(true), bodyAttr: 'data-view="notfound"' });
  write("_worker.js", worker(workerPage));
  write("sitemap.xml", sitemap());
  write("robots.txt", robots());
  write("site.webmanifest", manifest());
  write("_headers", headers());

  if (!sharp && !haveIcons()) warnings.push("icons were not generated (run npm i sharp once, or keep the icon files already in the folder), the logo is used as the icon instead");
  warnings.forEach(w => console.warn("warning:", w));
  console.log("done");
})();
