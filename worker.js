const SITE_HOST = "4ndra.com";
const EXTRA_HOSTS = [];
const REDIRECTS = {"/discord":"https://discord.gg/B5JP6zRRHe","/telegram":"https://t.me/archsix","/github":"https://github.com/ArchIsDead"};
const NOT_FOUND_HTML = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n<base href=\"/\">\n<title>404 | 4ndra</title>\n<meta name=\"robots\" content=\"noindex, nofollow\">\n<meta name=\"theme-color\" content=\"#000000\">\n<meta name=\"color-scheme\" content=\"dark light\">\n<link rel=\"icon\" href=\"/favicon.ico\" sizes=\"48x48\">\n<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"/icon-192.png\">\n<link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">\n<link rel=\"preload\" href=\"/Daydream.otf\" as=\"font\" type=\"font/otf\" crossorigin>\n<link rel=\"preload\" href=\"/PressStart2P.ttf\" as=\"font\" type=\"font/ttf\" crossorigin>\n<style id=\"fonts\">@font-face{font-family:\"Name Font\";src:url(\"Daydream.otf\");font-display:block}@font-face{font-family:\"Text Font\";src:url(\"PressStart2P.ttf\");font-display:block}</style>\n<link rel=\"preconnect\" href=\"https://www.googletagmanager.com\">\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-QFRYX9FPTJ\"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QFRYX9FPTJ');</script>\n<link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body data-view=\"notfound\">\n\n<div id=\"gate\">\n  <div id=\"mark\"></div>\n</div>\n\n<div id=\"stage\">\n\n  <div id=\"back\"></div>\n  <canvas id=\"drift\"></canvas>\n  <audio id=\"track\" preload=\"none\"></audio>\n\n  <button id=\"sound\" type=\"button\" aria-label=\"toggle music\">\n    <img id=\"speaker\" src=\"\" alt=\"\">\n  </button>\n\n  <main id=\"card\">\n    <div id=\"lost\">\n      <h1 id=\"lost-code\">404</h1>\n      <p id=\"lost-text\">this page doesn't exist</p>\n      <a id=\"lost-link\" class=\"btn\" href=\"https://4ndra.com/\">back home</a>\n    </div>\n  </main>\n\n</div>\n\n<canvas id=\"trail\"></canvas>\n\n<script src=\"config.js\"></script>\n<script src=\"script.js\"></script>\n</body>\n</html>\n";

function hostAllowed(host) {
  host = host.toLowerCase();
  if (host === SITE_HOST || host === "www." + SITE_HOST) return true;
  if (host === "localhost" || host === "[::1]" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  if (/\.(pages\.dev|workers\.dev|local)$/.test(host)) return true;
  return EXTRA_HOSTS.includes(host);
}

function redirectTarget(url) {
  const key = url.pathname.replace(/\/+$/, "").toLowerCase() || "/";
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
