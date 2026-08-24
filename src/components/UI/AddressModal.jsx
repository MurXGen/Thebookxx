"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { books as ALL_BOOKS } from "@/utils/book";
import LoadingButton from "./LoadingButton";
import {
  Copy,
  Download,
  Phone,
  ShieldCheck,
  Truck,
  RefreshCw,
  Info,
  X,
  MapPin,
  AlertCircle,
  User,
  Home,
  Zap,
  Clock,
  Package,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Gift,
  Smartphone,
  QrCode,
  Headphones,
  Loader2,
  Wallet,
  Check,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  TrendingDown,
  Banknote,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { EVENTS } from "@/lib/trackingEvents";
import { trackFunnelEvent } from "@/lib/analytics";
import { trackPurchase } from "@/lib/ga";
import {
  trackOrderToGoogleForm,
  creditWalletReward,
  orderWalletReward,
  fetchOrderStatusById,
  fetchWalletBalance,
  updateOrderRow,
} from "@/utils/googleFormOrder";
import ScratchRewardSheet from "./ScratchRewardSheet";
import { showToast } from "@/context/ToastContext";

const PINCODE_DATA_KEY = "user_pincode";

const CITIES = [
  "Mumbai",
  "Navi Mumbai",
  "Thane",
  "Kalyan",
  "Dombivli",
  "Virar",
  "Vasai",
  "Panvel",
  "Bhiwandi",
  "Ulhasnagar",
];

function normalizePhone(raw = "") {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length > 10) digits = digits.slice(-10);
  return digits;
}

// Wallet: customers can apply store-credit balance at checkout, capped per
// order. Balance is read via the /api/wallet server route (by phone).
const WALLET_MAX_PER_ORDER = 399;

