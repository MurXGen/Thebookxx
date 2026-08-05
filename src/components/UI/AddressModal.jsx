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
  ArrowRight,
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
// order. Balance is read from the "Wallet" column of the orders sheet by phone.
const WALLET_SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
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
  const [paySel, setPaySel] = useState(null);
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
  const [successPayment, setSuccessPayment] = useState("COD");
  const [showCODFeeModal, setShowCODFeeModal] = useState(false); // NEW
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);
  // UPI confirmation flow:
  //  "await"     — QR revealed, waiting for the shopper to tap Verify
  //  "verifying" — 30s auto-check, polling the sheet every 10s
  //  "timeout"   — no confirmation in 30s; offer a WhatsApp verify fallback
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
      const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
      const res = await fetch(url);
      const text = await res.text();
      const data = JSON.parse(text.substring(47, text.length - 2));
      const headers = data.table.cols.map((c) => c.label);
      let bal = 0;
      data.table.rows.forEach((row) => {
        const o = {};
        row.c.forEach((cell, i) => {
          let v = cell?.v;
          if (v && typeof v === "object" && v.value !== undefined) v = v.value;
          o[headers[i]] = v;
        });
        const rowPhone = String(o["Phone Number"] ?? "").replace(/\D/g, "");
        if (rowPhone.slice(-10) === digits.slice(-10)) {
          const w = parseFloat(o["Wallet"] ?? o["wallet"] ?? 0);
          // Sum the ledger: rewards positive, wallet spent on orders negative.
          if (!isNaN(w)) bal += w;
        }
      });
      bal = Math.max(0, Math.round(bal));
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
      const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
      const res = await fetch(url);
      const text = await res.text();
      const data = JSON.parse(text.substring(47, text.length - 2));
      const headers = data.table.cols.map((c) => c.label);
      const matches = [];
      data.table.rows.forEach((row) => {
        const o = {};
        row.c.forEach((cell, i) => {
          let v = cell?.v;
          if (v && typeof v === "object" && v.value !== undefined) v = v.value;
          o[headers[i]] = v;
        });
        const rowPhone = String(o["Phone Number"] ?? "").replace(/\D/g, "");
        if (rowPhone.slice(-10) === digits.slice(-10)) matches.push(o);
      });
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
      put(setAddress, addr);
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
  //   ₹151–300  → up to ₹15
  //   ₹300–500  → up to ₹30
  //   > ₹500    → full available balance
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
  const walletApplied = walletEnabled && walletBalance > 0 ? maxWalletUsable : 0;
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
  // for 30s to see if the admin removed the "(unconfirmed)" tag. Confirmed →
  // success screen; otherwise → timeout (WhatsApp fallback offered).
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
      setAddress(saved.address || "");
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
  ) => {
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
      const ref = `TBX${Date.now()}`;
      setUpiOrderRef(ref);
      setUpiPhase("await");
      setQrUnlocked(false);
      submitToGoogleForm("UPI", isFaster, false, ref);
      setShowUPIPayment(true);
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
    submitToGoogleForm("WhatsApp", fasterDelivery, false);
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

  // Payment confirmed (admin removed the "(unconfirmed)" tag) → success screen.
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
      netPayable + getDeliveryCharge(fasterDelivery) + (giftWrap ? giftWrapCharge : 0);

    // Merchant confirm link → /{orderId}?w=<walletUsed>
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://thebookx.in";
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
      "Hi TheBookX 👋",
      "",
      "I've *paid via UPI* but my order is still showing as verifying. Please confirm it.",
      "",
      `🧾 *Order Ref:* ${upiOrderRef || "-"}`,
      `👤 *Name:* ${name}`,
      `📞 *Phone:* ${phone}`,
      `📍 *Address:* ${fullAddress}, ${city} - ${pincode}`,
      bookLines ? "" : "",
      bookLines ? `📚 *Items:*\n${bookLines}` : "",
      "",
      `💰 *Amount paid:* ₹${amountPaid}`,
      walletApplied > 0 ? `👛 *Wallet used:* ₹${walletApplied}` : "",
      "",
      "———",
      "🔐 *Merchant only* — confirm this order:",
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

  // From the UPI page: shopper has no online-payment option → switch to COD
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
  const fullAddress = [flatNo, building, landmark, address]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");

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
  const isFormValid = () =>
    Boolean(name && phone.length === 10 && isAddressValid());

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

              <div className="input-group">
                <label>
                  Flat · Street · Landmark <span className="red">*</span>
                </label>
                <textarea
                  className="sec-mid-btn textarea"
                  placeholder="Flat / house no, street, area & a nearby landmark…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>

              <AnimatePresence>
                {showContactFields && (
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

              {/* ===== Add-ons: shown only once the name is filled ===== */}
              {name.trim() && (
              <div className="deliv-addon">
                <span className="deliv-addon-head">Add-ons</span>
                <div className="deliv-addon-row">
                  <div className="deliv-addon-l">
                    <Truck
                      size={18}
                      className={standardDeliveryCharge > 0 ? "" : "green"}
                    />
                    <div className="flex flex-col">
                      <span className="deliv-addon-t flex flex-row items-center gap-6">
                        {standardDeliveryCharge > 0
                          ? "Standard delivery"
                          : "Free delivery"}
                        {standardDeliveryCharge > 0 && (
                          <span className="deliv-free-badge">
                            FREE above ₹199
                          </span>
                        )}
                      </span>
                      <span className="deliv-addon-s">
                        {standardDeliveryCharge > 0
                          ? "Reaches you in 3–9 days"
                          : "Reaches you in 3–9 days · included at no charge"}
                      </span>
                    </div>
                  </div>
                  {standardDeliveryCharge > 0 ? (
                    <span className="deliv-addon-price">
                      +₹{standardDeliveryCharge}
                    </span>
                  ) : (
                    <span className="deliv-addon-free">FREE</span>
                  )}
                </div>

                {fasterUnavailable ? (
                  <div className="deliv-addon-row deliv-addon-opt">
                    <div className="deliv-addon-l">
                      <Truck size={18} className="dark-50" />
                      <div className="flex flex-col">
                        <span className="deliv-addon-t">Faster delivery</span>
                        <span className="deliv-addon-s">
                          Not available for this order weight
                        </span>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/917710892108?text=Hi%20TheBookX%2C%20I%27d%20like%20faster%20delivery%20for%20my%20heavy%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="deliv-addon-link"
                    >
                      Contact support →
                    </a>
                  </div>
                ) : (
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
                )}

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
                  <span className="deliv-addon-price">+₹{giftWrapCharge}</span>
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
              {!isAddressValid() && (
                <div className="addr-warn addr-warn-orange">
                  <AlertCircle size={13} />
                  <span>Fill your city and full address to proceed</span>
                </div>
              )}

              {showContactFields && (!name.trim() || phone.length !== 10) && (
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

              {showContactFields && (
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
                <span className="weight-600 font-16">Choose payment method</span>
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
                        <span className="ps-books-total">₹{totalDiscounted}</span>
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
                      {fasterDelivery ? (
                        <Zap size={12} />
                      ) : (
                        <Truck size={12} />
                      )}
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

                {/* Two payment choices — tap to select (default COD) */}
                <div className="cod-choice-grid">
                  <button
                    type="button"
                    onClick={() => setPaySel("UPI")}
                    className={`cod-choice cod-choice-upi${paySel === "UPI" ? " selected" : ""}`}
                  >
                    <span className="cod-choice-badge">
                      Save ₹{codFeeAmount}
                    </span>
                    <span className="cod-choice-ic">
                      <Sparkles size={18} />
                    </span>
                    <span className="cod-choice-title">Pay now via UPI</span>
                    <span className="cod-choice-amt">₹{upiTotalForFlow}</span>
                    <span className="cod-choice-sub">
                      Instant · no extra charge
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaySel("COD")}
                    className={`cod-choice cod-choice-cod${paySel === "COD" ? " selected" : ""}`}
                  >
                    <span className="cod-choice-ic cod-ic-neutral">
                      <Wallet size={18} />
                    </span>
                    <span className="cod-choice-title">Cash on Delivery</span>
                    <span className="cod-choice-amt">₹{codTotalWithFee}</span>
                    <span className="cod-choice-sub">
                      Pay at door · incl. ₹{codFeeAmount} fee
                    </span>
                  </button>
                </div>

              </div>

              {/* Fixed footer — pay button (full width) + WhatsApp order */}
              <div className="pay-sel-footer">
                <div className="pay-sel-footer-row">
                  <button
                    type="button"
                    className="pri-big-btn pay-confirm-btn"
                    disabled={!paySel}
                    onClick={() => paySel && beginPayment(paySel)}
                  >
                    <span className="flex flex-row items-center justify-center gap-6">
                      {paySel === "UPI"
                        ? `Pay & save ₹${codFeeAmount}`
                        : paySel === "COD"
                          ? "Cash on Delivery"
                          : "Select a payment method"}
                      {paySel && <ArrowRight size={18} strokeWidth={2.5} />}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="sec-big-btn pay-sel-wa"
                    onClick={() => beginPayment("WhatsApp")}
                    aria-label="Order on WhatsApp"
                  >
                    <FaWhatsapp size={18} color="#25D366" />
                    <span>Order</span>
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
                  🔥 2,300+ readers added this
                </span>
                <span className="upsell-badge deal">₹40 OFF today</span>
              </div>

              {/* Book cover in focus, like the details page */}
              <div className="upsell-hero">
                {artBook.image && (
                  <img src={artBook.image} alt={artBook.name} />
                )}
              </div>

              <p className="upsell-kicker">Wait — one last thing ✨</p>
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
                  Yes, let me read this as well →
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
            giftWrap={giftWrap || giftWrapSelected}
            giftWrapCharge={giftWrapCharge}
            bookmark={bookmark}
            bookmarkCharge={bookmarkChargeAmount}
            codFee={successPayment === "UPI" ? 0 : codFeeAmount}
            paymentMode={successPayment}
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
            onWhatsAppFallback={handleWhatsAppOrderClick}
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
function CODSuccessModal({
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
  giftWrap = false,
  giftWrapCharge = 0,
  quickReadCount = 0,
  quickReadTotal = 0,
  cartBooks,
  paymentMode = "COD",
  onContinue,
  onClose,
  onViewProfile,
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

  // Scratch-card reward — amount depends on order value (see orderWalletReward).
  const rewardRef = useRef(orderWalletReward(totalAmount));
  const reward = rewardRef.current;
  const [scratchOpen, setScratchOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [walletCredited, setWalletCredited] = useState(false);
  const handleScratchComplete = async () => {
    if (scratched) return;
    setScratched(true);
    const res = await creditWalletReward(phone, reward);
    if (res?.success) setWalletCredited(true);
  };

  const deliveryWindow = fasterDelivery
    ? "2-5 business days"
    : "3-9 business days";

  // Estimated arrival date (end of the delivery window), e.g. "Sat, 2 Aug".
  const deliveryByDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (fasterDelivery ? 5 : 9));
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  })();

  // Estimated delivery RANGE, e.g. "10 – 12 Aug" (or across months).
  const deliveryRange = (() => {
    const start = new Date();
    start.setDate(start.getDate() + (fasterDelivery ? 2 : 3));
    const end = new Date();
    end.setDate(end.getDate() + (fasterDelivery ? 5 : 9));
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

  // Stable display order ref + date for the printed receipt.
  const orderRef = useRef("TBX" + String(Date.now()).slice(-8)).current;
  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleShareOrder = () => {
    const itemsList = (cartBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.qty}`)
      .join("\n");
    const msg = `🎉 My TheBookX order is confirmed!\n\n📦 Delivery by ${deliveryByDate}\n📍 ${name}, ${address}, ${city} - ${pincode}\n\nItems:\n${itemsList}\n\nTotal: ₹${totalAmount}\n\nShop books from ₹1 → https://thebookx.in`;
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
    const msg = `Hi TheBookX 👋\n\nI just placed a COD order and need help:\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}, ${city} - ${pincode}\n🚚 Delivery: ${fasterDelivery ? "Faster" : "Standard"}\n\nItems:\n${itemsList}\n\nTotal: ₹${totalAmount}`;
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
                Placing your order…
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-12 dark-50"
                style={{ margin: 0 }}
              >
                Just a moment, confirming your details
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
              {/* 🧾 Printed receipt — slides out of the printer slot */}
              <div className="rcpt-stage">
                <div className="rcpt-printer" aria-hidden="true">
                  <span className="rcpt-lip" />
                </div>
                <motion.div
                  className="rcpt"
                  initial={{ y: "-109%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 3.4, ease: "linear", delay: 0.2 }}
                >
                  <div className="rcpt-head">
                    <span className="rcpt-brand">TheBookX</span>
                    <span className="rcpt-status">
                      <CheckCircle2 size={13} strokeWidth={3} /> ORDER CONFIRMED
                    </span>
                    <span className="rcpt-thanks">Thank you for your order!</span>
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
                    <span>{isUPI ? "UPI · Paid" : "Cash on Delivery"}</span>
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
                      {fasterDelivery ? "Faster delivery" : "Standard delivery"}
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
                    <span>{isUPI ? "PAID" : "TO PAY"}</span>
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
                    Track &amp; manage order →
                  </Link>
                </motion.div>
              </div>

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
                    If you cancel this order, this wallet amount will be wiped
                    off — so please keep your order to enjoy the reward.
                  </>
                }
              />


              </div>
              {/* Fixed footer — compact reward + two actions in one row */}
              <div className="cod-success-footer">
                <button
                  type="button"
                  className={`reward-teaser compact${walletCredited ? " done" : ""}`}
                  onClick={() => setScratchOpen(true)}
                >
                  <span className="reward-teaser-ic">
                    <Gift size={16} />
                  </span>
                  <span className="reward-teaser-tt">
                    {walletCredited
                      ? `₹${reward} added to your wallet`
                      : "You've won a scratch card!"}
                  </span>
                  <span className="reward-teaser-cta">
                    {walletCredited ? "Done" : "Scratch"}
                  </span>
                </button>

                <div className="cod-success-actions">
                  {onViewProfile && (
                    <button
                      className="pri-big-btn flex flex-row items-center justify-center gap-6"
                      onClick={onViewProfile}
                    >
                      <User size={15} />
                      View profile
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
            <button type="button" className="upiv3-id" onClick={onCopyUpi}>
              <Copy size={13} />
              <span>{upiCopied ? "Copied!" : upiId}</span>
            </button>
            <button
              type="button"
              className="upiv3-save"
              onClick={onDownloadQR}
              disabled={!qrUnlocked}
            >
              <Download size={13} /> Save QR
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
                <span className="upiv3-spin dark" /> Verifying… {verifyCountdown}
                s
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
