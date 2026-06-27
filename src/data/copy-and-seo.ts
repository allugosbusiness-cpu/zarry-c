// ============================================================
// JUSTICEZARI — Copy, SEO, Captions & Dev Handoff
// ============================================================

// ---- CTA MICROCOPY ----
export const ctaCopy = {
  primary: {
    listen: "Listen / Watch",
    fanClub: "Join Fan Club — Exclusive Access",
    merch: "Shop Limited Drop",
    beats: "Preview & License Beat",
    donate: "Support the Movement",
  },
  secondary: {
    joinFree: "Join Free",
    subscribe: "Subscribe Now",
    bidForFeature: "Bid for a Feature",
    instantBuy: "Instant Buy",
    bookNow: "Book Now",
    sendInquiry: "Send Inquiry",
    requestBeat: "Request Custom Beat",
    viewAll: "View All",
    browseAll: "Browse All",
  },
  modals: {
    addedToCart: "Added to cart!",
    addedToQueue: "Added to queue",
    joinNewsletter: "Get early access to drops",
    waitlistConfirm: "We'll notify you when this drops",
    bidSuccess: "Your bid has been placed",
    donationThankYou: "Thank you for your support!",
  },
  errors: {
    general: "Something went wrong. Please try again.",
    payment: "Payment failed. Please check your details.",
    connection: "Connection lost. Check your internet.",
    form: "Please fill in all required fields.",
  },
};

// ---- IMAGE/VIDEO CAPTIONS (10 examples) ----
export const imageCaptions = [
  "Studio night, Harare — laying down the final vocal take. #NewAlbum",
  "Sunset shoot — behind the lens with Justice Zari. Book a session.",
  "Live at The Jazz Cafe — crowd energy was unreal. Watch full set.",
  "Beat preview — dusty keys and heavy 808s. License now.",
  "Merch drop — limited tees, once they're gone they're gone.",
  "On set — bidding open for a cameo in the next video.",
  "Tour day 3 — sold out, thank you London. VIPs meet tonight.",
  "Photo series: street portraits from the city. Prints available.",
  "Exclusive fan clip — members only. Join the Fan Club.",
  "3D album art concept — animated loop in the player.",
];

// ---- SEO META TEMPLATES ----
export const seoTemplates = {
  title: {
    home: "Justice Zari — Official Site | Music, Videos, Merch & Fan Club",
    music: "Music — Justice Zari | Albums, Singles & Streams",
    video: "Videos — Justice Zari | Music Videos & Videography Portfolio",
    merch: "Merch — Justice Zari | Limited Drops & Official Gear",
    beats: "Beats — Justice Zari | Beat Marketplace & Licensing",
    fanClub: "Fan Club — Justice Zari | Exclusive Content & Direct Access",
    tour: "Tour — Justice Zari | Upcoming Shows & VIP Packages",
    services: "Videography — Justice Zari | Book Video & Photo Services",
    donate: "Support — Justice Zari | Donate & Fuel the Movement",
    blog: "Blog — Justice Zari | News, Production Diaries & More",
    about: "About — Justice Zari | Independent Artist from Harare",
  },
  description: {
    home: "Listen to Justice Zari's latest album, watch music videos, buy merch, join the fan club, book videography services, and license beats. Independent artist from Harare, Zimbabwe.",
    music: "Stream and buy albums, singles, and exclusive stems from Justice Zari. Hip-hop, R&B, Afrobeat, and electronic music.",
    video: "Watch music videos, visualizers, behind-the-scenes content, and videography portfolio. Available for booking.",
    merch: "Shop limited edition merch drops — tees, hoodies, vinyl, posters, and bundles. Signed and numbered.",
    beats: "License beats instantly from Justice Zari's marketplace. Non-exclusive and exclusive rights. Preview before purchase.",
    fanClub: "Join the Justice Zari Fan Club. Free, Supporter, and VIP tiers with exclusive content, direct messaging, and video bidding.",
    tour: "See Justice Zari live. Tour dates, VIP meet & greet packages, and ticket links for shows worldwide.",
    services: "Professional videography and photography services by Justice Zari. Music videos, events, weddings, and brand content.",
    donate: "Support Justice Zari's music and art. Every contribution helps create more content.",
    blog: "Read Justice Zari's blog — release notes, studio diaries, behind-the-scenes, and curated playlists.",
    about: "Learn about Justice Zari — independent artist, producer, videographer, and photographer from Harare, Zimbabwe.",
  },
  keywords: [
    "Justice Zari",
    "JUSTICEZARI",
    "Zimbabwe music",
    "Afrobeat",
    "Hip-hop Zimbabwe",
    "R&B Africa",
    "Harare artist",
    "music videography",
    "beat marketplace",
    "fan club subscription",
    "limited merch drops",
    "independent artist",
    "music producer Zimbabwe",
    "Afrobeat beats for sale",
    "video feature bidding",
    "Zimbabwe creative",
  ],
  ogImage: {
    url: "/images/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "Justice Zari — Official Artist Site",
  },
  twitterCard: "summary_large_image" as const,
};

