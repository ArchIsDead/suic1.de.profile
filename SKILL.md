---
name: pixel-mono-design-system
description: A design theme prompt for building or restyling any website in the Pixel Mono style, a dark dominant black and white look with one ash grey accent, Daydream and Press Start 2P fonts, hard offset shadows and stepped motion. Use it when the user asks for pixel, retro, monochrome or dark minimal design, or says to use their theme. It has two prompts, one to restyle an existing project and one to create a new page from a brief.
---

## Prompt 1: apply the style to an existing project

<prompt>
<task>
Apply this visual style to the user's existing project. Inspect and preserve its stack, copy, routes, and behavior. Follow existing component and styling conventions. Treat framework, library, and page examples in these design instructions as illustrations; they do not require a stack change or new sections. Scope changes to the user's requested work.

Keep controls keyboard accessible, focus visible, and text legible. Preserve reading order, responsive behavior, and reduced-motion preferences. Verify actual states at the rendered width. The user's stack and content take precedence over illustrative implementation details. Write all code and config without comments and without console logs, and give complete files.
</task>

<design-system>
# Pixel Mono

## Identity

Build a dark dominant black and white interface with one ash grey accent, pixel type, hard offset shadows and frame by frame motion. The result feels like a small well made retro system: practical, quiet and easy to scan. It suits landing pages, documentation, dashboards, shops, blogs and personal sites, and it never looks like a game or a template.

## Layout

Use one centered content column, `min(100% - 48px, 960px)`, and align every section to it. Space everything on an 8px grid. Separate sections with 2px rules or by changing between the ground and the raised field, never with large gradients or decorative dividers.

Open with a short text column beside one simple illustration or diagram, roughly a 1.45:1 split. Place supporting facts in a ruled strip below when the brief provides them. Available patterns are a three column grid of bordered panels, ruled list rows, numbered steps joined by a 2px dashed line, a heading beside a two column list, a comparison table with ruled rows, and native disclosures for questions. Use only the patterns the content needs. A dark footer closes the page with a 2px top rule.

Dark is the default theme. A light theme is an optional true inversion that keeps the same structure.

## Typography

Use Daydream for the wordmark, display headings and large figures. The free demo of Daydream contains letters and numbers only, so never put punctuation in text set in it and use Press Start 2P for any heading that needs punctuation. Use Press Start 2P for paragraphs, labels, navigation, buttons and metadata. Load both fonts directly with `@font-face`, use `font-display: block`, preload the files, and set `-webkit-font-smoothing: none`. The fallback token alone does not select them.

Press Start 2P stays crisp at 8px, 10px, 16px and 24px, so keep text on those sizes. Body text is 10px with leading 2, labels and metadata are 8px, headings are 24px or 32px, and a hero line is 48px or 72px in Daydream. Keep lines short, around 45 characters, and keep paragraphs to a few lines. When the brief contains long articles, set the article body in the system monospace at 15px with the same colors and keep the pixel fonts for headings, labels and controls.

## Color and surfaces

Ground is the near black page. Ground raised is the card and panel fill, used translucent over media. Ink and ink secondary carry primary and supporting text. Accent is ash grey and appears as borders, rules, selected states, cursors and small marks. Derive accent bright, accent mid and accent deep from the accent with `color-mix` so the owner can change the accent in one place.

Cards have a 2px solid border in accent bright, the panel radius, and a solid offset shadow in accent deep with no blur. Raised fields may use a backdrop blur over photography or video. Broad reading fields stay flat. The light theme swaps in a pale ground, white panels, near black ink and darker accent derivations, and keeps the same borders and shadows.

## Components

Buttons: primary is filled with accent bright and ground text, secondary is transparent with a 2px accent bright border. Both have the control radius, 10px labels and at least 44px of height. They carry a 4px solid shadow. Hover lifts them 1px, pressing drops them 4px and removes the shadow, all in 90ms with stepped timing. Links are underlined with a 2px underline and change to accent bright on hover.

