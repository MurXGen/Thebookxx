# UI/UX Learnings from Reference (Blinkit) — for TheBookX

Source: 19 reference screens of the Blinkit app. Below is what's worth adopting,
translated to TheBookX's context (an online bookstore), and the pain-point
patterns that make the flows feel trustworthy.

---

## 1. Header — Wallet chip + Profile (priority)

**What Blinkit does**

- Right side of the header has two compact controls:
  - **Wallet chip** — a rounded pill with a 3D wallet icon and the live balance
    (`₹0`). Tapping it opens the wallet ("Blinkit Money") page.
  - **Profile avatar** — a circular icon. Tapping it opens the "Your account"
    page.
- Left side carries brand/location context.

**How it maps to TheBookX**

- Keep our branding on the **left** with the **3-line menu** and the **WhatsApp**
  icon (as we already have).
- On the **right**, add a **wallet balance chip** (shows the shopper's ₹ balance,
  reads from the same wallet source we already use) + the **profile** icon +
  the **cart** icon.
- The wallet chip is a strong trust/retention signal — it surfaces the scratch
  rewards we credit, right in the header, and gives a one-tap path to the wallet.

---

## 2. Wallet page ("Blinkit Money")

- Full page: big 3D wallet illustration, brand + "MONEY" wordmark.
- Three benefit rows: **Single tap payments**, **Zero failures**,
  **Real-time refunds** (icon + title + one line each).
- Primary **"Add Money"** button, plus a **"Claim Gift Card"** row.
- Settings gear top-right, back arrow top-left.

**Map to TheBookX:** a dedicated wallet page showing balance, how it was earned
(scratch cards / rewards), where it applies (next order), and history. We already
credit a wallet — this gives it a real home.

---

## 3. Profile / "Your account" page

- Avatar + "Your account" + phone number.
- A contextual nudge card ("Add your birthday → Enter details").
- **3 quick tiles:** Your orders · Wallet (Blinkit Money) · Need help?
- **Appearance** row with LIGHT/DARK selector.
- A toggle row ("Hide sensitive items") with description + "Know more".
- **Your information** list: Address book, Wishlist, GST details, E-gift cards,
  etc. — each a row with a chevron.
- Further sections: Payment settings, Claim gift card, Your collected rewards,
  About us, Share the app, Notification preferences, **Log out**, and the app
  **version** at the very bottom.

**Map to TheBookX:** our profile can adopt this clean, sectioned, card-list
layout: quick tiles (Orders · Wallet · Help), an Appearance (light/dark) control,
and a tidy "Your information" list (Addresses, Wishlist, QuickReads library).

---

## 4. Payment method screen — PAIN-POINT patterns (very valuable)

Header shows **"Bill total: ₹104"**. Methods are grouped into labelled cards:
Recommended · Cards · Pay by any UPI app · Wallets · Pay Later · Netbanking ·
Pay On Delivery. The trust comes from **honest, inline status messaging**:

- **Not-applicable method** → greyed out with a red inline note:
  _"This payment method is not applicable on orders containing non-food items."_
- **Flaky method** → yellow caution banner under it:
  _"Facing high payment failures due to technical issues."_
- **Unavailable method** (COD) → greyed with red note:
  _"This payment method is not available at the moment."_
- Wallet row shows its **balance inline** (`Balance: ₹0`); un-linked wallets show
  an **"ADD"/"Link"** affordance instead of being clickable.

**Map to TheBookX:** on our checkout/payment step —
  - Show the **bill total in the header**.
  - **Grey out + explain** any method that isn't available (e.g. COD below a
    threshold, or COD temporarily off) with a clear one-line reason, instead of
    just a toast on click.
  - Put a **caution banner** on a method that's currently unreliable.
  - Show **wallet balance inline** and auto-select/enable it when usable.

---

## 5. Bottom navigation bar

- Persistent 5-tab bottom bar: **Home · Order Again · Categories · Print ·
  (partner)** with icon + label, active tab highlighted.

**Map to TheBookX:** a bottom nav could be **Home · Orders · Categories ·
Search · Profile** — faster reach to core areas on mobile.

---

## 6. Offers & cart-progress nudges

- **"OFFERS FOR YOU"** swipeable strip of offer cards (FLAT ₹50 OFF, FREE
  delivery) on the home screen.
- A **bottom progress nudge** just above the cart: _"Get FREE delivery — Add
  products worth ₹54 more"_ with a **progress bar** and **pagination dots (1/2,
  2/2)** that rotate between the free-delivery goal and the flat-off goal. It's
  dismissible (×).
- **Offer detail sheet:** tapping an offer opens a bottom sheet with a big %
  icon, the headline (_"Get FLAT ₹50 OFF"_), green-tick bullet points
  (auto-applied, exclusions, limited period) and a **"Got it, thanks!"** CTA.

**Map to TheBookX:** we already have a cart offer strip — we can add the
**rotating multi-goal progress nudge** and an **offer-detail bottom sheet** with
terms, which increases AOV and sets clear expectations.

---

## 7. Address entry flow

- "Add address details": **Select a city** → **Select an area/street** → **Enter
  complete address** (with example helper text) → **Add Google Maps link
  (optional)**.
- **Contact details:** "Myself / Someone else" toggle → Receiver's name +
  phone → "Save as address (optional)".
- Sticky **"Next"** CTA at the bottom.

**Map to TheBookX:** we already restructured our address modal similarly; worth
adopting the **"Myself / Someone else" gifting toggle** and the optional
**Google Maps link** for hard-to-find addresses.

---

## 8. Sticky "View cart" pill

- A floating green pill (item thumbnails + "View cart · N items" + chevron) sits
  persistently above the bottom nav on every browsing screen.

**Map to TheBookX:** our cart bar already does this; the thumbnail cluster +
count pattern is a nice touch to mirror.

---

## 9. Product card details (for reference)

- Image, wishlist **heart**, **ADD** button (with "N options" when variants
  exist), **price + strikethrough MRP + % off**, delivery-time chip ("8 mins"),
  rating, and tags ("Chilled", "Zero Sugar").

---

## 10. Misc trust/vibe patterns

- **Notification-permission prompt** modal (friendly bell illustration, "Enable
  notifications" / "No, thanks").
- **Empty states** with a branded illustration and a helpful line
  ("Reordering will be easy — items you order show up here").
- Consistent **rounded cards, soft tinted tile backgrounds, and a single strong
  accent colour** for all primary actions.

---

## Suggested priority for TheBookX

1. **Header wallet chip + profile** (what you asked for first).
2. **Payment pain-point messaging** (grey-out + inline reasons + caution banners).
3. **Profile page refresh** (quick tiles + tidy info list + appearance toggle).
4. **Wallet page** (a real home for the balance + rewards).
5. **Rotating cart-progress nudge + offer-detail sheet.**
6. **Bottom navigation bar.**