// ---- SOCIAL SHARE CARD TEMPLATES ----
export const socialCardTemplates = {
  albumRelease: {
    title: "{album} — Out Now",
    description: "Listen to Justice Zari's new {type}. Stream everywhere.",
    hashtags: ["#JusticeZari", "#NewMusic", "#Album"],
  },
  singleRelease: {
    title: '"{track}" — New Single',
    description: "Stream the latest single from Justice Zari.",
    hashtags: ["#JusticeZari", "#NewSingle", "#NowPlaying"],
  },
  videoRelease: {
    title: '"{title}" — Official Video',
    description: "Watch the new video from Justice Zari.",
    hashtags: ["#JusticeZari", "#MusicVideo", "#Watch"],
  },
  merchDrop: {
    title: "{item} — Limited Drop",
    description: "Limited edition. Available now at justicezari.com.",
    hashtags: ["#JusticeZari", "#MerchDrop", "#LimitedEdition"],
  },
  tourAnnouncement: {
    title: '{city} — {date}',
    description: "Justice Zari live at {venue}. Tickets on sale now.",
    hashtags: ["#JusticeZari", "#Live", "#Tour"],
  },
  beatRelease: {
    title: '"{title}" — New Beat Available',
    description: "License this {genre} beat. {bpm} BPM, key of {key}.",
    hashtags: ["#JusticeZari", "#Beats", "#Producer"],
  },
};

// ---- PLAYLIST STRATEGY ----
export const playlistStrategy = {
  byGenre: [
    { name: "Hip-Hop Essentials", tracks: ["Midnight Run", "Street Psalms", "Wave Runner", "Dark Matter", "Asingazovharidzire"] },
    { name: "R&B Nights", tracks: ["Close to You", "Pink Lights", "Sunset Drive", "Neon Tears", "Starlight Drive"] },
    { name: "Afrobeat Heat", tracks: ["Afro Pulse", "Zvibvire", "Asingazovharidzire", "Midnight Run", "Wave Runner"] },
    { name: "Electronic Dreams", tracks: ["Neon Skyline", "Digital Rain", "Neon Tears", "Starlight Drive", "Outro (Signal Lost)"] },
    { name: "Experimental", tracks: ["Intro (Frequency)", "Interlude (Static)", "Outro (Signal Lost)", "Digital Rain", "Neon Skyline"] },
  ],
  byVibe: [
    { name: "Chill Late Night", tracks: ["Close to You", "Sunset Drive", "Neon Tears", "Starlight Drive", "Pink Lights"] },
    { name: "High Energy", tracks: ["Midnight Run", "Asingazovharidzire", "Afro Pulse", "Wave Runner", "Dark Matter"] },
    { name: "Studio Session", tracks: ["Street Psalms", "Neon Skyline", "Digital Rain", "Intro (Frequency)", "Outro (Signal Lost)"] },
    { name: "Road Trip", tracks: ["Midnight Run", "Zvibvire", "Pink Lights", "Digital Rain", "Afro Pulse"] },
    { name: "Visual Mood Board", tracks: ["Neon Tears", "Starlight Drive", "Intro (Frequency)", "Close to You", "Outro (Signal Lost)"] },
  ],
  byUse: [
    { name: "Tour Setlist", tracks: ["Asingazovharidzire", "Midnight Run", "Pink Lights", "Wave Runner", "Neon Skyline", "Zvibvire", "Close to You", "Afro Pulse"] },
    { name: "Producer Picks", tracks: ["Street Psalms", "Dark Matter", "Afro Pulse", "Neon Tears", "Sunset Drive"] },
    { name: "Fan Favorites", tracks: ["Asingazovharidzire", "Close to You", "Midnight Run", "Pink Lights", "Zvibvire"] },
    { name: "Collabs & Features", tracks: ["Midnight Run (ft. Tendai)", "Wave Runner (ft. Nala)"] },
  ],
};

