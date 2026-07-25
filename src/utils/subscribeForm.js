// Newsletter subscribe → Google Sheet (via a Google Form, CORS-safe like the
// order/review forms). Responses land in the linked sheet you own.
//
// SETUP (one-time):
//   1. Create a Google Form with a single short-answer "Email" question
//      (add an optional "Source" question if you want to track where it came from).
//   2. Link it to a Google Sheet (Responses → link to Sheets).
//   3. Open the live form, "Get pre-filled link", and copy:
//        - the formResponse URL  → SUBSCRIBE_FORM_URL
//        - the entry.XXXX id(s)  → SUBSCRIBE_FIELD_IDS
//   Paste them below. Until then, the form just shows a friendly success
//   message and logs a warning (no data is lost because nothing is sent).

export const SUBSCRIBE_FORM_URL = ""; // e.g. https://docs.google.com/forms/d/e/XXXX/formResponse
export const SUBSCRIBE_FIELD_IDS = {
  email: "", // e.g. entry.1234567890
  source: "", // optional: entry.0987654321
  timestamp: "", // optional
};

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

// Fire-and-forget submit (no-cors) so the browser never blocks on CORS.
export async function submitSubscription({ email, source = "blog" }) {
  if (!SUBSCRIBE_FORM_URL || !SUBSCRIBE_FIELD_IDS.email) {
    console.warn(
      "Subscribe form not configured yet — set SUBSCRIBE_FORM_URL / SUBSCRIBE_FIELD_IDS in src/utils/subscribeForm.js",
    );
    return { ok: false, unconfigured: true };
  }
  const params = new URLSearchParams();
  params.append(SUBSCRIBE_FIELD_IDS.email, String(email).trim());
  if (SUBSCRIBE_FIELD_IDS.source)
    params.append(SUBSCRIBE_FIELD_IDS.source, source);
  if (SUBSCRIBE_FIELD_IDS.timestamp)
    params.append(SUBSCRIBE_FIELD_IDS.timestamp, new Date().toISOString());
  try {
    await fetch(SUBSCRIBE_FORM_URL, {
      method: "POST",
      mode: "no-cors",
      body: params,
    });
    return { ok: true };
  } catch (e) {
    console.error("Subscribe submit failed:", e);
    return { ok: false, error: e };
  }
}

// Remember locally that this device subscribed (so we can hide the prompt).
const SUB_KEY = "tbx_subscribed";
export function markSubscribed(email) {
  try {
    localStorage.setItem(SUB_KEY, email || "1");
  } catch (_) {}
}
export function hasSubscribed() {
  try {
    return Boolean(localStorage.getItem(SUB_KEY));
  } catch (_) {
    return false;
  }
}