export default function AddressModal({
  open,
  onClose,
  finalPayable,
  totalDiscounted,
  handleWhatsAppCheckout,
  handleCODCheckout,
  handleUPICheckout,
  notifyTelegram,
  standardDeliveryCharge = 0,
  fasterDeliveryCharge = 119,
  fasterUnavailable = false,
  totalWithStandardDelivery = 0,
  giftWrapCharge = 0,
  giftWrapSelected = false,
  cartBooks = [],
  offerDiscount = 0,
  offerLabel = "",
  generateViewBagLinkWithDetails,
  shortenUrl,
  codHandlingFee = 29, // NEW
  onUpsellAccept,
  // QuickReads riding on this same bill (flat add-on, no delivery/offer).
  quickReadItems = [],
  quickReadUnitPrice = 0,
  quickReadTotal = 0,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Wallet balance (looked up by the phone entered below)
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletChecked, setWalletChecked] = useState(false);
  const [walletChecking, setWalletChecking] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletEnabled, setWalletEnabled] = useState(false);
  const [walletCheckedPhone, setWalletCheckedPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  // Optional current-location pin (Google Maps link) — an alternative to
  // typing the full address. Appended to the address that goes to the sheet.
  const [locationLink, setLocationLink] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  // True only after the shopper actually edits the address themselves — so
  // auto-filled (localStorage / past-order) addresses don't trigger a location
  // permission prompt on blur.
  const addressEditedRef = useRef(false);

  // Apply a saved/prefilled address: pull any "Pinned location: <url>" out into
  // the pin state and keep the rest as the visible address (no re-prompt).
  const applySavedAddress = (raw, overwrite) => {
    const s = String(raw || "");
    const m = s.match(/(?:[,\s·]*)Pinned location:\s*(https?:\/\/\S+)/i);
    const link = m ? m[1] : "";
    const clean = s
      .replace(/(?:[,\s·]*)Pinned location:\s*https?:\/\/\S+/i, "")
      .replace(/(\s*,\s*){2,}/g, ", ")
      .replace(/^[\s,·]+|[\s,·]+$/g, "")
      .trim();
    if (link) setLocationLink((prev) => (overwrite ? link : prev || link));
    if (clean) setAddress((prev) => (overwrite ? clean : prev || clean));
  };
  // Structured address parts — combined into one address string on submit so
  // we capture strong, deliverable details instead of a vague single line.
  const [flatNo, setFlatNo] = useState("");
  const [building, setBuilding] = useState("");
  const [landmark, setLandmark] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [fasterDelivery, setFasterDelivery] = useState(false);
  const [isValidPincode, setIsValidPincode] = useState(true);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [showContactFields, setShowContactFields] = useState(false);
  const [showFasterDeliveryModal, setShowFasterDeliveryModal] = useState(false);
  // Full-page payment selection sheet (UPI / COD / WhatsApp + coins toggle).
  const [showPaySelect, setShowPaySelect] = useState(false);
  // Which method is currently highlighted on the "Choose payment method" sheet.
  // Defaults to none — the shopper must pick, then confirm with the button below.
  const [paySel, setPaySel] = useState("UPI"); // online selected by default
  // Which delivery speed is highlighted in the chooser (tap to select).
  const [deliverySel, setDeliverySel] = useState("standard");
  const [tempPaymentMethod, setTempPaymentMethod] = useState(null);
  const [addressFormStartTime, setAddressFormStartTime] = useState(null);
  // Tracks the last logged-in phone we prefilled from, so we re-prefill when a
  // shopper logs in as a different number but don't clobber active editing.
  const loginPrefillRef = useRef("");

  // ── Upsell: "The Art of Clarity" add-on before payment ──
  const ART_ID = "bk-002";
  const { cart, addToCart } = useStore();
  const artBook = ALL_BOOKS.find((b) => b.id === ART_ID);
  const hasArtInCart = (cart || []).some((i) => i.id === ART_ID);
  const [showUpsell, setShowUpsell] = useState(false);
  const [pendingMethod, setPendingMethod] = useState(null);

  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [showCODSuccess, setShowCODSuccess] = useState(false);
  // Real order id of the just-placed confirmed order (for the success modal's
  // note + faster-delivery upgrade writes).
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [successPayment, setSuccessPayment] = useState("COD");
  // "Pay online" method chooser (UPI apps + Cards/gift-card for overseas users)
  const [showPayMethod, setShowPayMethod] = useState(false);
  const [payMethodStage, setPayMethodStage] = useState("choose"); // choose|giftcard
  const [giftMethod, setGiftMethod] = useState(""); // selected card/voucher label
  const [giftCode, setGiftCode] = useState("");
  const [successPaymentLabel, setSuccessPaymentLabel] = useState("");
  const [showCODFeeModal, setShowCODFeeModal] = useState(false); // NEW
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);
  // UPI confirmation flow:
  // "await" — QR revealed, waiting for the shopper to tap Verify
  // "verifying" — 30s auto-check, polling the sheet every 10s
  // "timeout" — no confirmation in 30s; offer a WhatsApp verify fallback
  const [upiPhase, setUpiPhase] = useState("await");
  const [verifyCountdown, setVerifyCountdown] = useState(30);
  const [upiOrderRef, setUpiOrderRef] = useState("");
  const upiPollRef = useRef({ poll: null, tick: null });

  const [giftWrap, setGiftWrap] = useState(giftWrapSelected);
  // The modal stays mounted, so keep the internal gift-wrap flag in sync with
  // the bag's selection — otherwise the +₹25 never reflects in the totals.
  useEffect(() => {
    setGiftWrap(giftWrapSelected);
  }, [giftWrapSelected]);

  // Free bookmark add-on (promotional / blank / casual) — no charge.
  const [bookmark, setBookmark] = useState(false);
  const BOOKMARK_CHARGE = 0;

  const UPI_ID = "7977960242-1@okbizaxis";

  useEffect(() => {
    if (open) {
      trackFunnelEvent(EVENTS.ADDRESS_MODAL_OPENED, {
        cart_total: finalPayable,
        has_gift_wrap: giftWrapSelected,
      });
      setAddressFormStartTime(Date.now());
    }
  }, [open]);

  useEffect(() => {
    if (
      showContactFields &&
      name &&
      phone.length === 10 &&
      address &&
      city &&
      pincode
    ) {
      const timeSpent = addressFormStartTime
        ? Math.round((Date.now() - addressFormStartTime) / 1000)
        : null;
      trackFunnelEvent(EVENTS.ADDRESS_FORM_COMPLETED, {
        has_name: !!name,
        has_phone: !!phone,
        has_address: !!address,
        has_city: !!city,
        time_to_complete_seconds: timeSpent,
      });
    }
  }, [showContactFields, name, phone, address, city, pincode]);

  useEffect(() => {
    if (open) {
      const savedPincodeData = localStorage.getItem(PINCODE_DATA_KEY);
      if (savedPincodeData) {
        try {
          const parsedData = JSON.parse(savedPincodeData);
          if (parsedData.pincode && !pincode) {
            trackFunnelEvent(EVENTS.PINCODE_AUTO_POPULATED, {
              pincode: parsedData.pincode,
              source: "localStorage",
            });
            setPincode(parsedData.pincode);
            if (parsedData.pincode.length === 6) {
              fetchLocationByPincode(parsedData.pincode);
            }
          }
          if (parsedData.city && !city) setCity(parsedData.city);
          if (parsedData.area && !area) setArea(parsedData.area);
          if (parsedData.district && !district)
            setDistrict(parsedData.district);
        } catch (error) {
          console.error("Error loading saved pincode data:", error);
        }
      }
    }
  }, [open]);

  const handlePincodeChange = (e) => {
    const newPincode = e.target.value.replace(/\D/g, "");
    if (newPincode.length === 6 && pincode.length !== 6) {
      trackFunnelEvent(EVENTS.PINCODE_MANUAL_ENTRY, { pincode: newPincode });
    }
    setPincode(newPincode);
  };

  const handlePhoneChange = (e) => {
    setPhone(normalizePhone(e.target.value));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    setPhone(normalizePhone(pasted));
  };

  const isCartBelow399 = totalDiscounted < 399;

  // Look up wallet balance from the orders sheet for the entered phone.
  const checkWallet = async (digits) => {
    setWalletChecking(true);
    setWalletError("");
    try {
      // Reads the sheet server-side and returns only this phone's balance.
      const bal = await fetchWalletBalance(digits);
      setWalletBalance(bal);
      setWalletChecked(true);
      setWalletCheckedPhone(digits);
      setWalletEnabled(false); // coins off by default; user opts in at payment
    } catch (e) {
      console.error("Wallet check failed:", e);
      setWalletBalance(0);
    } finally {
      setWalletChecking(false);
    }
  };

  // Auto-search the wallet the moment a valid 10-digit number is entered.
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10 && digits !== walletCheckedPhone) {
      checkWallet(digits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  // Prefill the checkout from a logged-in shopper's first order on record.
  // Same orders sheet as the wallet, so we grab their earliest matching row
  // and fill name / address / city / pincode. When `overwrite` is true we
  // replace existing values (used when loading a logged-in user's profile);
  // otherwise we only fill blanks.
  const prefillFromOrders = async (digits, overwrite = false) => {
    try {
      // Server route returns only this phone's own order rows.
      const res = await fetch(
        `/api/orders?phone=${encodeURIComponent(digits.slice(-10))}`,
      );
      const json = await res.json();
      const matches = Array.isArray(json.orders) ? json.orders : [];
      if (!matches.length) return;
      const first = matches[0]; // their 1st address out of all past orders
      const nm = String(first["Customer Name"] ?? "").trim();
      const addr = String(first["Address"] ?? "").trim();
      const cty = String(first["City"] ?? "").trim();
      const st = String(first["State"] ?? "").trim();
      const pin = String(first["Pincode"] ?? "")
        .replace(/\D/g, "")
        .slice(0, 6);
      const put = (setter, val) => {
        if (!val) return;
        setter((prev) => (overwrite ? val : prev || val));
      };
      put(setName, nm);
      applySavedAddress(addr, overwrite);
      if (cty) {
        put(setCity, cty);
        put(setDistrict, cty);
      } else if (st) {
        put(setDistrict, st);
      }
      if (pin) put(setPincode, pin);
    } catch (e) {
      console.error("Prefill from orders failed:", e);
    }
  };

  // When a shopper has "logged in" via their number (track_orders_phone saved on
  // the profile/track page), reuse it at checkout: whenever the modal opens and
  // the form isn't already showing that number, load it — set the phone (which
  // triggers the wallet lookup) and pull their first past order to prefill the
  // address. Keyed on the phone so a fresh login after logout re-prefills, but a
  // shopper actively editing their own logged-in number is left untouched.
  useEffect(() => {
    if (!open) return;
    let loginPhone = "";
    try {
      loginPhone = normalizePhone(
        localStorage.getItem("track_orders_phone") || "",
      );
    } catch (_) {}
    if (loginPhone.length !== 10) return;
    const current = phone.replace(/\D/g, "");
    if (current === loginPhone || loginPrefillRef.current === loginPhone)
      return;
    loginPrefillRef.current = loginPhone;
    setPhone(loginPhone); // drives the wallet lookup + marks this profile loaded
    prefillFromOrders(loginPhone, true); // overwrite with their profile address
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // How much wallet (coins) can be applied to THIS order, by order value:
  // ₹151–300 up to ₹15
  // ₹300–500 up to ₹30
  // > ₹500 full available balance
  // (always capped by the actual balance and the goods total.)
  // Coins redemption: if the wallet balance is above ₹100 they can redeem up
  // to 50% of it; ₹100 or below can be used in full.
  const walletCapForOrder =
    walletBalance > 100 ? Math.floor(walletBalance * 0.5) : walletBalance;
  const maxWalletUsable = Math.min(
    walletBalance,
    walletCapForOrder,
    Math.max(0, finalPayable),
  );
  const walletApplied =
    walletEnabled && walletBalance > 0 ? maxWalletUsable : 0;
  // QuickReads add-on rides on the same bill (flat, no delivery/offer applied).
  const qrAddOn = quickReadTotal || 0;
  const netPayable = Math.max(0, finalPayable - walletApplied) + qrAddOn;

  const getDeliveryCharge = (isFaster) =>
    isFaster ? fasterDeliveryCharge : standardDeliveryCharge;

  const getTotalWithDelivery = (isFaster) =>
    netPayable + getDeliveryCharge(isFaster);

  const totalWithDelivery = getTotalWithDelivery(fasterDelivery);
  const codAdvanceAmount = 99;

  // Add-ons that ride on the bill (gift wrap + bookmark).
  const bookmarkChargeAmount = bookmark ? BOOKMARK_CHARGE : 0;
  const addOnsCharge = (giftWrap ? giftWrapCharge : 0) + bookmarkChargeAmount;

  // For the COD fee modal comparison
  const upiTotalForFlow = getTotalWithDelivery(fasterDelivery) + addOnsCharge;
  // COD handling fee is 5.9% of the bill (Indian Post raised their charges,
  // so COD now carries a percentage fee instead of a flat ₹29).
  const codFeeAmount = Math.max(0, Math.round(upiTotalForFlow * 0.059));
  const codTotalWithFee = upiTotalForFlow + codFeeAmount;

  // Only ONE ₹1 book is allowed per order. Count the total quantity of
  // ₹1-priced books; if it's more than one, checkout is blocked.
  const oneRupeeQty = (cartBooks || []).reduce(
    (sum, b) => sum + (Number(b.discountedPrice) === 1 ? b.qty || 1 : 0),
    0,
  );
  const tooManyOneRupee = oneRupeeQty > 1;

  const fetchLocationByPincode = async (pincodeValue) => {
    if (!pincodeValue || pincodeValue.length !== 6) return;
    setIsFetchingLocation(true);
    setPincodeError("");
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincodeValue}`,
      );
      const data = await response.json();
      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setCity(postOffice.District);
        setDistrict(postOffice.District);
        setArea(postOffice.Name);
        setIsValidPincode(true);
        setPincodeError("");
      } else {
        setIsValidPincode(true);
        setPincodeError(
          "Pincode could not be verified, but you can still proceed.",
        );
        setArea("");
        setCity("");
        setDistrict("");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      setIsValidPincode(true);
      setPincodeError("Unable to verify pincode. You can still proceed.");
    } finally {
      setIsFetchingLocation(false);
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      fetchLocationByPincode(pincode);
    } else if (pincode.length > 0 && pincode.length < 6) {
      setPincodeError("Please enter a complete 6-digit pincode");
      setIsValidPincode(true);
    } else {
      setIsValidPincode(true);
      setPincodeError("");
    }
  }, [pincode]);

  useEffect(() => {
    if (address && city) setShowContactFields(true);
    else setShowContactFields(false);
  }, [address, city]);

  // UPI verification: once the shopper taps Verify we poll the sheet every 10s
  // for 30s to see if the admin removed the "(unconfirmed)" tag. Confirmed
  // success screen; otherwise timeout (WhatsApp fallback offered).
  useEffect(() => {
    if (upiPhase !== "verifying") return;
    let cancelled = false;
    const check = async () => {
      if (!upiOrderRef) return;
      const { confirmed } = await fetchOrderStatusById(upiOrderRef);
      if (!cancelled && confirmed) finalizeUPISuccess();
    };
    const tick = setInterval(() => {
      setVerifyCountdown((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    const poll = setInterval(check, 10000);
    upiPollRef.current = { poll, tick };
    check(); // immediate first check
    const to = setTimeout(() => {
      if (cancelled) return;
      clearInterval(poll);
      clearInterval(tick);
      setUpiPhase((ph) => (ph === "verifying" ? "timeout" : ph));
    }, 30500);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiPhase, upiOrderRef]);

  // UPI modal: show a 2s "generating QR" loader (QR blurred), then reveal the
  // sharp QR and automatically begin the 30s waiting/verification — no manual
  // "Reveal QR" or "Verify" tap needed.
  useEffect(() => {
    if (!showUPIPayment) return;
    setQrUnlocked(false);
    setUpiPhase("await");
    const t = setTimeout(() => {
      setQrUnlocked(true);
      setVerifyCountdown(30);
      setUpiPhase("verifying");
      trackPurchase({
        cartItems: cartBooks,
        totalAmount: netPayable,
        paymentId: `UPI-${upiOrderRef || Date.now()}`,
      });
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUPIPayment]);

  // "Check payment status" — re-run the 30s verification poll.
  const handleCheckUPIStatus = () => {
    setVerifyCountdown(30);
    setUpiPhase("verifying");
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("checkoutAddress") || "null");
    if (saved) {
      setName(saved.name || "");
      setPhone(normalizePhone(saved.phone || ""));
      setCity(saved.city || "");
      setPincode(saved.pincode || "");
      applySavedAddress(saved.address || "", true);
      setDistrict(saved.district || "");
      setArea(saved.area || "");
      setFasterDelivery(saved.fasterDelivery || false);
    }
  }, []);

  useEffect(() => {
    if (showContactFields) {
      localStorage.setItem(
        "checkoutAddress",
        JSON.stringify({
          name,
          phone,
          city,
          pincode,
          address,
          district,
          area,
          fasterDelivery,
        }),
      );
    }
  }, [
    name,
    phone,
    city,
    pincode,
    address,
    district,
    area,
    fasterDelivery,
    showContactFields,
  ]);

  const buildShortLink = async (
    paymentTypeLabel,
    isFaster = fasterDelivery,
  ) => {
    if (typeof generateViewBagLinkWithDetails !== "function") return "";
    try {
      const longUrl = generateViewBagLinkWithDetails(
        { name, phone, address, area, city, district, pincode },
        paymentTypeLabel,
        isFaster,
        giftWrap || giftWrapSelected,
      );
      if (!longUrl) return "";
      if (typeof shortenUrl === "function") {
        try {
          const short = await shortenUrl(longUrl);
          return short || longUrl;
        } catch {
          return longUrl;
        }
      }
      return longUrl;
    } catch (e) {
      console.error("buildShortLink failed:", e);
      return "";
    }
  };

  // Submit to Google Form (the sheet's source of truth).
  // IMPORTANT: `isFaster` must be passed explicitly when the caller knows the
  // user's delivery-speed choice, because `setFasterDelivery` is async and
  // reading from `fasterDelivery` state inside this function can return the
  // pre-selection default. The default arg falls back to state for safety.
  const submitToGoogleForm = async (
    paymentType,
    isFaster = fasterDelivery,
    confirmed = false,
    orderId = undefined,
    paymentLabel = "",
  ) => {
    // For a CONFIRMED order without an explicit id, mint one and remember it so
    // the success modal can edit this exact row (note / faster-delivery upgrade).
    if (confirmed && !orderId) {
      orderId = `ORD${Date.now()}`;
      setPlacedOrderId(orderId);
    } else if (confirmed && orderId) {
      setPlacedOrderId(orderId);
    }
    try {
      // Build the link SYNCHRONOUSLY (no await on the URL shortener). Awaiting
      // a slow shortener here used to delay the sheet POST — if the shopper
      // abandoned before it resolved, the "(unconfirmed)" row never got written.
      let shortLink = "";
      try {
        if (typeof generateViewBagLinkWithDetails === "function") {
          shortLink =
            generateViewBagLinkWithDetails(
              { name, phone, address, area, city, district, pincode },
              paymentType,
              isFaster,
              giftWrap || giftWrapSelected,
            ) || "";
        }
      } catch (_) {}
      const feeForThisOrder = paymentType === "COD" ? codFeeAmount : 0;
      const deliveryChargeForOrder = getDeliveryCharge(isFaster);
      const giftWrapOn = giftWrap || giftWrapSelected;
      const giftWrapAmountForOrder = giftWrapOn ? giftWrapCharge : 0;
      const bookmarkAmountForOrder = bookmark ? BOOKMARK_CHARGE : 0;

      // Until the shopper reaches the final confirm step, the order is logged
      // with a "(unconfirmed)" tag on the name so the dashboard can tell
      // completed orders apart from drop-offs. Hidden from the customer profile.
      const displayName = confirmed ? name : `${name} (unconfirmed)`;

      trackOrderToGoogleForm({
        addressData: {
          name: displayName,
          phone,
          pincode,
          city,
          address: fullAddress,
        },
        paymentType,
        paymentLabel,
        fasterDeliveryChoice: isFaster,
        giftWrapSelected: giftWrapOn,
        shortLink,
        totalWithDelivery:
          netPayable +
          deliveryChargeForOrder +
          giftWrapAmountForOrder +
          bookmarkAmountForOrder +
          feeForThisOrder,
        bookmarkSelected: bookmark,
        bookmarkCharge: bookmarkAmountForOrder,
        // Itemised values, match what the user sees in the success modal
        subtotal: totalDiscounted,
        finalPayable: netPayable,
        totalDiscounted,
        offerDiscount,
        offerLabel,
        // Only debit the wallet on the CONFIRMED order row — the earlier
        // "(unconfirmed)" draft row must not deduct, or it double-counts.
        walletUsed: confirmed ? walletApplied : 0,
        walletPhone: confirmed && walletApplied > 0 ? walletCheckedPhone : "",
        deliveryCharge: deliveryChargeForOrder,
        deliveryType: isFaster ? "Faster" : "Standard",
        giftWrapCharge: giftWrapAmountForOrder,
        codHandlingFee: feeForThisOrder,
        cartBooks,
        orderId,
      }).catch((err) => console.error("Google Form submit failed:", err));
    } catch (err) {
      console.error("Google Form submit threw:", err);
    }
  };

  // After delivery-speed selection, UPI users go straight to UPI modal,
  // COD users now go through the COD fee disclosure modal first.
  const handleProceedWithFasterDelivery = () => {
    setFasterDelivery(true);
    setShowFasterDeliveryModal(false);
    trackFunnelEvent(EVENTS.DELIVERY_SPEED_SELECTED, {
      choice: "faster",
      delivery_charge: fasterDeliveryCharge,
      cart_total: finalPayable,
    });
    // Sheet write happens HERE, after user has picked delivery speed.
    // Passing `true` explicitly because setFasterDelivery is async.
    if (tempPaymentMethod === "UPI") {
      const ref = `TBX${Date.now()}`;
      setUpiOrderRef(ref);
      setUpiPhase("await");
      setQrUnlocked(false);
      submitToGoogleForm("UPI", true, false, ref);
      setShowUPIPayment(true);
    } else {
      submitToGoogleForm(tempPaymentMethod, true);
      if (tempPaymentMethod === "COD") setShowCODFeeModal(true);
    }
  };

  const handleProceedWithoutFasterDelivery = () => {
    setFasterDelivery(false);
    setShowFasterDeliveryModal(false);
    trackFunnelEvent(EVENTS.DELIVERY_SPEED_SELECTED, {
      choice: "standard",
      delivery_charge: standardDeliveryCharge,
      cart_total: finalPayable,
    });
    if (tempPaymentMethod === "UPI") {
      const ref = `TBX${Date.now()}`;
      setUpiOrderRef(ref);
      setUpiPhase("await");
      setQrUnlocked(false);
      submitToGoogleForm("UPI", false, false, ref);
      setShowUPIPayment(true);
    } else {
      submitToGoogleForm(tempPaymentMethod, false);
      if (tempPaymentMethod === "COD") setShowCODFeeModal(true);
    }
  };

  // Persist the shopper's number so their profile is auto-logged-in. Always
  // overrides any previously saved number with the one entered at checkout.
  const persistLogin = () => {
    const digits = normalizePhone(phone);
    if (digits.length !== 10) return;
    try {
      localStorage.setItem("track_orders_phone", digits);
      if (name) localStorage.setItem("track_orders_name", name);
      let list = [];
      try {
        list = JSON.parse(
          localStorage.getItem("track_orders_saved_phones") || "[]",
        );
      } catch (_) {}
      if (!Array.isArray(list)) list = [];
      list = [digits, ...list.filter((x) => x !== digits)].slice(0, 5);
      localStorage.setItem("track_orders_saved_phones", JSON.stringify(list));
    } catch (_) {}
  };

  // Navigate to the (now auto-logged-in) profile.
  const goToProfile = () => {
    persistLogin();
    if (typeof window !== "undefined") window.location.assign("/profile");
  };

  const triggerCODSuccess = (isFasterDeliverySelected) => {
    setFasterDelivery(isFasterDeliverySelected);
    persistLogin();
    setSuccessPayment("COD");
    setShowCODSuccess(true);
  };

  // Finalise a UPI order after the shopper closes the success screen (mirrors
  // the COD flow — the order row was already logged on Verify).
  const handleUPISuccessContinue = () => {
    setShowCODSuccess(false);
    if (handleUPICheckout) {
      handleUPICheckout(
        {
          name,
          phone,
          city,
          pincode,
          address,
          district,
          area,
          fasterDelivery,
          giftWrap,
          orderId: placedOrderId || upiOrderRef,
        },
        fasterDelivery,
        giftWrap,
      );
    }
    onClose();
  };

  // NEW, user confirmed they'll pay the COD fee
  const handleConfirmCODWithFee = () => {
    setShowCODFeeModal(false);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "COD_confirmed_with_fee",
      cart_total: finalPayable,
      cod_fee: codFeeAmount,
    });
    triggerCODSuccess(fasterDelivery);
    // GA purchase — only counted here, at the COD success point.
    trackPurchase({
      cartItems: cartBooks,
      totalAmount: netPayable,
      paymentId: `COD-${Date.now()}`,
    });
    // Now log the CONFIRMED order (plain name, no "(unconfirmed)" tag).
    submitToGoogleForm("COD", fasterDelivery, true);
    // Push the COD order to Telegram (previously only UPI notified — the COD
    // success modal never invoked its onContinue handler). Fire-and-forget so
    // it never blocks the success screen.
    notifyCODToTelegram(fasterDelivery);
  };

  // Sends the Telegram notification for a COD order (no WhatsApp redirect).
  const notifyCODToTelegram = async (isFaster) => {
    if (!notifyTelegram) return;
    try {
      const addressData = {
        name,
        phone,
        city,
        pincode,
        address: fullAddress,
        district,
        area,
        fasterDelivery: isFaster,
        giftWrap,
      };
      let shortLink = "";
      if (generateViewBagLinkWithDetails && shortenUrl) {
        const link = generateViewBagLinkWithDetails(
          addressData,
          "COD",
          isFaster,
          giftWrap,
        );
        shortLink = await shortenUrl(link);
      }
      await notifyTelegram(addressData, "COD", isFaster, giftWrap, shortLink);
    } catch (e) {
      console.error("COD Telegram notification failed:", e);
    }
  };

  // NEW, user switched to UPI from the COD fee modal (the deflection success path)
  const handleSwitchToUPIFromCODFee = () => {
    setShowCODFeeModal(false);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "UPI_switched_from_COD",
      cart_total: finalPayable,
      saved_amount: codFeeAmount,
    });
    // Re-submit Google Form as UPI (overrides the earlier COD submission).
    // By this point delivery speed has already been picked, so state is correct.
    submitToGoogleForm("UPI", fasterDelivery);
    setTempPaymentMethod("UPI");
    setShowUPIPayment(true);
  };

  const handleCODSuccessContinue = () => {
    setShowCODSuccess(false);
    if (handleCODCheckout) {
      handleCODCheckout(
        {
          name,
          phone,
          city,
          pincode,
          address,
          district,
          area,
          fasterDelivery,
          giftWrap,
          orderId: placedOrderId,
        },
        fasterDelivery,
        giftWrap,
      );
    }
    onClose();
  };

  // NEW consolidated flow: delivery speed + coins are chosen before this, so
  // routing goes straight to the payment step (no speed modal). `isFaster`
  // comes from the add-on checkbox in the address form.
  const submitAndRoute = (method, isFaster) => {
    if (method === "UPI") {
      // "Pay online" → open the method chooser (UPI apps + Cards/gift-card).
      // The order row is written only once the shopper picks a real method.
      setPayMethodStage("choose");
      setGiftMethod("");
      setGiftCode("");
      setShowPayMethod(true);
    } else if (method === "COD") {
      // The ₹29 fee is already disclosed on the Summary & Pay sheet, so place
      // the COD order directly (no second fee-confirmation modal).
      trackPurchase({
        cartItems: cartBooks,
        totalAmount: netPayable,
        paymentId: `COD-${Date.now()}`,
      });
      submitToGoogleForm("COD", isFaster, true);
      notifyCODToTelegram(isFaster);
      triggerCODSuccess(isFaster);
    }
  };

  // Chose a specific UPI app (Paytm / PhonePe / GPay / Other) → log the order
  // with that app as the source, then show the existing UPI QR modal.
  const chooseUpiApp = (app) => {
    const ref = `TBX${Date.now()}`;
    setUpiOrderRef(ref);
    setUpiPhase("await");
    setQrUnlocked(false);
    const label = `${app} (UPI)`;
    submitToGoogleForm("UPI", fasterDelivery, false, ref, label);
    setSuccessPayment("UPI");
    setSuccessPaymentLabel(label);
    setShowPayMethod(false);
    setShowUPIPayment(true);
  };

  // Chose a card / net-banking method → show the gift-card instruction step.
  const chooseGiftMethod = (label) => {
    setGiftMethod(label);
    setGiftCode("");
    setPayMethodStage("giftcard");
  };

  // Submit the pasted gift-card code → record the confirmed order with the
  // method + code as the payment source, then show the success receipt.
  const submitGiftCard = () => {
    const code = giftCode.trim();
    if (code.length < 4) {
      showToast("Please paste a valid gift-card code.", "error");
      return;
    }
    const label = `${giftMethod} · Gift card: ${code}`;
    try {
      trackPurchase({
        cartItems: cartBooks,
        totalAmount: netPayable,
        paymentId: `GIFT-${Date.now()}`,
      });
    } catch (_) {}
    submitToGoogleForm(giftMethod, fasterDelivery, true, undefined, label);
    setShowPayMethod(false);
    setFasterDelivery(fasterDelivery);
    persistLogin();
    setSuccessPayment("UPI");
    setSuccessPaymentLabel(label);
    setShowCODSuccess(true);
  };

  const beginPayment = (method) => {
    if (!isFormValid()) {
      showToast(validationMessage(), "error");
      return;
    }
    setShowPaySelect(false);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method,
      cart_total: finalPayable,
    });
    if (method === "WhatsApp") {
      handleWhatsAppOrderClick();
      return;
    }
    submitAndRoute(method, fasterDelivery);
  };

  const handleCODClick = () => {
    if (!isFormValid()) return;
    // NOTE: Form submission is intentionally NOT here, it now fires inside
    // handleProceedWithFasterDelivery / handleProceedWithoutFasterDelivery
    // so that the sheet captures the user's actual delivery-speed choice.
    setTempPaymentMethod("COD");
    setShowFasterDeliveryModal(true);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "COD",
      cart_total: finalPayable,
    });
  };

  const handleUPIClick = () => {
    if (!isFormValid()) return;
    // NOTE: Form submission is intentionally NOT here, see handleCODClick.
    setTempPaymentMethod("UPI");
    setShowFasterDeliveryModal(true);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "UPI",
      cart_total: finalPayable,
    });
  };

  const handleWhatsAppOrderClick = () => {
    if (!isFormValid()) return;
    // WhatsApp-button orders are logged as unconfirmed (name keeps the
    // "(unconfirmed)" tag) until we confirm the chat/payment manually.
    // Generate ONE order id and use it for both the sheet row and the WhatsApp
    // message link (thebookx.in?orderID=…), so the link resolves to this order.
    const orderId = `ORD${Date.now()}`;
    submitToGoogleForm("WhatsApp", fasterDelivery, false, orderId);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "WhatsApp",
      cart_total: finalPayable,
    });
    if (handleCODCheckout) {
      handleCODCheckout(
        {
          name,
          phone,
          city,
          pincode,
          address,
          district,
          area,
          fasterDelivery,
          giftWrap,
          orderId,
        },
        fasterDelivery,
        giftWrap,
        "WhatsApp",
      );
    }
    onClose();
  };

  // Keep a live reference to the payment handlers so the upsell can proceed
  // with fresh state (e.g. correct totals after adding the upsell book).
  const paymentHandlersRef = useRef({});
  paymentHandlersRef.current = {
    COD: handleCODClick,
    UPI: handleUPIClick,
    WhatsApp: handleWhatsAppOrderClick,
  };

  // Intercept a payment button: if the address is valid and the shopper
  // hasn't already added "The Art of Clarity", show the upsell first.
  // Specific reason the checkout can't proceed, shown as a toast on click.
  const validationMessage = () => {
    if (pincode.length !== 6) return "Please enter a valid 6-digit pincode";
    if (!flatNo.trim()) return "Please add your flat / house number";
    if (!address.trim()) return "Please add your area / locality address";
    if (!city.trim()) return "Please enter your city";
    if (!name.trim()) return "Please enter your name";
    if (phone.replace(/\D/g, "").length !== 10)
      return "Please enter a valid 10-digit phone number";
    return "Please complete your details to proceed";
  };

  const attemptPayment = (method) => {
    if (!isFormValid()) {
      showToast(validationMessage(), "error");
      return;
    }
    // The Art of Clarity checkout upsell is disabled — go straight to payment.
    paymentHandlersRef.current[method]?.();
  };

  const proceedPendingPayment = () => {
    const method = pendingMethod;
    setShowUpsell(false);
    setPendingMethod(null);
    // Defer so any cart/total change from accepting the upsell is applied first
    setTimeout(() => paymentHandlersRef.current[method]?.(), 60);
  };

  const acceptUpsell = () => {
    if (artBook) addToCart(ART_ID);
    onUpsellAccept?.(); // tells the bag to apply the ₹40 add-on discount
    trackFunnelEvent(EVENTS.REGULAR_BOOK_ADDED, {
      book: "The Art of Clarity",
      source: "checkout_upsell",
    });
    proceedPendingPayment();
  };

  const declineUpsell = () => {
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: pendingMethod,
      upsell: "declined",
    });
    proceedPendingPayment();
  };

  const handleUPIPaymentClick = async () => {
    if (!isFormValid()) return;
    trackFunnelEvent(EVENTS.UPI_PAYMENT_INITIATED, {
      total_amount: finalPayable,
      delivery_type: fasterDelivery ? "faster" : "standard",
    });
    setQrUnlocked(true);
    trackFunnelEvent(EVENTS.UPI_QR_REVEALED, { amount: finalPayable });
  };

  const handleCopyUpiId = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
    } catch (_) {}
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 3000);
    showToast("UPI ID copied to clipboard", "success");
    trackFunnelEvent(EVENTS.UPI_LINK_COPIED, {});
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = "/books/uskillbook.png";
    link.download = "thebookx-upi-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR code downloaded", "success");
    trackFunnelEvent(EVENTS.UPI_QR_DOWNLOADED, {});
  };

  const clearUpiTimers = () => {
    if (upiPollRef.current.poll) clearInterval(upiPollRef.current.poll);
    if (upiPollRef.current.tick) clearInterval(upiPollRef.current.tick);
    upiPollRef.current = { poll: null, tick: null };
  };

  // Payment confirmed (admin removed the "(unconfirmed)" tag) success screen.
  const finalizeUPISuccess = () => {
    clearUpiTimers();
    setUpiPhase("confirmed");
    setShowUPIPayment(false);
    persistLogin();
    setSuccessPayment("UPI");
    setShowCODSuccess(true);
  };

  // Timeout fallback: hand the order to WhatsApp with everything pre-filled,
  // including a MERCHANT CONFIRMATION LINK. The merchant opens the link, enters
  // the password and the order is confirmed (+ wallet debited) on the sheet.
  const handleUPIWhatsAppVerify = async () => {
    const bookLines = (cartBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.qty}`)
      .join("\n");
    const amountPaid =
      netPayable +
      getDeliveryCharge(fasterDelivery) +
      (giftWrap ? giftWrapCharge : 0);

    // Merchant confirm link /{orderId}?w=<walletUsed>
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://thebookx.in";
    let confirmLink = `${origin}/${encodeURIComponent(upiOrderRef || "")}${
      walletApplied > 0 ? `?w=${walletApplied}` : ""
    }`;
    try {
      if (typeof shortenUrl === "function") {
        const short = await shortenUrl(confirmLink);
        if (short) confirmLink = short;
      }
    } catch (_) {}

    const msg = [
      "Hi TheBookX ",
      "",
      "I've *paid via UPI* but my order is still showing as verifying. Please confirm it.",
      "",
      ` *Order Ref:* ${upiOrderRef || "-"}`,
      ` *Name:* ${name}`,
      ` *Phone:* ${phone}`,
      ` *Address:* ${fullAddress}, ${city} - ${pincode}`,
      bookLines ? "" : "",
      bookLines ? ` *Items:*\n${bookLines}` : "",
      "",
      ` *Amount paid:* ₹${amountPaid}`,
      walletApplied > 0 ? ` *Wallet used:* ₹${walletApplied}` : "",
      "",
      "———",
      " *Merchant only* — confirm this order:",
      confirmLink,
    ]
      .filter((l) => l !== "")
      .join("\n");
    trackFunnelEvent(EVENTS.UPI_PAYMENT_VERIFIED, {
      amount: finalPayable,
      via: "whatsapp_fallback",
    });
    window.open(
      `https://wa.me/917710892108?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  // Shopper taps the Verify button on the QR screen.
  const handleVerifyUPIPayment = () => {
    if (upiPhase === "timeout") {
      handleUPIWhatsAppVerify();
      return;
    }
    if (upiPhase === "verifying") return; // already checking
    trackFunnelEvent(EVENTS.UPI_PAYMENT_VERIFIED, {
      amount: finalPayable,
      verification_time: verifyTimer,
    });
    // Count the purchase intent here (order row already logged as unconfirmed).
    trackPurchase({
      cartItems: cartBooks,
      totalAmount: netPayable,
      paymentId: `UPI-${upiOrderRef || Date.now()}`,
    });
    setVerifyCountdown(30);
    setUpiPhase("verifying");
  };

  // From the UPI page: shopper has no online-payment option switch to COD
  // and place the order directly (skips the fee-disclosure step).
  const switchToCODFromUPI = () => {
    setShowUPIPayment(false);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "COD_from_UPI",
    });
    trackPurchase({
      cartItems: cartBooks,
      totalAmount: netPayable,
      paymentId: `COD-${Date.now()}`,
    });
    submitToGoogleForm("COD", fasterDelivery, true);
    triggerCODSuccess(fasterDelivery);
  };

  // Combine the structured parts into one deliverable address string.
  const fullAddress = [
    flatNo,
    building,
    landmark,
    address,
    locationLink ? `Pinned location: ${locationLink}` : "",
  ]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");

  // Capture the shopper's current GPS position as a Google Maps pin link. We
  // only STORE the pin (added to the address that goes to the sheet) — the
  // customer still types their full address themselves.
  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError("Location isn't supported on this device — please type your address.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationLink(
          `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        );
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocError(
          err && err.code === 1
            ? "Location permission denied — allow it or type your address."
            : "Couldn't get your location — try again or type your address.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  // When the shopper finishes the full address (blur) we (a) strip repeated
  // pincode/city tokens and (b) prompt once to pin their current location so
  // the delivery partner gets a map reference. Re-pins if they clear + edit.
  const handleAddressBlur = () => {
    dedupeAddress();
    if (
      addressEditedRef.current &&
      address.trim() &&
      !locationLink &&
      !locating
    ) {
      useCurrentLocation();
    }
  };

  // On blur, strip words from the address that are already captured in the
  // other fields (pincode, city, flat, building, landmark) to avoid repetition.
  const dedupeAddress = () => {
    const tokens = [pincode, city, flatNo, building, landmark]
      .flatMap((v) => String(v || "").split(/[\s,]+/))
      .map((t) => t.trim())
      .filter((t) => t.length > 2);
    if (!tokens.length || !address.trim()) return;
    let a = address;
    tokens.forEach((t) => {
      const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      a = a.replace(new RegExp(`\\b${esc}\\b`, "gi"), "");
    });
    a = a
      .replace(/\s{2,}/g, " ")
      .replace(/(\s*,\s*){2,}/g, ", ")
      .replace(/^[\s,]+|[\s,]+$/g, "")
      .trim();
    if (a !== address) setAddress(a);
  };
  const isAddressValid = () => Boolean(city && address.trim());
  // Progressive reveal: pincode first → address+contact → add-ons + CTA.
  const pincodeReady = pincode.length === 6 && isValidPincode;
  const contactReady = name.trim().length > 0 && phone.length === 10;

  const isFormValid = () =>
    Boolean(
      pincode.length === 6 && name && phone.length === 10 && isAddressValid(),
    );

  const phoneError =
    phone.length > 0 && phone.length < 10
      ? `${10 - phone.length} more digit${10 - phone.length === 1 ? "" : "s"} needed`
      : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bill-modal-overlay"
          onClick={onClose}
          style={{ maxWidth: "980px", margin: "0 auto" }}
        >
          <motion.div
            className="bill-modal addr-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bill-header">
              <span className="weight-600 font-16">Delivery Details</span>
              <span className="cursor-pointer" onClick={onClose}>
                <X size={16} />
              </span>
            </div>

            <div className="address-form-content">
              {/* Highlighted accuracy reminder — reduces failed deliveries */}
              <div className="addr-notice">
                <span className="addr-notice-ic">
                  <AlertCircle size={16} />
                </span>
                <span className="addr-notice-text">
                  Double-check your <b>address</b>, <b>pincode</b> &amp;{" "}
                  <b>phone</b> for faster & successful delivery.
                </span>
              </div>

              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <MapPin size={14} />
                  Pincode
                </label>
                <input
                  className={`sec-mid-btn width100 ${!isValidPincode && pincode ? "error-border" : ""}`}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={handlePincodeChange}
                  inputMode="numeric"
                />
                {isFetchingLocation && (
                  <span className="addr-hint">Fetching location…</span>
                )}
              </div>

              {pincodeReady && (
              <div className="input-group">
                <label>City / District</label>
                <input
                  list="cities"
                  className="sec-mid-btn width100"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <datalist id="cities">
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {city.trim().toLowerCase() === "mumbai" && (
                  <span className="mumbai-fast-note">
                    <Zap size={12} /> Orders within Mumbai delivered in 1–2 days
                  </span>
                )}
              </div>
              )}

              {pincodeReady && (
              <div className="input-group">
                <div className="addr-label-row">
                  <label>
                    Full address <span className="red">*</span>
                  </label>
                  {locationLink ? (
                    <span className="addr-pin-done">
                      <MapPin size={13} /> Location pinned
                      <Check size={12} strokeWidth={3} />
                      <button
                        type="button"
                        className="addr-pin-mini"
                        onClick={useCurrentLocation}
                        disabled={locating}
                      >
                        Re-pin
                      </button>
                      <button
                        type="button"
                        className="addr-pin-mini danger"
                        onClick={() => setLocationLink("")}
                      >
                        Remove
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="addr-pin-btn"
                      onClick={useCurrentLocation}
                      disabled={locating}
                    >
                      <MapPin size={13} />
                      {locating ? "Locating…" : "Pin my location"}
                    </button>
                  )}
                </div>
                <textarea
                  className="sec-mid-btn textarea"
                  placeholder="e.g. 12/A, Green Residency, 2nd floor, MG Road, near City Mall"
                  value={address}
                  onChange={(e) => {
                    addressEditedRef.current = true;
                    setAddress(e.target.value);
                  }}
                  onBlur={handleAddressBlur}
                  rows={3}
                />
                {locError && <span className="loc-pick-err">{locError}</span>}
              </div>
              )}

              <AnimatePresence>
                {pincodeReady && (
                  <motion.div
                    className="contact-fields-container"
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-row justify-between gap-12">
                      <div className="input-group">
                        <label className="flex flex-row gap-4 flex-center items-center">
                          <User size={14} />
                          Name <span className="red">*</span>
                        </label>
                        <input
                          className="sec-mid-btn width100"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label className="flex flex-row gap-4 flex-center items-center">
                          <Phone size={14} />
                          Phone Number <span className="red">*</span>
                        </label>
                        <input
                          className="sec-mid-btn width100"
                          placeholder="10-digit mobile number"
                          value={phone}
                          maxLength={15}
                          inputMode="tel"
                          onChange={handlePhoneChange}
                          onPaste={handlePhonePaste}
                        />
                        {phoneError && (
                          <span className="font-10 red mt-4">{phoneError}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ===== Add-ons: shown once name + phone are filled ===== */}
              {contactReady && (
                <div className="deliv-addon">
                  <span className="deliv-addon-head">Add-ons</span>
                  <div className="deliv-addon-row">
                    <div className="deliv-addon-l">
                      <Truck size={18} className="green" />
                      <div className="flex flex-col">
                        <span className="deliv-addon-t flex flex-row items-center gap-6">
                          Standard delivery
                          {standardDeliveryCharge === 0 && (
                            <span className="deliv-free-badge">
                              FREE above ₹199
                            </span>
                          )}
                        </span>
                        <span className="deliv-addon-s">
                          {standardDeliveryCharge > 0
                            ? "Reaches you in 3–9 days · handling & care in bill"
                            : "Reaches you in 3–9 days · included at no charge"}
                        </span>
                      </div>
                    </div>
                    <span className="deliv-addon-free">FREE</span>
                  </div>

                  <label className="deliv-addon-row deliv-addon-opt">
                    <div className="deliv-addon-l">
                      <span
                        className={`deliv-check${fasterDelivery ? " on" : ""}`}
                        aria-hidden="true"
                      >
                        {fasterDelivery && <Check size={12} strokeWidth={3} />}
                      </span>
                      <div className="flex flex-col">
                        <span className="deliv-addon-t">Faster delivery</span>
                        <span className="deliv-addon-s">
                          Priority dispatch · reaches within 2–5 days
                        </span>
                      </div>
                    </div>
                    <span className="deliv-addon-price">
                      +₹{fasterDeliveryCharge}
                    </span>
                    <input
                      type="checkbox"
                      className="wc-switch-input"
                      checked={fasterDelivery}
                      onChange={(e) => setFasterDelivery(e.target.checked)}
                    />
                  </label>

                  {/* Gift wrap add-on with a 3D gift logo when opted */}
                  <label className="deliv-addon-row deliv-addon-opt">
                    <div className="deliv-addon-l">
                      <span
                        className={`deliv-check${giftWrap ? " on" : ""}`}
                        aria-hidden="true"
                      >
                        {giftWrap && <Check size={12} strokeWidth={3} />}
                      </span>
                      <div className="flex flex-col">
                        <span className="deliv-addon-t">Gift wrap</span>
                        <span className="deliv-addon-s">
                          Wrapped with a ribbon · perfect to gift
                        </span>
                      </div>
                    </div>
                    <span className="deliv-addon-price">
                      +₹{giftWrapCharge}
                    </span>
                    <input
                      type="checkbox"
                      className="wc-switch-input"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                    />
                  </label>

                  {/* Bookmark add-on — chargeable ₹9 */}
                  <label className="deliv-addon-row deliv-addon-opt">
                    <div className="deliv-addon-l">
                      <span
                        className={`deliv-check${bookmark ? " on" : ""}`}
                        aria-hidden="true"
                      >
                        {bookmark && <Check size={12} strokeWidth={3} />}
                      </span>
                      <div className="flex flex-col">
                        <span className="deliv-addon-t">Bookmark</span>
                        <span className="deliv-addon-s">
                          A handpicked bookmark tucked into your parcel — never
                          lose your page again
                        </span>
                      </div>
                    </div>
                    <span className="deliv-addon-free">FREE</span>
                    <input
                      type="checkbox"
                      className="wc-switch-input"
                      checked={bookmark}
                      onChange={(e) => setBookmark(e.target.checked)}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Fixed footer — total + proceed stay pinned, form scrolls above */}
            <div className="addr-footer">
              {!pincodeReady && (
                <div className="addr-warn addr-warn-orange">
                  <AlertCircle size={13} />
                  <span>Enter your 6-digit pincode to continue</span>
                </div>
              )}

              {pincodeReady && !isAddressValid() && (
                <div className="addr-warn addr-warn-orange">
                  <AlertCircle size={13} />
                  <span>Fill your city and full address to proceed</span>
                </div>
              )}

              {pincodeReady && isAddressValid() && !contactReady && (
                <div className="addr-warn addr-warn-red">
                  <AlertCircle size={13} />
                  <span>Enter your name and a valid 10-digit phone</span>
                </div>
              )}

              <div className="bill-row total" style={{ marginBottom: 0 }}>
                <span className="font-16 weight-600">Total Payable</span>
                <span className="font-20 weight-700 green">
                  ₹{getTotalWithDelivery(fasterDelivery) + addOnsCharge}
                </span>
              </div>

              {contactReady && (
                <LoadingButton
                  className="pri-big-btn width100"
                  onClick={() => {
                    if (!isFormValid()) {
                      showToast(validationMessage(), "error");
                      return;
                    }
                    setPaySel(null);
                    setShowPaySelect(true);
                  }}
                >
                  <span className="flex flex-row items-center justify-center gap-6">
                    Proceed to payment
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </span>
                </LoadingButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ========== Payment selection (full-page) ========== */}
      <AnimatePresence>
        {showPaySelect && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaySelect(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal pay-sel-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">
                  Choose payment method
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowPaySelect(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="pay-sel">
                {/* Summary — books (horizontal), deliver-to, and the total */}
                <div className="pay-sel-bill">
                  {(() => {
                    const bookCount =
                      (cartBooks || []).reduce((s, b) => s + (b.qty || 1), 0) +
                      quickReadItems.length;
                    return (
                      <div className="ps-books-head">
                        <span className="ps-books-count">
                          {bookCount} {bookCount > 1 ? "items" : "item"}
                        </span>
                        <span className="ps-books-total">
                          ₹{totalDiscounted}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="ps-books-scroll">
                    {(cartBooks || []).map((b, i) => (
                      <span key={i} className="ps-book-cover" title={b.name}>
                        <img src={b.image} alt={b.name} loading="lazy" />
                        {b.qty > 1 && (
                          <span className="ps-book-qty">×{b.qty}</span>
                        )}
                      </span>
                    ))}
                    {quickReadItems.length > 0 && (
                      <span className="ps-book-chip">
                        {quickReadItems.length} QuickRead
                        {quickReadItems.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="ps-deliver">
                    <span className="ps-deliver-ic">
                      <MapPin size={14} />
                    </span>
                    <span className="ps-deliver-addr">
                      {name}, {fullAddress}, {city} - {pincode}
                    </span>
                    <span className="ps-deliver-type">
                      {fasterDelivery ? <Zap size={12} /> : <Truck size={12} />}
                      {fasterDelivery ? "Faster" : "Standard"}
                    </span>
                  </div>
                  {giftWrap && (
                    <div className="ps-sum-gift">
                      <span className="gift-3d on">
                        <Gift size={16} />
                      </span>
                      <span>Gift wrapped · +₹{giftWrapCharge}</span>
                    </div>
                  )}
                  {bookmark && (
                    <div className="ps-sum-gift">
                      <span className="gift-3d on">
                        <Bookmark size={15} />
                      </span>
                      <span>Bookmark added · FREE</span>
                    </div>
                  )}
                  <div className="ps-row ps-total">
                    <span>Total payable</span>
                    <span>
                      ₹{paySel === "COD" ? codTotalWithFee : upiTotalForFlow}
                    </span>
                  </div>
                </div>

                {/* Coins toggle (default off) */}
                {walletBalance > 0 && (
                  <label className="pay-sel-coins">
                    <span className="wc-icon">
                      <Wallet size={16} />
                    </span>
                    <span className="wc-apply-txt">
                      <span className="wc-bal">
                        Use coins · balance ₹{walletBalance}
                      </span>
                      <span className="wc-apply-note">
                        {walletEnabled
                          ? `Applying ₹${walletApplied} to this order`
                          : `You can use up to ₹${maxWalletUsable} on this order`}
                      </span>
                    </span>
                    <span
                      className={`wc-switch${walletEnabled ? " on" : ""}`}
                      aria-hidden="true"
                    >
                      <span className="wc-knob">
                        {walletEnabled && <Check size={11} strokeWidth={3} />}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="wc-switch-input"
                      checked={walletEnabled}
                      onChange={(e) => setWalletEnabled(e.target.checked)}
                    />
                  </label>
                )}

                {/* Two payment choices — online selected by default */}
                <div className="cod-choice-grid">
                  <button
                    type="button"
                    onClick={() => setPaySel("UPI")}
                    className={`cod-choice cod-choice-upi${paySel === "UPI" ? " selected" : ""}`}
                  >
                    <span className="cod-choice-main">
                      <span className="cod-choice-radio" aria-hidden="true" />
                      <span className="cod-choice-info">
                        <span className="cod-choice-title">Pay online</span>
                        <span className="cod-choice-sub">
                          UPI, cards &amp; more · no extra charge
                        </span>
                      </span>
                      <span className="cod-choice-right">
                        <span className="cod-choice-badge">
                          Save ₹{codFeeAmount}
                        </span>
                        <span className="cod-choice-amt">
                          ₹{upiTotalForFlow}
                        </span>
                      </span>
                    </span>
                    {/* Trust stripe inside the online card */}
                    <span className="pay-trust">
                      <span className="pay-trust-faces" aria-hidden="true">
                        {[1, 2, 3].map((n) => (
                          <img
                            key={n}
                            src={`/review/promotions/member-${n}.jpeg`}
                            alt=""
                            className="pay-trust-face"
                            loading="lazy"
                          />
                        ))}
                      </span>
                      <span className="pay-trust-txt">
                        <strong>Most people</strong> opt for online mode —
                        safer, faster &amp; more trusted
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaySel("COD")}
                    className={`cod-choice cod-choice-cod${paySel === "COD" ? " selected" : ""}`}
                  >
                    <span className="cod-choice-main">
                      <span className="cod-choice-radio" aria-hidden="true" />
                      <span className="cod-choice-info">
                        <span className="cod-choice-title">
                          Cash on Delivery
                        </span>
                        <span className="cod-choice-sub">
                          Pay at door · incl. ₹{codFeeAmount} fee
                        </span>
                      </span>
                      <span className="cod-choice-right">
                        <span className="cod-choice-amt">
                          ₹{codTotalWithFee}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Fixed footer — pay button (full width) + WhatsApp order */}
              <div className="pay-sel-footer">
                {tooManyOneRupee && (
                  <div className="onerupee-limit-note">
                    Only 1 book at ₹1 is allowed per order. Please remove the
                    extra ₹1 book{oneRupeeQty > 2 ? "s" : ""} to continue.
                  </div>
                )}
                <div className="pay-sel-footer-row">
                  <button
                    type="button"
                    className="sec-big-btn pay-sel-wa"
                    disabled={tooManyOneRupee}
                    onClick={() => !tooManyOneRupee && beginPayment("WhatsApp")}
                    aria-label="Order on WhatsApp"
                  >
                    <FaWhatsapp size={18} color="#25D366" />
                    <span>Order</span>
                  </button>
                  <button
                    type="button"
                    className="pri-big-btn pay-confirm-btn"
                    disabled={!paySel || tooManyOneRupee}
                    onClick={() =>
                      paySel && !tooManyOneRupee && beginPayment(paySel)
                    }
                  >
                    <span className="flex flex-row items-center justify-center gap-6">
                      {tooManyOneRupee
                        ? "Remove extra ₹1 book to continue"
                        : paySel === "UPI"
                          ? `Pay & save ₹${codFeeAmount}`
                          : paySel === "COD"
                            ? "Cash on Delivery"
                            : "Select a payment method"}
                      {paySel && !tooManyOneRupee && (
                        <ArrowRight size={18} strokeWidth={2.5} />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Faster Delivery Modal ========== */}
      <AnimatePresence>
        {showFasterDeliveryModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFasterDeliveryModal(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <div className="flex flex-col gap-4">
                  <span className="weight-700 font-16">
                    How fast do you want it?
                  </span>
                  <span className="font-11 dark-50">
                    Tap an option, then continue. Both ship with tracking.
                  </span>
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowFasterDeliveryModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="ds-wrap">
                {/* Standard */}
                <button
                  type="button"
                  className={`ds-opt${deliverySel === "standard" ? " active" : ""}`}
                  onClick={() => setDeliverySel("standard")}
                >
                  <span className="ds-left">
                    <span className="ds-radio" />
                    <span className="ds-ic std">
                      <Clock size={20} />
                    </span>
                  </span>
                  <span className="ds-main">
                    <span className="ds-row">
                      <span className="ds-title">Standard Delivery</span>
                      {!isCartBelow399 && (
                        <span className="ds-price free">
                          {standardDeliveryCharge < 0
                            ? `₹${standardDeliveryCharge}`
                            : "FREE"}
                        </span>
                      )}
                    </span>
                    <span className="ds-sub">Arrives in 5–7 business days</span>
                    <span className="ds-tags">
                      <span className="ds-tag green">
                        <ShieldCheck size={12} /> Free tracking
                      </span>
                    </span>
                  </span>
                </button>

                {/* Faster */}
                <button
                  type="button"
                  className={`ds-opt${deliverySel === "faster" ? " active" : ""}`}
                  onClick={() => setDeliverySel("faster")}
                >
                  <span className="ds-flag">Fastest</span>
                  <span className="ds-left">
                    <span className="ds-radio" />
                    <span className="ds-ic fast">
                      <Zap size={20} />
                    </span>
                  </span>
                  <span className="ds-main">
                    <span className="ds-row">
                      <span className="ds-title">Faster Delivery</span>
                      <span className="ds-price add">
                        +₹{fasterDeliveryCharge}
                      </span>
                    </span>
                    <span className="ds-sub">Arrives in 2–5 business days</span>
                    <span className="ds-tags">
                      <span className="ds-tag orange">
                        <Truck size={12} /> Priority shipping
                      </span>
                      <span className="ds-tag green">
                        <ShieldCheck size={12} /> Real-time tracking
                      </span>
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  className="pri-big-btn width100 ds-continue"
                  onClick={
                    deliverySel === "faster"
                      ? handleProceedWithFasterDelivery
                      : handleProceedWithoutFasterDelivery
                  }
                >
                  {deliverySel === "faster"
                    ? `Continue with Faster · +₹${fasterDeliveryCharge}`
                    : isCartBelow399
                      ? "Continue with Standard"
                      : "Continue with Standard · FREE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== COD HANDLING FEE MODAL (NEW) ========== */}
      {/* ========== UPSELL: The Art of Clarity ========== */}
      <AnimatePresence>
        {showUpsell && artBook && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={declineUpsell}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal upsell-modal"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="upsell-badges">
                <span className="upsell-badge hot">
                  2,300+ readers added this
                </span>
                <span className="upsell-badge deal">₹40 OFF today</span>
              </div>

              {/* Book cover in focus, like the details page */}
              <div className="upsell-hero">
                {artBook.image && (
                  <img src={artBook.image} alt={artBook.name} />
                )}
              </div>

              <p className="upsell-kicker">Wait — one last thing </p>
              <h3 className="upsell-title">
                Add <em>“The Art of Clarity”</em> to your order?
              </h3>
              <p className="upsell-sub">
                The reader-favourite guide to thinking clearly and stopping
                overthinking — the perfect companion to your order.
              </p>

              <div className="upsell-divider" />

              <div className="upsell-price-block">
                <div className="upsell-price-row">
                  <span className="upsell-now">
                    ₹{Math.max(0, artBook.discountedPrice - 40)}
                  </span>
                  <span className="upsell-was">₹{artBook.discountedPrice}</span>
                  <span className="upsell-save">Save ₹40</span>
                </div>
                <span className="upsell-warn">
                  ⏳ Price rises 50% after you leave — add it now
                </span>
              </div>

              <div className="upsell-divider" />

              <div className="upsell-actions">
                <button
                  type="button"
                  className="pri-big-btn width100 upsell-yes"
                  onClick={acceptUpsell}
                >
                  Yes, let me read this as well
                </button>
                <button
                  type="button"
                  className="upsell-skip"
                  onClick={declineUpsell}
                >
                  Not now, continue to payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCODFeeModal && (
          <CODHandlingFeeModal
            codFee={codFeeAmount}
            upiTotal={upiTotalForFlow}
            codTotal={codTotalWithFee}
            onConfirmCOD={handleConfirmCODWithFee}
            onSwitchToUPI={handleSwitchToUPIFromCODFee}
            onClose={() => setShowCODFeeModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ========== COD SUCCESS MODAL ========== */}
      <AnimatePresence>
        {showCODSuccess && (
          <CODSuccessModal
            name={name}
            phone={phone}
            address={fullAddress}
            city={city}
            pincode={pincode}
            fasterDelivery={fasterDelivery}
            cartBooks={cartBooks}
            // ---- breakdown fields ----
            totalDiscounted={totalDiscounted}
            offerDiscount={offerDiscount}
            offerLabel={offerLabel}
            walletApplied={walletApplied}
            deliveryCharge={getDeliveryCharge(fasterDelivery)}
            fasterDeliveryCharge={getDeliveryCharge(true)}
            standardDeliveryCharge={getDeliveryCharge(false)}
            orderRefIn={placedOrderId}
            giftWrap={giftWrap || giftWrapSelected}
            giftWrapCharge={giftWrapCharge}
            bookmark={bookmark}
            bookmarkCharge={bookmarkChargeAmount}
            codFee={successPayment === "UPI" ? 0 : codFeeAmount}
            paymentMode={successPayment}
            paymentLabel={successPaymentLabel}
            quickReadCount={quickReadItems.length}
            quickReadTotal={qrAddOn}
            // ---- totals derived from above for convenience ----
            baseAmount={getTotalWithDelivery(fasterDelivery) + addOnsCharge}
            totalAmount={
              getTotalWithDelivery(fasterDelivery) +
              addOnsCharge +
              (successPayment === "UPI" ? 0 : codFeeAmount)
            }
            onContinue={
              successPayment === "UPI"
                ? handleUPISuccessContinue
                : handleCODSuccessContinue
            }
            onClose={() => setShowCODSuccess(false)}
            onViewProfile={goToProfile}
          />
        )}
      </AnimatePresence>

      {/* ========== Pay-online method chooser ========== */}
      <AnimatePresence>
        {showPayMethod && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPayMethod(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal paymeth-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  {payMethodStage === "giftcard" ? (
                    <>
                      <button
                        type="button"
                        className="paymeth-back"
                        onClick={() => setPayMethodStage("choose")}
                        aria-label="Back"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      {giftMethod}
                    </>
                  ) : (
                    "Choose how to pay"
                  )}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowPayMethod(false)}
                >
                  <X size={18} />
                </span>
              </div>

              {payMethodStage === "choose" ? (
                <div className="paymeth">
                  {/* Social-proof trust stripe */}
                  <div className="pay-trust">
                    <span className="pay-trust-faces" aria-hidden="true">
                      {[1, 2, 3].map((n) => (
                        <img
                          key={n}
                          src={`/review/promotions/member-${n}.jpeg`}
                          alt=""
                          className="pay-trust-face"
                          loading="lazy"
                        />
                      ))}
                    </span>
                    <span className="pay-trust-txt">
                      <strong>Most people</strong> opt for online mode —
                      you&apos;re in trusted company!
                    </span>
                  </div>

                  {/* UPI apps */}
                  <div className="paymeth-group">
                    <span className="paymeth-group-title">Pay via UPI</span>
                    <div className="paymeth-apps">
                      {[
                        { k: "Paytm", c: "#00baf2" },
                        { k: "PhonePe", c: "#5f259f" },
                        { k: "Google Pay", c: "#1a73e8" },
                        { k: "Other UPI apps", c: "#fb8500" },
                      ].map((app) => (
                        <button
                          key={app.k}
                          type="button"
                          className="paymeth-app"
                          onClick={() => chooseUpiApp(app.k)}
                        >
                          <span
                            className="paymeth-app-ic"
                            style={{ background: app.c }}
                          >
                            {app.k === "Other UPI apps" ? (
                              <Smartphone size={18} />
                            ) : (
                              app.k[0]
                            )}
                          </span>
                          <span className="paymeth-app-nm">{app.k}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cards & net banking → gift-card flow */}
                  <div className="paymeth-group">
                    <span className="paymeth-group-title">
                      Cards &amp; net banking
                    </span>
                    <div className="paymeth-cards">
                      {["Credit card", "Debit card", "Net banking"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="paymeth-row"
                          onClick={() => chooseGiftMethod(m)}
                        >
                          <CreditCard size={18} className="paymeth-row-ic" />
                          <span className="paymeth-row-nm">{m}</span>
                          <ChevronRight size={16} className="paymeth-row-chev" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amazon gift voucher */}
                  <button
                    type="button"
                    className="paymeth-amazon"
                    onClick={() => chooseGiftMethod("Amazon Gift Voucher")}
                  >
                    <span className="paymeth-amazon-ic">
                      <Gift size={18} />
                    </span>
                    <span className="paymeth-amazon-txt">
                      <strong>Amazon Gift Voucher</strong>
                      <small>Already have an Amazon gift card? Redeem it.</small>
                    </span>
                    <ChevronRight size={16} className="paymeth-row-chev" />
                  </button>
                </div>
              ) : (
                <div className="paymeth-gift">
                  <div className="paymeth-gift-note">
                    <Info size={16} />
                    <p>
                      To pay with <strong>{giftMethod}</strong>, buy an{" "}
                      <strong>
                        Amazon gift card worth ₹
                        {getTotalWithDelivery(fasterDelivery) + addOnsCharge}
                      </strong>{" "}
                      and paste the code below. We&apos;ll verify it and confirm
                      your order on WhatsApp.
                    </p>
                  </div>
                  <a
                    href="https://www.amazon.in/dp/B08DXJP4KG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paymeth-gift-buy"
                  >
                    Buy an Amazon gift card
                    <ArrowRight size={15} />
                  </a>
                  <label className="paymeth-gift-label">Gift card code</label>
                  <input
                    className="paymeth-gift-input"
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    placeholder="Paste your gift-card code here"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="pri-big-btn paymeth-gift-submit"
                    disabled={giftCode.trim().length < 4}
                    onClick={submitGiftCard}
                  >
                    Submit &amp; place order · ₹
                    {getTotalWithDelivery(fasterDelivery) + addOnsCharge}
                  </button>
                  <p className="paymeth-gift-fine">
                    Your books are reserved. We confirm once the gift card is
                    verified.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== UPI Payment Modal ========== */}
      <AnimatePresence>
        {showUPIPayment && (
          <UPIPaymentModal
            finalPayable={netPayable}
            walletApplied={walletApplied}
            fasterDelivery={fasterDelivery}
            fasterDeliveryCharge={fasterDeliveryCharge}
            standardDeliveryCharge={standardDeliveryCharge}
            giftWrap={giftWrap}
            giftWrapCharge={giftWrapCharge}
            quickReadCount={quickReadItems.length}
            quickReadTotal={qrAddOn}
            totalToPay={getTotalWithDelivery(fasterDelivery) + addOnsCharge}
            qrUnlocked={qrUnlocked}
            upiCopied={upiCopied}
            upiPhase={upiPhase}
            verifyCountdown={verifyCountdown}
            upiId={UPI_ID}
            onRevealQR={handleUPIPaymentClick}
            onCopyUpi={handleCopyUpiId}
            onDownloadQR={handleDownloadQR}
            onVerify={handleVerifyUPIPayment}
            onClose={() => {
              clearUpiTimers();
              setUpiPhase("await");
              setShowUPIPayment(false);
            }}
            onWhatsAppFallback={handleUPIWhatsAppVerify}
            onSwitchToCOD={switchToCODFromUPI}
            onCheckStatus={handleCheckUPIStatus}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// =====================================================================
// ============ Sub-component: CODHandlingFeeModal (NEW) ==============
// =====================================================================
// Shown AFTER the user has chosen delivery speed in the COD path.
// Discloses the ₹49 fee, shows a clear cost comparison, and offers
// a one-tap deflection to UPI with emotionally-charged copy.
//
// Slides in from the bottom (slidin pattern matching the rest of the app).
// =====================================================================

function CODHandlingFeeModal({
  codFee,
  upiTotal,
  codTotal,
  onConfirmCOD,
  onSwitchToUPI,
  onClose,
}) {
  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="bill-header">
          <span className="weight-600 font-16">Confirm Cash on Delivery</span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={16} />
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Fee disclosure hero, orange-tinted, bouncing wallet icon */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            animate-extra={{
              boxShadow: [
                "0 6px 20px rgba(251, 133, 0, 0.25)",
                "0 8px 26px rgba(251, 133, 0, 0.4)",
                "0 6px 20px rgba(251, 133, 0, 0.25)",
              ],
            }}
            style={{
              padding: "16px",
              background:
                "linear-gradient(135deg, var(--tertiary-10, #fb850010) 0%, var(--tertiary-light-10, #ffb70310) 100%)",
              border: "1px solid var(--tertiary, #fb8500)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div className="flex flex-row gap-12 items-start">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--tertiary, #fb8500)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={20} strokeWidth={2.4} />
              </motion.div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-14 weight-700">
                  ₹{codFee} COD handling fee will be added
                </div>
                <div
                  className="font-12 dark-50"
                  style={{ marginTop: 4, lineHeight: 1.45 }}
                >
                  Collected at the door, along with your order.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cost comparison, UPI on top (green), COD below (with +fee in orange) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            style={{
              padding: 14,
              background: "var(--dark-4)",
              border: "1px solid var(--dark-10)",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span
                  className="font-12 weight-600"
                  style={{ color: "var(--success, #008f0c)" }}
                >
                  Pay UPI now
                </span>
                <span className="font-10 dark-50">
                  Instant • No extra charges
                </span>
              </div>
              <span
                className="weight-700"
                style={{ fontSize: 18, color: "var(--success, #008f0c)" }}
              >
                ₹{upiTotal}
              </span>
            </div>

            <div style={{ borderTop: "1px dashed var(--dark-20)" }} />

            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span className="font-12 weight-600">Pay at delivery</span>
                <span className="font-10 orange" style={{ fontWeight: 600 }}>
                  Includes ₹{codFee} handling fee
                </span>
              </div>
              <span className="weight-700" style={{ fontSize: 18 }}>
                ₹{codTotal}
              </span>
            </div>
          </motion.div>

          {/* Two clear, equal-weight choices — the shopper picks the one
              they want. Each spells out exactly what it is + the amount. */}
          <div className="cod-choice-grid" style={{ marginTop: 2 }}>
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchToUPI}
              className="cod-choice cod-choice-upi"
            >
              <span className="cod-choice-badge">Save ₹{codFee}</span>
              <span className="cod-choice-ic">
                <Sparkles size={18} />
              </span>
              <span className="cod-choice-title">Pay now via UPI</span>
              <span className="cod-choice-amt">₹{upiTotal}</span>
              <span className="cod-choice-sub">Instant · no extra charge</span>
            </motion.button>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirmCOD}
              className="cod-choice cod-choice-cod"
            >
              <span className="cod-choice-ic cod-ic-neutral">
                <Wallet size={18} />
              </span>
              <span className="cod-choice-title">Cash on Delivery</span>
              <span className="cod-choice-amt">₹{codTotal}</span>
              <span className="cod-choice-sub">
                Pay at door · incl. ₹{codFee} fee
              </span>
            </motion.button>
          </div>

          <span
            className="font-10 dark-50"
            style={{ textAlign: "center", marginTop: 2 }}
          >
            UPI works with Google Pay, PhonePe, Paytm & BHIM
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// ============== Sub-component: CODSuccessModal =======================
// =====================================================================
export function CODSuccessModal({
  name,
  phone,
  address,
  city,
  pincode,
  fasterDelivery,
  totalAmount,
  baseAmount = 0,
  codFee = 0,
  // ---- itemised breakdown props ----
  totalDiscounted = 0,
  offerDiscount = 0,
  offerLabel = "",
  walletApplied = 0,
  deliveryCharge = 0,
  fasterDeliveryCharge = 0,
  standardDeliveryCharge = 0,
  giftWrap = false,
  giftWrapCharge = 0,
  quickReadCount = 0,
  quickReadTotal = 0,
  cartBooks,
  paymentMode = "COD",
  paymentLabel = "",
  // Whether the online payment is actually settled. Live UPI checkout = paid;
  // a shared invoice for an unconfirmed UPI order = unpaid.
  paid = true,
  // Optional "Pay here" action (shared invoice flow) — opens the pay chooser.
  onPayNow,
  onContinue,
  onClose,
  onViewProfile,
  // When false, hide the scratch-card reward (used for the shared invoice
  // opened via thebookx.in?orderID=…). Defaults to the full checkout flow.
  showReward = true,
  // Real order id / date to print on the receipt (falls back to a generated
  // ref for the live checkout flow).
  orderRefIn = "",
  dateIn = "",
  // Loading-screen copy (invoice view overrides the checkout wording).
  loadingTitle = "Placing your order…",
  loadingSub = "Just a moment, confirming your details",
  // Replay the print haptic on first tap — needed for the shared-invoice flow
  // where there's no prior user gesture (browsers block auto-vibration).
  hapticOnTap = false,
}) {
  const isUPI = paymentMode === "UPI";
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsProcessing(false);
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  // Haptic buzz while the receipt "prints" (gentle pulses for ~3.4s, then stop).
  useEffect(() => {
    if (isProcessing) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const pattern = [];
      for (let i = 0; i < 34; i++) pattern.push(16, 84);
      navigator.vibrate(pattern);
    }
    return () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(0);
      }
    };
  }, [isProcessing]);

  // Shared-invoice flow (opened via a link) has no prior user gesture, so the
  // auto-vibration above is blocked by the browser. Replay the same print buzz
  // on the customer's first tap once the receipt has started printing.
  useEffect(() => {
    if (isProcessing || !hapticOnTap) return;
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    const buzz = () => {
      const pattern = [];
      for (let i = 0; i < 34; i++) pattern.push(16, 84);
      navigator.vibrate(pattern);
      window.removeEventListener("pointerdown", buzz);
    };
    window.addEventListener("pointerdown", buzz, { once: true });
    return () => window.removeEventListener("pointerdown", buzz);
  }, [isProcessing, hapticOnTap]);

  // Scratch-card reward — amount depends on order value (see orderWalletReward).
  const rewardRef = useRef(orderWalletReward(totalAmount));
  const reward = rewardRef.current;
  const [scratchOpen, setScratchOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [walletCredited, setWalletCredited] = useState(false);
  const handleScratchComplete = async () => {
    if (scratched) return;
    setScratched(true);
    // Wallet lives in its own sheet now: record the scratch reward as a Credit
    // transaction tagged with the order id (so it can be reversed if the order
    // is deleted). The wallet DEBIT (if any) was already written at checkout.
    const res = await creditWalletReward(phone, reward, orderRef);
    if (res?.success) setWalletCredited(true);
  };

  // ── Redesigned success view state ──
  // localFaster reflects an in-modal upgrade to faster delivery.
  const [localFaster, setLocalFaster] = useState(fasterDelivery);
  const [localDeliveryCharge, setLocalDeliveryCharge] = useState(deliveryCharge);
  const [localTotal, setLocalTotal] = useState(totalAmount);
  const [showInvoice, setShowInvoice] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showFasterConfirm, setShowFasterConfirm] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const rcptRef = useRef(null);

  // Delivery windows: Faster = 1–5 days, Standard = 4–12 days.
  const winStart = localFaster ? 1 : 4;
  const winEnd = localFaster ? 5 : 12;
  const deliveryWindow = `${winStart}-${winEnd} business days`;

  // Estimated arrival date (end of the delivery window).
  const deliveryByDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + winEnd);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  })();

  // Estimated delivery RANGE, e.g. "10 – 12 Aug" (or across months).
  const deliveryRange = (() => {
    const start = new Date();
    start.setDate(start.getDate() + winStart);
    const end = new Date();
    end.setDate(end.getDate() + winEnd);
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = start.toLocaleDateString("en-IN", {
      day: "numeric",
      ...(sameMonth ? {} : { month: "short" }),
    });
    const endStr = end.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `${startStr} – ${endStr}`;
  })();

  // Faster (1–5 day) arrival range, used in the upgrade-confirm modal.
  const fasterRangeStr = (() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const sameMonth = start.getMonth() === end.getMonth();
    const s = start.toLocaleDateString("en-IN", {
      day: "numeric",
      ...(sameMonth ? {} : { month: "short" }),
    });
    const e = end.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `${s} – ${e}`;
  })();

  // Stable display order ref + date for the printed receipt. When opened from
  // a shared invoice link we print the real order id/date instead.
  const generatedRef = useRef("TBX" + String(Date.now()).slice(-8)).current;
  const orderRef = orderRefIn || generatedRef;
  // Note/upgrade writes need the REAL sheet order id (passed as orderRefIn).
  const canEditOrder = !!orderRefIn;
  const todayStr =
    dateIn ||
    new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const firstName = String(name || "").trim().split(/\s+/)[0] || "there";
  const itemCount = (cartBooks || []).reduce((s, b) => s + (b.qty || 1), 0);
  const fasterDelta = Math.max(
    0,
    (fasterDeliveryCharge || 0) - (standardDeliveryCharge || 0),
  );
  const upgradedTotal = totalAmount + fasterDelta;

  // Save the optional customer note to the order's "Order Comment" column.
  const saveNote = async () => {
    const t = note.trim();
    if (!t || !canEditOrder) return;
    setNoteSaving(true);
    try {
      await updateOrderRow(orderRef, { "Order Comment": t });
      setNoteSaved(true);
    } catch (e) {
      console.error("Note save failed:", e);
    } finally {
      setNoteSaving(false);
    }
  };

  // Confirm the faster-delivery upgrade: flip Delivery Type + charge on the row.
  const confirmFasterUpgrade = async () => {
    if (!canEditOrder) return;
    setUpgrading(true);
    try {
      await updateOrderRow(orderRef, {
        "Delivery Type": "Faster",
        "Delivery Charge": String(fasterDeliveryCharge || 0),
        "Total Amount": String(upgradedTotal),
      });
      setLocalFaster(true);
      setLocalDeliveryCharge(fasterDeliveryCharge || 0);
      setLocalTotal(upgradedTotal);
      setUpgraded(true);
      setShowFasterConfirm(false);
    } catch (e) {
      console.error("Faster upgrade failed:", e);
    } finally {
      setUpgrading(false);
    }
  };

  // Download the invoice as a PNG (lazy-loads html2canvas from CDN on demand).
  const downloadInvoice = async () => {
    const el = rcptRef.current;
    if (!el || downloading) return;
    setDownloading(true);
    try {
      if (typeof window !== "undefined" && !window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res;
          s.onerror = rej;
          document.body.appendChild(s);
        });
      }
      const canvas = await window.html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `TheBookX_invoice_${orderRef}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Invoice download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareOrder = () => {
    const itemsList = (cartBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.qty}`)
      .join("\n");
    const msg = ` My TheBookX order is confirmed!\n\n Delivery by ${deliveryByDate}\n ${name}, ${address}, ${city} - ${pincode}\n\nItems:\n${itemsList}\n\nTotal: ₹${totalAmount}\n\nShop books from ₹1 https://thebookx.in`;
    if (navigator.share) {
      navigator
        .share({ title: "My TheBookX order", text: msg })
        .catch(() => {});
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleNeedHelp = () => {
    const itemsList = cartBooks
      .map(
        (b, i) =>
          `${i + 1}. ${b.name} × ${b.qty} = ₹${b.discountedPrice * b.qty}`,
      )
      .join("\n");
    const msg = `Hi TheBookX \n\nI just placed a COD order and need help:\n\n Name: ${name}\n Phone: ${phone}\n Address: ${address}, ${city} - ${pincode}\n Delivery: ${fasterDelivery ? "Faster" : "Standard"}\n\nItems:\n${itemsList}\n\nTotal: ₹${totalAmount}`;
    window.open(
      `https://wa.me/917710892108?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleOverlayClick = () => {
    if (isProcessing) return;
    onClose();
  };

  return (
    <motion.div
      className="bill-modal-overlay cod-success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleOverlayClick}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal cod-success-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "48px 20px",
                textAlign: "center",
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.4, 0.15, 0.4],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, var(--tertiary, #fb8500) 0%, transparent 70%)",
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    color: "var(--tertiary, #fb8500)",
                    display: "flex",
                  }}
                >
                  <Loader2 size={48} strokeWidth={2.5} />
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="weight-700"
                style={{ fontSize: 18, margin: "8px 0 4px" }}
              >
                {loadingTitle}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-12 dark-50"
                style={{ margin: 0 }}
              >
                {loadingSub}
              </motion.p>

              <div className="flex flex-row gap-6" style={{ marginTop: 12 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--tertiary, #fb8500)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="cod-success-body"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="cod-success-scroll">
                {/* Celebration confetti burst */}
                <div className="ok-confetti" aria-hidden="true">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span
                      key={i}
                      className="ok-confetti-p"
                      style={{
                        left: `${(i * 4.6) % 100}%`,
                        background: [
                          "#fb8500",
                          "#16a34a",
                          "#e5638a",
                          "#e6a83c",
                          "#c0223b",
                        ][i % 5],
                        animationDelay: `${(i % 7) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                {/* ── Thank-you + summary (shown first) ── */}
                <div className="ok-summary">
                  <div className="ok-thanks">
                    <span className="ok-thanks-ic">
                      <CheckCircle2 size={26} strokeWidth={2.4} />
                    </span>
                    <strong>Thank you, {firstName}!</strong>
                    <span className="ok-thanks-sub">
                      {isUPI && paid
                        ? "Your payment is received and your order is confirmed."
                        : "Your order is confirmed."}
                    </span>
                  </div>

                  {/* Scratch reward — 3 fanned pop-up cards, right below thanks */}
                  {showReward && (
                    <button
                      type="button"
                      className={`ok-scratch3${walletCredited ? " done" : ""}`}
                      onClick={() => setScratchOpen(true)}
                    >
                      <span className="ok-sc3-stage">
                        <span className="ok-sc3 a">
                          <Gift size={15} />
                        </span>
                        <span className="ok-sc3 b">₹</span>
                        <span className="ok-sc3 c">
                          <Sparkles size={15} />
                        </span>
                      </span>
                      <span className="ok-sc3-cap">
                        {walletCredited
                          ? `₹${reward} added to your wallet`
                          : "You've won a scratch card! Tap to scratch"}
                      </span>
                    </button>
                  )}

                  {/* Timeline — truck moving on a dashed line + arrival + upgrade */}
                  <div className="ok-eta">
                    <div className="ok-tl" aria-hidden="true">
                      <span className="ok-tl-dot" />
                      <span className="ok-tl-track" />
                      <span
                        className={`ok-tl-truck${localFaster ? " air" : " rail"}`}
                      >
                        <span className="ok-tl-veh">
                          {localFaster ? "✈️" : "🚆"}
                        </span>
                      </span>
                      <span className="ok-tl-dot end">
                        <MapPin size={13} />
                      </span>
                    </div>

                    {/* Arrival → deliver-to card → be-present note + CTA */}
                    <div className="ok-deliver">
                      {/* Arriving header + faster-delivery upgrade — grouped in
                          one card for a single, consistent delivery block. */}
                      <div className="ok-eta-group">
                        <strong className="ok-eta-title">
                          Arriving {deliveryRange}
                        </strong>

                        <div className="ok-eta-meta">
                          <span className="ok-eta-sub">{deliveryWindow}</span>
                          <span className="ok-eta-mdot">·</span>
                          <span
                            className={`ok-badge${localFaster ? " fast" : ""}`}
                          >
                            {localFaster
                              ? "Faster delivery"
                              : "Standard delivery"}
                          </span>
                        </div>

                        {!localFaster && canEditOrder && fasterDelta > 0 && (
                          <div className="ok-upgrade">
                            <span className="ok-upgrade-txt">
                              <Zap size={13} /> Faster by{" "}
                              <b>{fasterRangeStr}</b> · 1–5 days
                            </span>
                            <button
                              type="button"
                              className="ok-upgrade-btn"
                              onClick={confirmFasterUpgrade}
                              disabled={upgrading}
                            >
                              {upgrading ? "…" : `Upgrade · +₹${fasterDelta}`}
                            </button>
                          </div>
                        )}
                        {upgraded && (
                          <div className="ok-upgraded">
                            <CheckCircle2 size={14} /> Upgraded to Faster
                            delivery.
                          </div>
                        )}

                        {/* Be-present note — inside the arriving card, icon +
                            heading + description with an inline reschedule link. */}
                        <div className="ok-present">
                          <Info size={15} />
                          <span className="ok-present-body">
                            <strong>Be available on {deliveryRange}</strong>
                            <span className="ok-present-desc">
                              Please be at this address to receive your order.
                              Not available then?{" "}
                              <button
                                type="button"
                                className="ok-present-link"
                                onClick={() => {
                                  const msg = `Hi TheBookX, I need a different delivery date for my order.${
                                    orderRef ? `\n\nOrder ID: ${orderRef}` : ""
                                  }\nName: ${name || ""}\nPhone: +91 ${phone || ""}\nCurrent window: ${deliveryRange}`;
                                  window.open(
                                    `https://wa.me/917710892108?text=${encodeURIComponent(msg)}`,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                }}
                              >
                                change the date
                              </button>
                              .
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Deliver-to — name + address with icons, in a rounded
                          bordered card consistent with the rest of the sheet. */}
                      <div className="ok-deliver-card">
                        <div className="ok-deliver-row">
                          <span className="ok-deliver-ic">
                            <User size={15} />
                          </span>
                          <span className="ok-deliver-val">{name}</span>
                        </div>
                        <div className="ok-deliver-row">
                          <span className="ok-deliver-ic">
                            <Home size={15} />
                          </span>
                          <span className="ok-deliver-val">
                            {String(address || "")
                              .replace(
                                /,?\s*Pinned location:\s*https?:\/\/\S+/i,
                                "",
                              )
                              .trim()}
                            {city ? `, ${city}` : ""}
                            {pincode ? ` - ${pincode}` : ""}
                            {" · +91 "}
                            {phone}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation / confirmation notice (payment-aware) */}
                      <div className="ok-cancel-note">
                        <span className="ok-cancel-title">
                          <Info size={14} /> Good to know
                        </span>
                        <ul className="ok-cancel-list">
                          <li>This order can&apos;t be cancelled once placed.</li>
                          {paymentMode === "COD" && (
                            <li>
                              You may get a call or WhatsApp to confirm your
                              order — please stay responsive so it isn&apos;t
                              delayed.
                            </li>
                          )}
                        </ul>
                        <a
                          href="/terms#cancellation-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ok-cancel-link"
                        >
                          View cancellation policy →
                        </a>
                      </div>

                    </div>
                  </div>

                  <div className="ok-hr" />

                  <div className="ok-books">
                    <div className="ok-covers">
                      {(cartBooks || []).slice(0, 4).map((b, i) => (
                        <span className="ok-cover" key={i}>
                          {b.image ? (
                            <Image
                              src={b.image}
                              alt={b.name || "book"}
                              width={34}
                              height={46}
                            />
                          ) : (
                            <Package size={16} />
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="ok-books-count">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                    <span className="ok-total">
                      <span className="ok-total-lbl">
                        {isUPI && paid ? "Paid" : "Total"}
                      </span>
                      <b>₹{localTotal}</b>
                    </span>
                  </div>
                </div>

                {/* ── Order note ── */}
                {canEditOrder && <div className="ok-hr" />}
                {canEditOrder && (
                  <div className="ok-note">
                    <label className="ok-note-lbl">
                      Add a note for this order
                      <span className="ok-note-opt"> (optional)</span>
                    </label>
                    {noteSaved ? (
                      <div className="ok-note-saved">
                        <Check size={14} /> Note added to your order.
                      </div>
                    ) : (
                      <div className="ok-note-row">
                        <input
                          className="ok-note-input"
                          placeholder="e.g. Call before delivery…"
                          maxLength={160}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && note.trim() && saveNote()
                          }
                        />
                        <button
                          type="button"
                          className="ok-note-add"
                          onClick={saveNote}
                          disabled={!note.trim() || noteSaving}
                        >
                          {noteSaving ? "…" : "Add"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Download invoice — secondary outlined; opens the printer
                    modal where the receipt prints and can be saved ── */}
                <button
                  type="button"
                  className="sec-big-btn width100 ok-invoice-dlbtn"
                  onClick={() => setShowInvoice(true)}
                >
                  <Download size={16} /> Download invoice
                </button>

                {showInvoice && (
                  <div
                    className="ok-sheet-overlay"
                    onClick={() => setShowInvoice(false)}
                  >
                    <div
                      className="ok-sheet"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="ok-sheet-hd">
                        <span className="ok-sheet-title">
                          <Info size={16} /> Your invoice
                        </span>
                        <button
                          type="button"
                          className="ok-sheet-x"
                          onClick={() => setShowInvoice(false)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="ok-sheet-body">
                        {/* Printed receipt — slides out of the printer slot */}
                        <div className="rcpt-stage">
                          <div className="rcpt-printer" aria-hidden="true">
                            <span className="rcpt-lip" />
                          </div>
                      <motion.div
                        ref={rcptRef}
                        className="rcpt"
                        initial={{ y: "-109%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 3.4, ease: "linear", delay: 0.2 }}
                      >
                    <div className="rcpt-head">
                      <span className="rcpt-brand">TheBookX</span>
                      <span className="rcpt-status">
                        <CheckCircle2 size={13} strokeWidth={3} /> ORDER
                        CONFIRMED
                      </span>
                      <span className="rcpt-thanks">
                        Thank you for your order!
                      </span>
                    </div>

                    <div className="rcpt-dash" />

                    <div className="rcpt-line">
                      <span>Order</span>
                      <b>{orderRef}</b>
                    </div>
                    <div className="rcpt-line">
                      <span>Date</span>
                      <span>{todayStr}</span>
                    </div>
                    <div className="rcpt-line">
                      <span>Payment</span>
                      <span>
                        {paymentLabel
                          ? paymentLabel
                          : isUPI
                            ? paid
                              ? "UPI · Paid"
                              : "UPI · Unpaid"
                            : "Cash on Delivery"}
                      </span>
                    </div>

                    <div className="rcpt-dash" />

                    <div className="rcpt-items">
                      {cartBooks?.map((b, i) => (
                        <div className="rcpt-item" key={i}>
                          <span className="rcpt-item-nm">
                            {i + 1}. {b.name}
                          </span>
                          <span className="rcpt-item-q">
                            {b.qty} × ₹{b.discountedPrice}
                          </span>
                          <span className="rcpt-item-amt">
                            ₹{b.discountedPrice * b.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rcpt-dash" />

                    <div className="rcpt-line">
                      <span>Subtotal</span>
                      <span>₹{totalDiscounted}</span>
                    </div>
                    {offerDiscount > 0 && (
                      <div className="rcpt-line green">
                        <span>Offer{offerLabel ? ` (${offerLabel})` : ""}</span>
                        <span>-₹{offerDiscount}</span>
                      </div>
                    )}
                    {walletApplied > 0 && (
                      <div className="rcpt-line green">
                        <span>Wallet</span>
                        <span>-₹{walletApplied}</span>
                      </div>
                    )}
                    <div className="rcpt-line">
                      <span>
                        {fasterDelivery
                          ? "Faster delivery"
                          : "Standard delivery"}
                      </span>
                      <span>
                        {deliveryCharge > 0 ? `+₹${deliveryCharge}` : "FREE"}
                      </span>
                    </div>
                    {giftWrap && giftWrapCharge > 0 && (
                      <div className="rcpt-line">
                        <span>Gift wrap</span>
                        <span>+₹{giftWrapCharge}</span>
                      </div>
                    )}
                    {quickReadTotal > 0 && (
                      <div className="rcpt-line">
                        <span>QuickReads ({quickReadCount})</span>
                        <span>+₹{quickReadTotal}</span>
                      </div>
                    )}
                    {codFee > 0 && (
                      <div className="rcpt-line">
                        <span>COD handling fee</span>
                        <span>+₹{codFee}</span>
                      </div>
                    )}

                    <div className="rcpt-dash bold" />
                    <div className="rcpt-total">
                      <span>{isUPI && paid ? "PAID" : "TO PAY"}</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="rcpt-dash" />

                    <div className="rcpt-block">
                      <span className="rcpt-block-lbl">DELIVER TO</span>
                      <span className="rcpt-block-v">{name}</span>
                      <span className="rcpt-block-s">
                        {address}, {city} - {pincode}
                      </span>
                      <span className="rcpt-block-s">+91 {phone}</span>
                    </div>

                    <div className="rcpt-eta-line">
                      {fasterDelivery ? <Zap size={12} /> : <Truck size={12} />}
                      Est. delivery {deliveryRange} · {deliveryWindow}
                    </div>

                    <div className="rcpt-barcode" aria-hidden="true" />
                    <span className="rcpt-barcode-no">* {orderRef} *</span>

                    <Link href="/profile" className="rcpt-track">
                      Track &amp; manage order
                    </Link>
                        </motion.div>
                        </div>
                        <button
                          type="button"
                          className="pri-big-btn width100 ok-sheet-dl"
                          onClick={downloadInvoice}
                          disabled={downloading}
                        >
                          <Download size={15} />{" "}
                          {downloading ? "Preparing…" : "Download invoice"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showReward && (
                  <ScratchRewardSheet
                    open={scratchOpen}
                    onClose={() => setScratchOpen(false)}
                    onViewProfile={onViewProfile}
                    eligible
                    reward={reward}
                    scratched={scratched}
                    onScratch={handleScratchComplete}
                    note={
                      <>
                        <strong>
                          ₹{reward} is applicable only on your next order.
                        </strong>{" "}
                        If you cancel this order, this wallet amount will be
                        wiped off — so please keep your order to enjoy the
                        reward.
                      </>
                    }
                  />
                )}
              </div>
              {/* Fixed footer — two actions in one row (scratch is up top now) */}
              <div className="cod-success-footer">
                {/* Pay here — shown on a shared invoice for an unpaid order */}
                {onPayNow && !(isUPI && paid) && (
                  <button
                    type="button"
                    className="pri-big-btn cod-pay-here"
                    onClick={onPayNow}
                  >
                    Pay here · ₹{totalAmount}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                )}

                <div className="cod-success-actions">
                  {onViewProfile && (
                    <button
                      className="pri-big-btn flex flex-row items-center justify-center gap-6"
                      onClick={onViewProfile}
                    >
                      <User size={15} />
                      Go to profile
                    </button>
                  )}
                  <button
                    className="sec-big-btn flex flex-row items-center justify-center gap-6"
                    onClick={handleNeedHelp}
                  >
                    <Headphones size={14} />
                    Need help
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// ============== Sub-component: UPIPaymentModal =======================
// =====================================================================
function UPIPaymentModal({
  finalPayable,
  fasterDelivery,
  fasterDeliveryCharge,
  standardDeliveryCharge,
  giftWrap,
  giftWrapCharge,
  quickReadCount = 0,
  quickReadTotal = 0,
  totalToPay,
  qrUnlocked,
  upiCopied,
  upiPhase = "await",
  verifyCountdown = 30,
  upiId,
  onRevealQR,
  onCopyUpi,
  onDownloadQR,
  onVerify,
  onClose,
  onWhatsAppFallback,
  onSwitchToCOD,
  onCheckStatus,
}) {
  return (
    <motion.div
      className="bill-modal-overlay upiv3-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal upiv3-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16">Pay with UPI</span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={16} />
          </span>
        </div>

        <div className="upiv3 upiv3-scroll">
          {/* Payee (merchant) card */}
          <div className="upiv3-payee">
            <span className="upiv3-payee-logo">TB</span>
            <div className="upiv3-payee-info">
              <span className="upiv3-payee-name">TheBookX</span>
              <span className="upiv3-payee-upi">{upiId}</span>
            </div>
            <span className="upiv3-verified">
              <ShieldCheck size={11} /> Verified
            </span>
          </div>

          {/* QR shows immediately; a 2s loader blurs it while it "generates" */}
          <motion.div
            className="upiv3-qr"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* QR card */}
            <div className="upiv3-qr-card">
              <div className="upiv3-qr-top">
                <div className="upiv3-qr-top-l">
                  <span className="upiv3-qr-payee-lbl">Paying to</span>
                  <span className="upiv3-qr-payee">TheBookX</span>
                </div>
                <span className="upiv3-qr-amt">₹{totalToPay}</span>
              </div>

              <div
                className={`upiv3-qr-img${qrUnlocked ? " ready" : " loading"}`}
              >
                <Image
                  src="/books/uskillbook.png"
                  alt="UPI QR Code"
                  width={300}
                  height={360}
                />
                {!qrUnlocked && (
                  <div className="upiv3-qr-loader">
                    <span className="upiv3-spin lg" />
                    <span>Generating secure QR…</span>
                  </div>
                )}
              </div>

              <span className="upiv3-qr-scan">
                {qrUnlocked
                  ? "Scan with any UPI app to pay"
                  : "Hang tight — preparing your QR"}
              </span>
            </div>
          </motion.div>

          {/* Trust footer */}
          <div className="upiv3-trust">
            <span>
              <ShieldCheck size={13} /> 256-bit encrypted
            </span>
            <span>
              <Package size={13} /> Tracked end-to-end
            </span>
          </div>
        </div>

        {/* Fixed footer — UPI id / Save QR + verify actions + COD link */}
        <div className="upiv3-footer">
          <div className="upiv3-id-row">
            <button type="button" className="upiv3-link" onClick={onCopyUpi}>
              {upiCopied ? <Check size={14} /> : <Copy size={14} />}
              {upiCopied ? "Copied!" : "Copy UPI ID"}
            </button>
            <span className="upiv3-link-sep">|</span>
            <button
              type="button"
              className="upiv3-link"
              onClick={onDownloadQR}
              disabled={!qrUnlocked}
            >
              <Download size={14} /> Save QR
            </button>
          </div>

          <div className="upiv3-actions-row">
            {upiPhase === "timeout" ? (
              <button
                type="button"
                className="sec-big-btn flex flex-row items-center justify-center gap-6"
                onClick={onCheckStatus}
              >
                <RefreshCw size={15} /> Check again
              </button>
            ) : (
              <span className="sec-big-btn is-loading flex flex-row items-center justify-center gap-6">
                <span className="upiv3-spin dark" /> Verifying…{" "}
                {verifyCountdown}s
              </span>
            )}
            <button
              type="button"
              className="sec-big-btn flex flex-row items-center justify-center gap-6"
              onClick={onWhatsAppFallback}
            >
              <FaWhatsapp size={16} color="#25D366" /> Verify on WhatsApp
            </button>
          </div>

          {onSwitchToCOD && (
            <button
              type="button"
              className="upiv3-cod-link"
              onClick={onSwitchToCOD}
            >
              Can't pay online? Continue with Cash on Delivery
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
