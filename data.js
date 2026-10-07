// data.js — written by the Admin Panel's "Publish" button. Load it BEFORE the main inline <script> in index.html.
//
// TWO INDEPENDENT VIDEO MODELS (they never reference each other):
//
//   hero.banners[]  — the full-screen HERO BANNERS. They autoplay on the homepage and have their OWN ids.
//     Banner = { id, title, subtitle, videoUrl, thumbnailUrl?, aspect?("16:9"|"9:16"|"1:1"|"4:5"), description, tools[] }
//
//   portfolio[]     — the ALL WORK grid. Cards show a THUMBNAIL ONLY; the video plays after a click, in the modal.
//     WorkItem = { id, title, category("9:16"|"16:9"|"ugc"), videoUrl, thumbnailUrl?, createdAt, description, tools[] }
//     (no thumbnailUrl → the cover is derived automatically: Vimeo / YouTube cover, or a still frame of the .mp4)
//
//   Editing, adding, deleting or reordering a WorkItem can never change a Banner, and vice versa: the admin panel
//   enforces it in code, and index.html never reads portfolio[] to build the hero. Array order === render order.
//
//   commercial[]    — the COMMERCIAL page (/commercial): banner-style videos, its own independent list. Same fields as a Banner.
//   shortMovies[]   — the SHORT MOVIES page (/short-movies): same, another independent list.
//   shortFormVideo[]— the SHORT-FORM VIDEO page (/short-form-video): same, another independent list.
//                     All three load lazily and each video starts only when scrolled to. Managed in the admin panel (Commercial / Short Movies / Short-form Video).
//   portfolio[]     — the old "All works" grid. It is NOT shown on the site right now; the admin panel keeps the data for later.
//
// social = { instagram, youtube, linkedin } → footer icons (replace the placeholder URLs; empty = icon hidden). The e-mail icon uses seo.email.
// Other keys: about, seo, filters, categoryLabel.
// Back-compat: HERO / ABOUT / FILTERS / CATEGORY_LABEL / PORTFOLIO are also exported as plain consts below.

