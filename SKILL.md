---
name: pixel-monochrome-ui
description: Design and build websites in the 4ndra pixel style, a dark dominant black and white interface with one ash grey accent, Daydream for the name and Press Start 2P for every other text, hard pixel shadows, stepped animation and no AI-looking decoration. Use it for profile or link in bio pages, portfolios, landing pages, 404 pages and small personal sites whenever the user asks for pixel, retro, monochrome, dark or "not AI looking" design, or says "make it like my site".
---

# Pixel monochrome UI

Build sites that look hand made, not generated. Everything is dark first, black and white, with one ash grey accent. Text is pixel type. Depth comes from hard offset shadows, never from glow or blur.

## Rules that decide the look

1. Dark is the default theme. Light is optional and must be a real inversion, not an afterthought.
2. Only black, white, grays and one accent. Default accent is ash grey `#b2b2b2`. No gradients on surfaces, no neon, no glow, no colored shadows.
3. Shadows are solid and offset, like `6px 6px 0` in a darker shade of the accent. Never use soft blurred drop shadows on cards.
4. Borders are 2px solid. Radii are small: card 10px, buttons 6px, text boxes 4px. The profile picture is a squircle (`border-radius: 30%`, plus `corner-shape: squircle` where supported).
5. Motion uses `steps()` or `step-end` timing so it feels like frames. No spring or overshoot easing.
6. No emojis anywhere. Use text symbols with the text variation selector when an icon character is needed, for example `☢︎` or `☄︎`.
7. Content first. One card, one clear column, no decorative sections, no feature grids, no hero slogans.
8. Copy is short, lowercase friendly and written in the owner's voice. No dashes used as punctuation. Never invent facts or filler text.

## Typography

Two fonts only.

| Use | Font | Notes |
| --- | --- | --- |
| Name, big numbers, 404 | Daydream | Demo version has letters and numbers only, no punctuation. Personal use only, swap for a licensed font on commercial sites. |
| Every other text | Press Start 2P | Open license. Use 8px, 10px or 16px so the pixels stay crisp. |

```css
@font-face {
  font-family: "Name Font";
  src: url("Daydream.otf");
  font-display: block;
}

@font-face {
  font-family: "Text Font";
  src: url("PressStart2P.ttf");
  font-display: block;
}

:root {
  --font-name: "Name Font", "Press Start 2P", monospace;
  --font-text: "Text Font", "Press Start 2P", monospace;
}

body {
  font-family: var(--font-text);
  -webkit-font-smoothing: none;
}
```

Preload both font files in the head with `as="font"` and `crossorigin`. Body text is 8px with `line-height: 2`, tag lines 10px with `line-height: 1.6`, the name 32px with `letter-spacing: 2px`, the 404 number 72px.

## Color tokens

Derive every shade from one `--accent` so the owner can change it in one place.

```css
:root {
  --accent: #b2b2b2;
  --accent-bright: color-mix(in srgb, var(--accent) 62%, #fff);
  --accent-mid: color-mix(in srgb, var(--accent) 55%, #000);
  --accent-deep: color-mix(in srgb, var(--accent) 30%, #000);
  --text: #f4f4f4;
  --text-soft: rgba(244, 244, 244, 0.72);
  --line: var(--accent-bright);
  --line-dim: color-mix(in srgb, var(--accent) 48%, transparent);
  --glass-fill: rgba(30, 30, 33, 0.66);
  --inner-fill: rgba(255, 255, 255, 0.07);
  --page: #060606;
}

:root[data-theme="light"] {
  --accent-bright: color-mix(in srgb, var(--accent) 48%, #000);
  --accent-mid: color-mix(in srgb, var(--accent) 70%, #000);
  --accent-deep: color-mix(in srgb, var(--accent) 55%, #000);
  --text: #0a0a0a;
  --text-soft: rgba(10, 10, 10, 0.72);
  --glass-fill: rgba(255, 255, 255, 0.6);
  --inner-fill: rgba(255, 255, 255, 0.55);
  --page: #e9e9ec;
}
```

Tooltips and selection use `background: var(--accent-bright); color: var(--page)` so they stay readable in both themes. Never place pure white text on the accent.

## Components

**Card.** One centered card, `width: min(92%, 26rem)`, `padding: 24px 22px`, `border: 2px solid var(--line)`, `border-radius: 10px`, `box-shadow: 6px 6px 0 var(--accent-deep)`, translucent dark fill with `backdrop-filter: blur(26px)`. Cap it with `max-height: calc(100% - 24px)` and let the text block scroll.

**Header.** Squircle picture 72px with a 2px border and `3px 3px 0` shadow. Next to it the name in the name font with `text-shadow: 2px 2px 0 var(--accent-mid)`, and under it the tag line in 10px type ending with a blinking block cursor made from an `::after` box that blinks with `steps(1)`.

**Icon row.** Plain 28px icons centered with `gap: 22px`, no boxes. Hover lifts 2px, press drops 2px, both with `transition: transform 90ms steps(2)`.

**Text block.** No filled box. Use a 4px left bar in `--line-dim`, a small uppercase title with a `> ` prefix in `--accent-bright`, and body text in 8px.