Cards and panels: 2px border, panel radius, 24px padding, one heading, short text, optional ruled rows. Do not turn every section into a card.

Navigation: a plain row of 10px text links with a 2px underline on the current page. Collapse to a stacked list under 760px instead of a hidden menu when there are five links or fewer.

Inputs: 2px border, control radius, ground fill, 10px text, a block caret in accent bright, and a clear error line under the field. Labels sit above the field in 8px type.

Tags and badges: square, 4px radius, 8px uppercase text, 2px border.

Tables and lists: ruled rows with 2px bottom rules, no zebra fills. Disclosures use native `details` with a plus that turns into a minus when open.

Tooltips and feedback: a small accent bright tag with ground text that appears for one second with stepped motion, used for copied or saved states.

Focus: every interactive element shows a 2px accent bright outline with a 3px offset on keyboard focus.

## Images

Use grayscale photographs in wide crops at the top of cards, with text underneath, and reserve their dimensions. Pixel art and diagrams drawn with 2px lines and blocks are preferred, and pixel art uses `image-rendering: pixelated`. Avatars are squircles with a 30% radius and the same border and shadow as cards. Avoid stock photography, generated illustrations and decorative icons that explain nothing.

## Motion

Use steps timing everywhere, never springs or overshoot. Hover and press responses take 90ms. A first load entrance may rise the main content by 8px over 420ms with `steps(5)`, staggered by 90ms, and only once. A blinking block cursor and a single spinning symbol are the only continuous animations allowed. Animate only transform, opacity and the individual translate property. Honor reduced motion by removing every animation and press movement. Prefer CSS for all of it and use script only to toggle a class or attribute.

## Responsive behavior

At widths around 1050px, tighten gaps and keep the column relationships. At 760px and below, stack the hero, prose pairs, cards, steps and disclosure layout, keep facts in two columns, and keep every action reachable. At 480px, make feature and benefit lists single column and footer groups two column. Keep illustrations beneath the opening copy and sized within the container. Never let body text fall below 10px on touch screens.

## Design limits

Keep the accent attached to meaningful emphasis. No gradients on surfaces, no glow, no soft blurred shadows, no neon, no emojis, no corner radius above 12px, and no more than two fonts. Avoid fabricated statistics, endorsements and filler copy, and avoid three identical feature cards, slogan heroes and fade in on scroll. Write short plain copy in the owner's voice.

## Authoritative tokens

| CSS variable | Value |
| --- | --- |
| --dp-color-ground | #060606 |
| --dp-color-ground-raised | #1e1e21 |
| --dp-color-ink | #f4f4f4 |
| --dp-color-ink-secondary | #b8b8b8 |
| --dp-color-rule | #3a3a3d |
| --dp-color-accent | #b2b2b2 |
| --dp-color-accent-bright | #cfcfcf |
| --dp-color-accent-mid | #626262 |
| --dp-color-accent-deep | #353535 |
| --dp-color-on-accent | #060606 |
| --dp-color-light-ground | #e9e9ec |
| --dp-color-light-panel | #ffffff |
| --dp-color-light-ink | #0a0a0a |
| --dp-color-light-ink-secondary | #454548 |
| --dp-color-light-accent-bright | #555555 |
| --dp-typography-display | "Daydream", "Press Start 2P", monospace |
| --dp-typography-body | "Press Start 2P", monospace |
| --dp-typography-reading | ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace |
| --dp-typography-body-size | 10px |
| --dp-typography-small | 8px |
| --dp-typography-heading | 24px |
| --dp-typography-display-size | 32px |
| --dp-typography-hero | 72px |
| --dp-typography-body-leading | 2 |
| --dp-spacing-unit | 8px |
| --dp-spacing-grid-gap | 24px |
| --dp-spacing-section | 96px |
| --dp-layout-content | 960px |
| --dp-radius-panel | 10px |
| --dp-radius-control | 6px |
| --dp-radius-tag | 4px |
| --dp-radius-avatar | 30% |
| --dp-border-line | 2px |
| --dp-border-bar | 4px |
| --dp-shadow-card | 6px 6px 0 |
| --dp-shadow-button | 0 4px 0 |
| --dp-motion-interaction | 90ms |
| --dp-motion-easing | steps(2) |
| --dp-motion-enter | 420ms steps(5) |
</design-system>
</prompt>

