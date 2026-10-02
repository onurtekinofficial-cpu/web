// Sample data.js — generated to match the schema the Admin Panel's "Publish" button writes.
// Drop next to index.html and add:  <script src="data.js"></script>  BEFORE the main inline <script> block.
//
// Primary export: window.SITE_DATA = { hero, about, seo, filters, categoryLabel, portfolio }
//   - hero.banners[]  -> multiple hero banners; ARRAY ORDER IS RENDER ORDER (set via up/down in the admin panel)
//   - portfolio[]     -> masonry grid items; ARRAY ORDER IS RENDER ORDER too
//
// Back-compat: HERO / ABOUT / FILTERS / CATEGORY_LABEL / PORTFOLIO are also exported as plain
// consts pointing at the same objects, so a frontend still reading those old globals keeps working.

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
        "thumbnailUrl": "https://picsum.photos/seed/kai-v1/1600/900",
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
        "thumbnailUrl": "https://picsum.photos/seed/kai-v3/1600/900",
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
        "thumbnailUrl": "https://picsum.photos/seed/kai-v5/1600/900",
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
  "filters": [
    {
      "label": "Vertical (9:16)",
      "value": "vertical"
    },
    {
      "label": "AI Commercials",
      "value": "commercial"
    },
    {
      "label": "Narrative",
      "value": "narrative"
    },
    {
      "label": "Brand Films",
      "value": "brand"
    }
  ],
  "categoryLabel": {
    "commercial": "AI Commercial",
    "vertical": "Vertical",
    "narrative": "Narrative",
    "brand": "Brand Film"
  },
  "portfolio": [
    {
      "id": 1,
      "title": "Solstice",
      "category": "commercial",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v1/1200/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "createdAt": "2026-01-10",
      "description": "A generative-first spot for a fragrance launch, shot entirely from AI plates and finished with practical color and sound.",
      "tools": [
        "Runway Gen-3",
        "Midjourney",
        "DaVinci Resolve"
      ],
      "size": "size-wide"
    },
    {
      "id": 2,
      "title": "Vertical Story, 01",
      "category": "vertical",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v2/700/1100",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "createdAt": "2025-11-02",
      "description": "A nine-part vertical series built for Instagram, blending generated backdrops with live talent.",
      "tools": [
        "Kling AI",
        "Pika",
        "Premiere Pro"
      ],
      "size": "size-tall"
    },
    {
      "id": 3,
      "title": "Glass Hour",
      "category": "narrative",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v3/700/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "createdAt": "2025-10-18",
      "description": "A short narrative piece exploring memory, generated frame-by-frame and hand-graded for a filmic tone.",
      "tools": [
        "Runway Gen-3",
        "ElevenLabs"
      ],
      "size": "size-normal"
    },
    {
      "id": 4,
      "title": "Reel Series, Ep. 2",
      "category": "vertical",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v4/700/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "createdAt": "2025-09-30",
      "description": "Episodic vertical content for a lifestyle brand's always-on social calendar.",
      "tools": [
        "Pika",
        "CapCut"
      ],
      "size": "size-normal"
    },
    {
      "id": 5,
      "title": "Aether",
      "category": "brand",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v5/1200/1200",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "createdAt": "2025-06-14",
      "description": "A brand film for a sustainable materials studio, pairing generated textures with macro live footage.",
      "tools": [
        "Runway Gen-3",
        "Midjourney",
        "DaVinci Resolve"
      ],
      "size": "size-big"
    },
    {
      "id": 6,
      "title": "Product Drop Teaser",
      "category": "commercial",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v6/700/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      "createdAt": "2025-05-02",
      "description": "A fifteen-second teaser built to tease a product drop across paid and organic channels.",
      "tools": [
        "Kling AI",
        "Premiere Pro"
      ],
      "size": "size-normal"
    },
    {
      "id": 7,
      "title": "Vertical Story, 02",
      "category": "vertical",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v7/700/1100",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "createdAt": "2025-03-21",
      "description": "Continuation of the vertical story format, this time centered on a travel narrative.",
      "tools": [
        "Pika",
        "ElevenLabs"
      ],
      "size": "size-tall"
    },
    {
      "id": 8,
      "title": "Midnight Run",
      "category": "narrative",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v8/1200/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "createdAt": "2024-12-11",
      "description": "A neo-noir narrative short built around a single generated character across twelve shots.",
      "tools": [
        "Runway Gen-3",
        "DaVinci Resolve"
      ],
      "size": "size-wide"
    },
    {
      "id": 9,
      "title": "Launch Spot: Nova",
      "category": "commercial",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v9/700/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "createdAt": "2024-09-05",
      "description": "Launch film for a consumer tech product, mixing studio footage with AI-extended environments.",
      "tools": [
        "Kling AI",
        "Midjourney"
      ],
      "size": "size-normal"
    },
    {
      "id": 10,
      "title": "Studio Reel",
      "category": "brand",
      "thumbnailUrl": "https://picsum.photos/seed/kai-v10/700/700",
      "videoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "createdAt": "2024-07-19",
      "description": "A reel produced for an internal creative studio, showcasing range across formats.",
      "tools": [
        "Runway Gen-3",
        "Pika"
      ],
      "size": "size-normal"
    }
  ]
};

const HERO = window.SITE_DATA.hero;
const ABOUT = window.SITE_DATA.about;
const FILTERS = window.SITE_DATA.filters;
const CATEGORY_LABEL = window.SITE_DATA.categoryLabel;
const PORTFOLIO = window.SITE_DATA.portfolio;