**Buttons.** 2px border, 6px radius, `box-shadow: 0 4px 0 var(--accent-deep)`. Hover lifts 1px and grows the shadow to 5px. Active moves down 4px and the shadow goes to 0. This is the whole press animation and it needs no JavaScript.

**Copy feedback.** A small tooltip reading `copied` above the icon and a three step hop on the icon, both started by a `data-copied` attribute that script sets and removes after about one second.

**Gate.** A full screen blurred layer over the real background with one centered symbol and no text. The symbol spins with `animation: spin 6s linear infinite` when spinning is enabled. Clicking anywhere enters and starts the music.

**Not found page.** The same card holding a big `404` in the name font, one line of text, and one button back home. Wildcard subdomains and unknown paths must show it.

## Motion

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

#card.in > * {
  animation: rise 420ms steps(5) both;
}

@keyframes hop {
  0% { transform: translateY(0); }
  22% { transform: translateY(-14px); }
  34% { transform: translateY(-18px); }
  58% { transform: translateY(-6px); }
  70% { transform: translateY(0) scale(1.08, 0.86); }
  92% { transform: translateY(0); }
}

#handle.hop {
  animation: hop 560ms step-end;
}
```

Stagger children by 90ms using `:nth-child`. Animate only `transform`, `opacity` and the individual `translate` property. Respect `prefers-reduced-motion`. Prefer CSS over JavaScript for every hover, press and entrance effect, and use script only to toggle a class or attribute.

## Background and effects

- The background is a looping muted video or an image, grayscaled and dimmed by a veil (`rgba(0, 0, 0, 0.4)`).
- Apply grayscale and blur with an overlay that uses `backdrop-filter`, never with `filter` on the video, because filters on video freeze playback in Safari.
- Set `muted`, `playsinline`, `loop`, `autoplay` and `preload="auto"` as attributes. Retry `play()` on the first tap and run a one second watchdog that restarts a paused or frozen video.
- Rain particles are optional and off by default. Each particle is a pixel square, a character from a list, or a custom image, with configurable color, size, speed and count. Snap positions to whole pixels.
- Mouse sparks are small squares that fade out and only exist on devices with hover.

## Content protection

Make casual saving hard without breaking links.

- `user-select: none` and `-webkit-touch-callout: none` on everything.
- `pointer-events: none` and `-webkit-user-drag: none` on every `img` and `video`, so long press and "open image in new tab" never target them. Links and buttons that contain images still work.
- Prevent `contextmenu`, `dragstart` and `selectstart` on the document, with an exception for the hidden textarea used by the copy fallback.
- Tell the owner honestly that this stops casual saving only, since anything the browser loads can still be fetched.

## Config driven structure

Keep one `config.js` as the only place the owner edits. It holds the name, tag lines, text, links, colors, fonts, media files, effect switches and the not found text. Config files contain no notes. The page script reads it, writes CSS variables and builds the DOM. A Node `build.js` reads the same file and generates:

- the full head: title, description, keywords, canonical, robots, Open Graph, Twitter card, icons, manifest, font preloads and the analytics tag
- JSON-LD with `WebSite`, `ProfilePage` and `Person`, using `sameAs` from the social links and `alternateName` taken from keyword phrases like `who is name`
- `sitemap.xml` with `lastmod` from the last git commit and an image entry, plus `robots.txt` pointing to it
- `site.webmanifest` and every icon size from the logo
- `og-image.png` drawn by code with the real fonts, skipped safely if the drawing library is missing
- `404.html` and the edge worker, which also reads `redirect.json` for short links such as `/discord`

Prerender the name, tag line, text and link names into the HTML so crawlers that do not run scripts can read them.

## Hosting

Use Cloudflare Workers with static assets. `wrangler.jsonc` points `main` to the worker, serves `./dist` with `run_worker_first: true` and `not_found_handling: "404-page"`, and lists the custom domains plus a wildcard route. The worker redirects `www` to the main host, serves redirects from `redirect.json`, answers wildcard subdomains with a real 404, and adds `x-robots-tag: noindex` on every host except the main one. Build command is `node build.js` and deploy command is `npx wrangler deploy`.

## Anti AI look checklist

Reject the design if any of these appear:

- purple, blue or pink gradients, glowing text or box shadows, neon borders
- rounded corners above 12px on cards, pill buttons, floating blobs or mesh backgrounds
- emojis used as icons or bullets
- three identical feature cards, a hero with a slogan and two buttons, stock testimonials
- icon in a colored circle beside every line
- generic copy like "welcome to my website" or "crafting digital experiences"
- bouncy spring easing, everything fading up on scroll, parallax for its own sake

Do this instead: one focused card, a strict grid of 2px lines, real personal wording, stepped motion, honest empty space, and one small surprise such as the name hop or the copy hop.

## Delivery rules

- No comments in any code, config or markup file, and no console logs in site code.
- Write small named functions, clear variable names, and keep each file readable on its own.
- Give complete files, never partial snippets, and say which files changed.
- Test in a real browser before handing over: dark and light, desktop and phone, the gate, the copy feedback, the not found page, a wildcard host and a keyboard tab through the links.
- Check that the fonts really loaded, that no request fails, and that the generated sitemap, JSON-LD and manifest parse.
- Never claim search ranking results. Metadata and a sitemap help indexing, they do not guarantee a position.
