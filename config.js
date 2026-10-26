const CFG = {

  // ---------- profile ----------
  name: "RFour",                      // big name on the card
  tag: [                              // typed line under the name, add more lines to cycle through them
    "Suicide is the intentional act of ending one's own life.",
  ],
  avatar: "avatar.png",               // image or video file for the profile picture
  gateIcon: "☄︎",                      // click-to-enter screen icon (text, image or video). Leave "" for NO gate, the page opens right away

  // ---------- site info ----------
  siteTitle: "suic1.de",              // browser tab title
  siteDescription: "Suicide is the intentional act of ending one's own life.",   // link preview text
  thumbnail: "thumbnail.png",         // link preview image
  favicon: "favicon.png",             // tab icon
  theme: "auto",                      // "auto" follows the device, or force "dark" / "light"
  themeColor: "#ffffff",              // accent color
  chromeColor: "#060606",             // phone browser bar color

  // ---------- look ----------
  bg: "ssstik.io_1792942071307.mp4",   // background: image (jpg, png, gif, webp) or video (mp4, webm)
  bgDim: 0.45,                        // darkness over the background, 0 = none, 1 = fully covered (white veil in the light theme)
  bgGrayscale: true,                  // true = black and white background, false = original colors
  cursor: "cursor.png",               // custom cursor image, "" for the normal cursor
  cursorHotspot: "0 0",               // click point of the cursor image, "x y" in pixels
  font: "name-font.ttf",              // font file for the name, "" for the default font
  fontTag: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',       // font of the typed line
  fontButtons: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',   // font of the buttons

  // ---------- music ----------
  audio: "Good Looking_spotdown.org.mp3",   // music file, starts on the first tap or click
  audioVolume: 0.6,                   // 0 = silent, 1 = full volume
  audioLoop: true,                    // false = the song plays once and stops
  playIcon: "icon-play.png",          // sound button icon while paused
  pauseIcon: "icon-pause.png",        // sound button icon while playing

  // ---------- show or hide ----------
  showProfile: true,                  // profile picture
  showTag: true,                      // typed line
  showMusic: true,                    // music and sound button

  // ---------- effects ----------
  particles: true,                    // falling dots in the background
  particleCount: 70,                  // how many dots
  sparks: true,                       // star trail behind the mouse

  // ---------- screen rotation ----------
  forceLandscape: false,           // "mobile" rotates the page to wide only on phones and tablets, "always" on every device, false = off
  rotateBelow: 1,                     // rotate when width / height is below this number (1 = portrait screens)

  // ---------- shapes ----------
  cardWidth: "26rem",                 // max width of the card, like "22rem" or "420px"
  cardCorner: "28px",                 // roundness of the glass card
  buttonCorner: "16px",               // roundness of the buttons

  // ---------- typing effect ----------
  typeText: true,                     // false = show the line instantly
  typeSpeed: 55,                      // ms per letter, lower is faster
  typeStartDelay: 300,                // ms to wait before typing starts
  typePauseAtEnd: 1800,               // ms to wait after a line is typed
  typePauseAtStart: 500,              // ms to wait before the next line

  // ---------- glass ----------
  glassBlur: 26,                      // card frosting in px, 0 = clear glass, 10 soft, 26 default, 40+ very frosted
  glassTint: 1,                       // how white the glass is, 0 = almost invisible, 1 = default, 2 = milky
  glassShine: true,                   // soft highlight that follows the tilt
  backgroundBlur: 0,                  // blur on the background in px, 0 = sharp

  // ---------- 3D tilt ----------
  tilt: true,                         // false = card stays flat
  tiltTrigger: "hold",                // "move" tilts while the mouse or phone moves, "hold" tilts only while you press or touch the screen
  tiltMode: "auto",                   // only for "move": "auto" (mouse on PC, gyro on phone), "pointer", "gyro", "off"
  tiltStrength: 12,                   // how far the card tilts in degrees, 0 = no reaction
  tiltSpeed: 9,                       // how fast the card follows, lower = slower and floatier, higher = snappier
  tiltPerspective: 1100,              // 3D depth in px, lower = stronger 3D, higher = flatter
  tiltInvert: false,                  // true = tilts the opposite way
  tiltIdle: true,                     // slow floating sway when nothing is touched
  tiltRestX: 6,                       // resting tilt up/down in degrees
  tiltRestY: -8,                      // resting tilt left/right in degrees
  parallax: 1,                        // how much the content shifts for depth while tilting, 0 = off

  // ---------- dragging ----------
  drag: false,                        // true = the card can be dragged around
  dragReturn: true,                   // only when drag is on: true = card springs back to the center, false = stays where you drop it

  // ---------- buttons ----------
  buttonsPosition: "below",           // "below" or "above" the social icons

  buttons: [                          // big buttons on the card, add as many as you want
    {
      label: "Visit suic1.de",        // button title
      desc: "",                       // small text under the title, optional
      image: "robot.png",             // button image, optional
      u: "https://suic1.de",          // link. Use  copy: "text"  instead of u to copy text on click
    },
  ],

  // ---------- social icons ----------
  links: [                            // n = name on hover, u = link, i = icon file
    { n: "Discord",  u: "https://discord.gg/B5JP6zRRHe",                   i: "discord.svg" },
    { n: "Telegram", u: "https://t.me/archsix",                            i: "telegram.svg" },
    { n: "GitHub",   u: "https://github.com/ArchIsDead",                   i: "github.svg" },
  ],

  // ---------- copy icons ----------
  copyIcons: [                        // click the icon to copy v. n = name on hover, v = text to copy, i = icon file
    { n: "Litecoin", v: "ltc1q7kvzhdx97qfn6raav4qvfvra6k57jq6ptx8l74", i: "litecoin.svg" },
  ],

};