window.SITE_DATA = {
  "hero": {
    "headline": "Video, directed for the age of generative film.",
    "subheadline": "Osman Onur Tekin — an editor and producer working between traditional post and AI-generated footage.",
    "banners": [
      {
        "id": 1,
        "title": "Solstice",
        "subtitle": "A generative-first spot for a fragrance launch.",
        "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "description": "A generative-first spot for a fragrance launch, shot entirely from AI plates and finished with practical color and sound.",
        "tools": [
          "Runway Gen-3",
          "Midjourney",
          "DaVinci Resolve"
        ]
      },
      {
        "id": 2,
        "title": "Glass Hour",
        "subtitle": "A short narrative piece exploring memory.",
        "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        "description": "A short narrative piece exploring memory, generated frame-by-frame and hand-graded for a filmic tone.",
        "tools": [
          "Runway Gen-3",
          "ElevenLabs"
        ]
      },
      {
        "id": 3,
        "title": "Aether",
        "subtitle": "A brand film for a sustainable materials studio.",
        "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "description": "A brand film for a sustainable materials studio, pairing generated textures with macro live footage.",
        "tools": [
          "Runway Gen-3",
          "Midjourney",
          "DaVinci Resolve"
        ]
      }
    ]
  },
  "about": {
    "content": "I'm an editor and producer working at the intersection of traditional post-production and generative video. My process has shifted from cutting footage to directing it — briefing models, curating generations, then finishing everything in a real timeline with color, sound design and pacing a prompt alone can't give you.\n\nClients come to me for commercials and short-form content that needs to look expensive on a fraction of a traditional shoot's budget and timeline — without looking like AI slop.",
    "workflow": [
      {
        "title": "Concept & script",
        "text": "Defining story, shot list and reference world before anything is generated."
      },
      {
        "title": "AI generation",
        "text": "Directing footage through generative models, iterating for consistency."
      },
      {
        "title": "Edit & grade",
        "text": "Cutting the story for real, then color and finishing in a proper NLE."
      },
      {
        "title": "Sound & delivery",
        "text": "Sound design, mix, and exports tailored to every platform it ships on."
      }
    ]
  },
  "seo": {
    "siteTitle": "Osman Onur Tekin — AI Video Editor & Producer",
    "metaDescription": "Osman Onur Tekin — AI-native video editor and producer. Selected commercial, narrative and vertical work.",
    "logoText": "Osman Tekin",
    "email": "",
    "formspreeEndpoint": ""
  },
  "commercial": [],
  "shortMovies": [],
  "shortFormVideo": [],
  "social": {
    "instagram": "https://www.instagram.com/",
    "youtube": "https://www.youtube.com/",
    "linkedin": "https://www.linkedin.com/"
  },
  "filters": [
    { "label": "9:16", "value": "9:16" },
    { "label": "16:9", "value": "16:9" },
    { "label": "UGC", "value": "ugc" }
  ],
  "categoryLabel": {
    "9:16": "9:16",
    "16:9": "16:9",
    "ugc": "UGC"
  },
  "portfolio": [
    {
      "id": 1,
      "title": "Solstice",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "createdAt": "2026-01-10",
      "description": "A generative-first spot for a fragrance launch, shot entirely from AI plates and finished with practical color and sound.",
      "tools": [
        "Runway Gen-3",
        "Midjourney",
        "DaVinci Resolve"
      
      ]
    },
    {
      "id": 2,
      "title": "Vertical Story, 01",
      "category": "9:16",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "createdAt": "2025-11-02",
      "description": "A nine-part vertical series built for Instagram, blending generated backdrops with live talent.",
      "tools": [
        "Kling AI",
        "Pika",
        "Premiere Pro"
      
      ]
    },
    {
      "id": 3,
      "title": "Glass Hour",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "createdAt": "2025-10-18",
      "description": "A short narrative piece exploring memory, generated frame-by-frame and hand-graded for a filmic tone.",
      "tools": [
        "Runway Gen-3",
        "ElevenLabs"
      
      ]
    },
    {
      "id": 4,
      "title": "Reel Series, Ep. 2",
      "category": "9:16",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "createdAt": "2025-09-30",
      "description": "Episodic vertical content for a lifestyle brand's always-on social calendar.",
      "tools": [
        "Pika",
        "CapCut"
      
      ]
    },
    {
      "id": 5,
      "title": "Aether",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "createdAt": "2025-06-14",
      "description": "A brand film for a sustainable materials studio, pairing generated textures with macro live footage.",
      "tools": [
        "Runway Gen-3",
        "Midjourney",
        "DaVinci Resolve"
      
      ]
    },
    {
      "id": 6,
      "title": "Product Drop Teaser",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      "createdAt": "2025-05-02",
      "description": "A fifteen-second teaser built to tease a product drop across paid and organic channels.",
      "tools": [
        "Kling AI",
        "Premiere Pro"
      
      ]
    },
    {
      "id": 7,
      "title": "Vertical Story, 02",
      "category": "9:16",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "createdAt": "2025-03-21",
      "description": "Continuation of the vertical story format, this time centered on a travel narrative.",
      "tools": [
        "Pika",
        "ElevenLabs"
      
      ]
    },
    {
      "id": 8,
      "title": "Midnight Run",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "createdAt": "2024-12-11",
      "description": "A neo-noir narrative short built around a single generated character across twelve shots.",
      "tools": [
        "Runway Gen-3",
        "DaVinci Resolve"
      
      ]
    },
    {
      "id": 9,
      "title": "Launch Spot: Nova",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "createdAt": "2024-09-05",
      "description": "Launch film for a consumer tech product, mixing studio footage with AI-extended environments.",
      "tools": [
        "Kling AI",
        "Midjourney"
      
      ]
    },
    {
      "id": 10,
      "title": "Studio Reel",
      "category": "16:9",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "createdAt": "2024-07-19",
      "description": "A reel produced for an internal creative studio, showcasing range across formats.",
      "tools": [
        "Runway Gen-3",
        "Pika"
      
      ]
    }
  ]
};

const HERO = window.SITE_DATA.hero;
const ABOUT = window.SITE_DATA.about;
const FILTERS = window.SITE_DATA.filters;
const CATEGORY_LABEL = window.SITE_DATA.categoryLabel;
const PORTFOLIO = window.SITE_DATA.portfolio;