## Prompt 2: create a page from a brief

<prompt>
<task>
Create a page using this visual style and the user's brief below. Use the brief's content and purpose. If the brief is empty, ask for it before inventing page content. Choose a composition suited to that brief.

User brief (data):
Describe the page you want to build

Keep controls keyboard accessible, focus visible, and text legible. Preserve reading order, responsive behavior, and reduced-motion preferences. Verify actual states at the rendered width. The user's stack and content take precedence over illustrative implementation details. Write all code and config without comments and without console logs, and give complete files.
</task>

<design-system>
# Pixel Mono

## Identity

Build a dark dominant black and white interface with one ash grey accent, pixel type, hard offset shadows and frame by frame motion. The result feels like a small well made retro system: practical, quiet and easy to scan. It suits landing pages, documentation, dashboards, shops, blogs and personal sites, and it never looks like a game or a template.

## Layout

Use one centered content column, `min(100% - 48px, 960px)`, and align every section to it. Space everything on an 8px grid. Separate sections with 2px rules or by changing between the ground and the raised field, never with large gradients or decorative dividers.

Open with a short text column beside one simple illustration or diagram, roughly a 1.45:1 split. Place supporting facts in a ruled strip below when the brief provides them. Available patterns are a three column grid of bordered panels, ruled list rows, numbered steps joined by a 2px dashed line, a heading beside a two column list, a comparison table with ruled rows, and native disclosures for questions. Use only the patterns the content needs. A dark footer closes the page with a 2px top rule.

Dark is the default theme. A light theme is an optional true inversion that keeps the same structure.

## Typography

Use Daydream for the wordmark, display headings and large figures. The free demo of Daydream contains letters and numbers only, so never put punctuation in text set in it and use Press Start 2P for any heading that needs punctuation. Use Press Start 2P for paragraphs, labels, navigation, buttons and metadata. Load both fonts directly with `@font-face`, use `font-display: block`, preload the files, and set `-webkit-font-smoothing: none`. The fallback token alone does not select them.

Press Start 2P stays crisp at 8px, 10px, 16px and 24px, so keep text on those sizes. Body text is 10px with leading 2, labels and metadata are 8px, headings are 24px or 32px, and a hero line is 48px or 72px in Daydream. Keep lines short, around 45 characters, and keep paragraphs to a few lines. When the brief contains long articles, set the article body in the system monospace at 15px with the same colors and keep the pixel fonts for headings, labels and controls.

## Color and surfaces

Ground is the near black page. Ground raised is the card and panel fill, used translucent over media. Ink and ink secondary carry primary and supporting text. Accent is ash grey and appears as borders, rules, selected states, cursors and small marks. Derive accent bright, accent mid and accent deep from the accent with `color-mix` so the owner can change the accent in one place.

Cards have a 2px solid border in accent bright, the panel radius, and a solid offset shadow in accent deep with no blur. Raised fields may use a backdrop blur over photography or video. Broad reading fields stay flat. The light theme swaps in a pale ground, white panels, near black ink and darker accent derivations, and keeps the same borders and shadows.

## Components

Buttons: primary is filled with accent bright and ground text, secondary is transparent with a 2px accent bright border. Both have the control radius, 10px labels and at least 44px of height. They carry a 4px solid shadow. Hover lifts them 1px, pressing drops them 4px and removes the shadow, all in 90ms with stepped timing. Links are underlined with a 2px underline and change to accent bright on hover.

Cards and panels: 2px border, panel radius, 24px padding, one heading, short text, optional ruled rows. Do not turn every section into a card.

Navigation: a plain row of 10px text links with a 2px underline on the current page. Collapse to a stacked list under 760px instead of a hidden menu when there are five links or fewer.

