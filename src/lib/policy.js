// Single source of truth for every customer-facing policy number.
// The legal pages (/refund, /shipping, /terms, /privacy, /contact-us) read from
// here, so a fee or window only ever has to change in ONE place.
//
// Money rules MUST mirror the checkout code:
//   delivery  → utils/cartOffers.js  getDeliveryCharge()
//   COD fee   → components/UI/AddressModal.jsx  codFeeAmount / codAdvanceAmount
//   wallet    → utils/walletLedger.js  WALLET_TTL_DAYS
// If you change those, change this file too.

import { WALLET_TTL_DAYS } from "@/utils/walletLedger";

export const POLICY_EFFECTIVE_DATE = "9 November 2026";

export const BUSINESS = {
  tradeName: "TheBookX",
  formerName: "Uskillbook",
  type: "Sole Proprietorship",
  udyam: "UDYAM-MH-19-0386866",
  // TODO(owner): add the full registered address (building, street, area,
  // pincode). Required under Rule 4(1) of the Consumer Protection
  // (E-Commerce) Rules, 2020. Shown on the policy pages once filled in.
  address: "",
  city: "Mumbai, Maharashtra, India",
  // TODO(owner): add GSTIN if registered; shown only when filled in.
  gstin: "",
  website: "https://thebookx.in",
};

export const SUPPORT = {
  // TODO(owner): switch to a domain mailbox (e.g. support@thebookx.in) once it
  // exists. A brand email builds far more trust than a Gmail address.
  email: "uskillbook@gmail.com",
  phoneDisplay: "+91 77108 92108",
  phoneTel: "+917710892108",
  whatsapp: "https://wa.me/917710892108",
  hoursWeekday: "Monday–Saturday, 10:00 AM–7:00 PM IST",
  closed: "Sundays and Maharashtra public holidays",
  firstReply: "within 1 business day",
};

export const GRIEVANCE = {
  // TODO(owner): add the Grievance Officer's full name (mandatory under the
  // E-Commerce Rules 2020 and IT Rules 2011). The designation, email and phone
  // already display; the name shows once filled in.
  name: "",
  designation: "Grievance Officer, TheBookX",
  acknowledgeWithin: "48 hours",
  resolveWithin: "1 month",
};

// ── Delivery (mirrors getDeliveryCharge) ────────────────────────────────────
export const DELIVERY = {
  freeMin: 199, // normal carts: free from ₹199 up to ₹1,000
  belowFreeFee: 69, // normal carts below ₹199
  oneRupeeFreeMin: 399, // carts containing a ₹1 book
  oneRupeeBelowFee: 100,
  careFeeAbove: 1000, // "Handling & Care" fee kicks in above this
  careFeePct: 20, // % of order value
  careFeeCapOneRupee: 159, // cap for ₹1-book carts
  fasterPriority: [
    { label: "Below ₹499", fee: 49 },
    { label: "₹499–₹999", fee: 99 },
    { label: "₹1,000–₹1,999", fee: 149 },
    { label: "₹2,000 and above", fee: 199 },
  ],
  processingDays: "1–2 business days",
  standardDays: "5–9 days",
  fasterDays: "1–6 days",
};

// ── Cash on Delivery (mirrors AddressModal) ─────────────────────────────────
export const COD = {
  feeMin: 29,
  feePct: 5.9, // whichever is higher: ₹29 or 5.9% of the bill
  advance: 99, // "₹99 advance" COD option: no COD fee, ₹99 paid online
};

// ── Wallet ──────────────────────────────────────────────────────────────────
export const WALLET = {
  validityDays: WALLET_TTL_DAYS,
};

// ── Returns & refunds ───────────────────────────────────────────────────────
export const RETURNS = {
  reportWindowDays: 7, // damaged / defective / wrong book
  missingItemHours: 48, // missing book from a multi-book parcel
  notDeliveredHours: 48, // marked delivered but not received
  reviewWithin: "2 business days",
  walletCreditWithin: "1 business day", // after approval
  bankTransferWithin: "5–7 business days", // after approval
};

// Condition-based refund guide (share of THAT book's price). TODO(owner):
// confirm these bands match how the team actually assesses claims.
export const CONDITION_BANDS = [
  {
    issue: "Wrong title or edition, missing book, or severely damaged (pages missing, binding broken, unreadable)",
    outcome: "Replacement, or 100% of that book's price",
  },
  {
    issue: "Moderate damage (torn cover, water marks, loose pages, still readable)",
    outcome: "Replacement where possible, or 30–50% of that book's price",
  },
  {
    issue: "Minor cosmetic wear (creases, scuffs, small edge tears, shelf marks)",
    outcome: "10–20% of that book's price",
  },
];

export const mailto = `mailto:${SUPPORT.email}`;
