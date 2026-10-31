// Admin unlock code check, shared by the client AdminLock gate and server
// routes that must only answer the console (e.g. escrow review).
//
// The valid code is NOT stored on its own: it lives inside a long, fixed,
// random-looking string. A code is accepted when it appears as a substring of
// that string (min 4 chars, so trivial single characters fail).
const SECRET =
  "xP7k2Qm9Rv4Ls8Nz5Wc1Ft3Hj6Dy0Ae9631Ug2iO7Xb4qBnwLzA6kDsE3tV9731hJ5uCoX8mPrT2yG";
const MIN_CODE_LEN = 4;

export const isValidAdminCode = (v) => {
  const c = String(v || "").trim();
  return c.length >= MIN_CODE_LEN && SECRET.includes(c);
};

// Where the unlocked console keeps the code it was opened with, so admin-only
// API calls can send it (header "x-admin-code").
export const ADMIN_CODE_KEY = "admin_code";