Inputs: 2px border, control radius, ground fill, 10px text, a block caret in accent bright, and a clear error line under the field. Labels sit above the field in 8px type.

Tags and badges: square, 4px radius, 8px uppercase text, 2px border.

Tables and lists: ruled rows with 2px bottom rules, no zebra fills. Disclosures use native `details` with a plus that turns into a minus when open.

Tooltips and feedback: a small accent bright tag with ground text that appears for one second with stepped motion, used for copied or saved states.

Focus: every interactive element shows a 2px accent bright outline with a 3px offset on keyboard focus.

## Images

Use grayscale photographs in wide crops at the top of cards, with text underneath, and reserve their dimensions. Pixel art and diagrams drawn with 2px lines and blocks are preferred, and pixel art uses `image-rendering: pixelated`. Avatars are squircles with a 30% radius and the same border and shadow as cards. Avoid stock photography, generated illustrations and decorative icons that explain nothing.

## Motion

Use steps timing everywhere, never springs or overshoot. Hover and press responses take 90ms. A first load entrance may rise the main content by 8px over 420ms with `steps(5)`, staggered by 90ms, and only once. A blinking block cursor and a single spinning symbol are the only continuous animations allowed. Animate only transform, opacity and the individual translate property. Honor reduced motion by removing every animation and press movement. Prefer CSS for all of it and use script only to toggle a class or attribute.

## Responsive behavior

At widths around 1050px, tighten gaps and keep the column relationships. At 760px and below, stack the hero, prose pairs, cards, steps and disclosure layout, keep facts in two columns, and keep every action reachable. At 480px, make feature and benefit lists single column and footer groups two column. Keep illustrations beneath the opening copy and sized within the container. Never let body text fall below 10px on touch screens.

## Design limits

Keep the accent attached to meaningful emphasis. No gradients on surfaces, no glow, no soft blurred shadows, no neon, no emojis, no corner radius above 12px, and no more than two fonts. Avoid fabricated statistics, endorsements and filler copy, and avoid three identical feature cards, slogan heroes and fade in on scroll. Write short plain copy in the owner's voice.

## Authoritative tokens

| CSS variable | Value |
| --- | --- |
| --dp-color-ground | #060606 |
| --dp-color-ground-raised | #1e1e21 |
| --dp-color-ink | #f4f4f4 |
| --dp-color-ink-secondary | #b8b8b8 |
| --dp-color-rule | #3a3a3d |
| --dp-color-accent | #b2b2b2 |
| --dp-color-accent-bright | #cfcfcf |
| --dp-color-accent-mid | #626262 |
| --dp-color-accent-deep | #353535 |
| --dp-color-on-accent | #060606 |
| --dp-color-light-ground | #e9e9ec |
| --dp-color-light-panel | #ffffff |
| --dp-color-light-ink | #0a0a0a |
| --dp-color-light-ink-secondary | #454548 |
| --dp-color-light-accent-bright | #555555 |
| --dp-typography-display | "Daydream", "Press Start 2P", monospace |
| --dp-typography-body | "Press Start 2P", monospace |
| --dp-typography-reading | ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace |
| --dp-typography-body-size | 10px |
| --dp-typography-small | 8px |
| --dp-typography-heading | 24px |
| --dp-typography-display-size | 32px |
| --dp-typography-hero | 72px |
| --dp-typography-body-leading | 2 |
| --dp-spacing-unit | 8px |
| --dp-spacing-grid-gap | 24px |
| --dp-spacing-section | 96px |
| --dp-layout-content | 960px |
| --dp-radius-panel | 10px |
| --dp-radius-control | 6px |
| --dp-radius-tag | 4px |
| --dp-radius-avatar | 30% |
| --dp-border-line | 2px |
| --dp-border-bar | 4px |
| --dp-shadow-card | 6px 6px 0 |
| --dp-shadow-button | 0 4px 0 |
| --dp-motion-interaction | 90ms |
| --dp-motion-easing | steps(2) |
| --dp-motion-enter | 420ms steps(5) |
</design-system>
</prompt>