// ---- ACCESSIBILITY CHECKLIST ----
export const accessibilityChecklist = [
  "Keyboard navigation for all interactive elements",
  "ARIA labels on buttons, links, and form inputs",
  "Focus indicators visible on all interactive elements",
  "Color contrast ratios meet WCAG AA standards",
  "Reduced motion media query respected",
  "Alt text on all images",
  "Video captions and transcripts",
  "Semantic HTML structure (landmarks, headings)",
  "Form error messages associated with inputs",
  "Skip to main content link",
  "Touch targets at least 44x44px on mobile",
  "Screen reader friendly announcements for dynamic content",
];

// ---- PERFORMANCE OPTIMIZATIONS ----
export const performanceOptimizations = [
  "Image optimization with Next.js Image component (AVIF/WebP)",
  "Lazy loading for below-fold content",
  "Code splitting by route (Next.js app router)",
  "Preconnect to external origins (CDN, APIs)",
  "Minimize main-thread work with Framer Motion",
  "CSS containment for dynamic sections",
  "Font subsetting for variable fonts",
  "Bundle analysis and tree-shaking",
  "CDN caching for static assets",
  "Preload critical CSS and fonts",
  "Reduce JavaScript with dynamic imports",
];

// ---- TECH STACK & INTEGRATION NOTES ----
export const techStackNotes = `
==== TECH STACK & INTEGRATION NOTES ====

Frontend:
- Next.js 16 (React, SSR, App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Zustand (state management)
- React Icons (iconography)
- React Hot Toast (notifications)

3D & Animations:
- Three.js / React Three Fiber (for 3D hero album covers)
- Lottie Web (for lightweight JSON animations)
- Framer Motion (page transitions, micro-interactions)

Audio:
- HTML5 Audio API + custom controls
- HLS streaming for longer tracks (optional)
- Support for SoundCloud/Bandcamp embed fallback

Video:
- Vimeo Pro (hosting + adaptive streaming)
- or self-hosted CDN with HLS.js

Ecommerce:
- Stripe (primary payments)
- Local mobile money: EcoCash, MTN MoMo
- Cart state managed via Zustand

Memberships:
- Custom JWT-based gating for Fan Club tiers
- Stripe subscriptions for recurring billing
- Member limits enforced on frontend + API

Content Management:
- Data files (src/data/site-data.ts) for MVP
- Migration path to Sanity/Strapi CMS

Analytics:
- GA4 for traffic
- Mixpanel for product events (add to cart, subscribe, bid)
- Hotjar for heatmaps and session recording

Deployment:
- Vercel (recommended for Next.js SSR)
- Cloudflare for CDN + DDoS protection

API Endpoints (to be implemented):
- POST /api/auth/login - Fan Club authentication
- POST /api/auth/register - Registration
- GET /api/music - Music catalog
- GET /api/beats - Beat marketplace
- POST /api/cart/checkout - Payment processing
- POST /api/bid - Place bid on video feature
- GET /api/fan-club/messages - Direct messages
- POST /api/contact - Contact form submission
- POST /api/waitlist - Waitlist signup
`;