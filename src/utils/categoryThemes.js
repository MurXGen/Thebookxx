// Per-category visual themes. Each theme sets a hero/page gradient (a → b), an
// accent colour, a Lucide icon name for decor, and a tagline. Keyed by category
// slug; falls back to a neutral brand theme.

const THEMES = {
  thriller: { a: "#20242e", b: "#0a0d14", accent: "#ef4444", icon: "Zap", tagline: "Heart-pounding page-turners" },
  mystery: { a: "#241b3a", b: "#0d0a1a", accent: "#a78bfa", icon: "Search", tagline: "Clues, twists and the unknown" },
  crime: { a: "#1c1c22", b: "#08080b", accent: "#f97316", icon: "Fingerprint", tagline: "Secrets waiting to be solved" },
  horror: { a: "#241016", b: "#0a0406", accent: "#f43f5e", icon: "Ghost", tagline: "Dare to turn the page" },
  psychology: { a: "#0f5f59", b: "#052926", accent: "#2dd4bf", icon: "Brain", tagline: "Understand the human mind" },
  business: { a: "#1e3a8a", b: "#0b1c40", accent: "#60a5fa", icon: "TrendingUp", tagline: "Build, lead and grow" },
  finance: { a: "#14532d", b: "#06210f", accent: "#4ade80", icon: "Wallet", tagline: "Master your money" },
  investing: { a: "#134e4a", b: "#061e1c", accent: "#34d399", icon: "LineChart", tagline: "Grow your wealth, wisely" },
  economics: { a: "#155e75", b: "#062a38", accent: "#38bdf8", icon: "Landmark", tagline: "How markets really move" },
  romance: { a: "#9d174d", b: "#450a24", accent: "#fb7185", icon: "Heart", tagline: "Love in every page" },
  fiction: { a: "#3730a3", b: "#161252", accent: "#818cf8", icon: "BookOpen", tagline: "Stories worth getting lost in" },
  novel: { a: "#3f3186", b: "#181042", accent: "#a5b4fc", icon: "Library", tagline: "Immersive, unforgettable reads" },
  "non-fiction": { a: "#374151", b: "#111827", accent: "#cbd5e1", icon: "Compass", tagline: "Real stories, real ideas" },
  "self-help": { a: "#b45309", b: "#552704", accent: "#fbbf24", icon: "Sprout", tagline: "Become your best self" },
  "fantasy-scifi": { a: "#4c1d95", b: "#1c0b3d", accent: "#c084fc", icon: "Rocket", tagline: "Worlds beyond imagination" },
  spirituality: { a: "#6d28d9", b: "#2b1065", accent: "#c4b5fd", icon: "Sparkles", tagline: "Peace, purpose and within" },
  biography: { a: "#78350f", b: "#361705", accent: "#f59e0b", icon: "UserRound", tagline: "Lives that inspire" },
  history: { a: "#713f12", b: "#341d08", accent: "#eab308", icon: "Hourglass", tagline: "The past, retold" },
  children: { a: "#0369a1", b: "#07395c", accent: "#38bdf8", icon: "Baby", tagline: "Wonder for little readers" },
  "young-adult": { a: "#be185d", b: "#4c0925", accent: "#f472b6", icon: "Star", tagline: "Coming-of-age favourites" },
  humor: { a: "#a16207", b: "#452c06", accent: "#facc15", icon: "Laugh", tagline: "Laugh out loud" },
  health: { a: "#047857", b: "#043528", accent: "#34d399", icon: "HeartPulse", tagline: "Feel your best" },
  "science-tech": { a: "#0e7490", b: "#07303f", accent: "#22d3ee", icon: "FlaskConical", tagline: "How the world works" },
  bestseller: { a: "#b91c1c", b: "#450a0a", accent: "#f87171", icon: "Trophy", tagline: "What everyone's reading" },
  trending: { a: "#c2410c", b: "#451803", accent: "#fb923c", icon: "Flame", tagline: "Hot right now" },
};

const DEFAULT = {
  a: "#111827",
  b: "#020617",
  accent: "#fb8500",
  icon: "BookOpen",
  tagline: "Handpicked reads at the best prices",
};

export function getCategoryTheme(slug) {
  return THEMES[String(slug || "").toLowerCase()] || DEFAULT;
}
