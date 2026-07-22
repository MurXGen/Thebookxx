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
import { trackOrderToGoogleForm } from "@/utils/googleFormOrder";
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
  const [showCODFeeModal, setShowCODFeeModal] = useState(false); // NEW
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);

  const [giftWrap, setGiftWrap] = useState(giftWrapSelected);
  // The modal stays mounted, so keep the internal gift-wrap flag in sync with
  // the bag's selection — otherwise the +₹25 never reflects in the totals.
  useEffect(() => {
    setGiftWrap(giftWrapSelected);
  }, [giftWrapSelected]);

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
          if (!isNaN(w)) bal = Math.max(bal, w);
        }
      });
      setWalletBalance(bal);
      setWalletChecked(true);
      setWalletCheckedPhone(digits);
      setWalletEnabled(bal > 0); // auto-on when they have credit; they can turn off
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
    if (current === loginPhone || loginPrefillRef.current === loginPhone) return;
    loginPrefillRef.current = loginPhone;
    setPhone(loginPhone); // drives the wallet lookup + marks this profile loaded
    prefillFromOrders(loginPhone, true); // overwrite with their profile address
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Wallet applied = min(balance, ₹399 cap, goods total) when enabled.
  const walletApplied =
    walletEnabled && walletBalance > 0
      ? Math.min(walletBalance, WALLET_MAX_PER_ORDER, Math.max(0, finalPayable))
      : 0;
  // QuickReads add-on rides on the same bill (flat, no delivery/offer applied).
  const qrAddOn = quickReadTotal || 0;
  const netPayable = Math.max(0, finalPayable - walletApplied) + qrAddOn;

  const getDeliveryCharge = (isFaster) =>
    isFaster ? fasterDeliveryCharge : standardDeliveryCharge;

  const getTotalWithDelivery = (isFaster) =>
    netPayable + getDeliveryCharge(isFaster);

  const totalWithDelivery = getTotalWithDelivery(fasterDelivery);
  const codAdvanceAmount = 99;

  // For the COD fee modal comparison
  const upiTotalForFlow =
    getTotalWithDelivery(fasterDelivery) + (giftWrap ? giftWrapCharge : 0);
  const codTotalWithFee = upiTotalForFlow + codHandlingFee;

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

  useEffect(() => {
    if (!qrUnlocked) return;
    setVerifyTimer(30);
    setCanVerify(false);
    const interval = setInterval(() => {
      setVerifyTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanVerify(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrUnlocked]);

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
  ) => {
    try {
      const shortLink = await buildShortLink(paymentType, isFaster);
      const feeForThisOrder = paymentType === "COD" ? codHandlingFee : 0;
      const deliveryChargeForOrder = getDeliveryCharge(isFaster);
      const giftWrapOn = giftWrap || giftWrapSelected;
      const giftWrapAmountForOrder = giftWrapOn ? giftWrapCharge : 0;

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
          feeForThisOrder,
        // Itemised values, match what the user sees in the success modal
        subtotal: totalDiscounted,
        finalPayable: netPayable,
        totalDiscounted,
        offerDiscount,
        offerLabel,
        walletUsed: walletApplied,
        walletPhone: walletApplied > 0 ? walletCheckedPhone : "",
        deliveryCharge: deliveryChargeForOrder,
        deliveryType: isFaster ? "Faster" : "Standard",
        giftWrapCharge: giftWrapAmountForOrder,
        codHandlingFee: feeForThisOrder,
        cartBooks,
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
    submitToGoogleForm(tempPaymentMethod, true);
    if (tempPaymentMethod === "COD") {
      setShowCODFeeModal(true);
    } else if (tempPaymentMethod === "UPI") {
      setShowUPIPayment(true);
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
    submitToGoogleForm(tempPaymentMethod, false);
    if (tempPaymentMethod === "COD") {
      setShowCODFeeModal(true);
    } else if (tempPaymentMethod === "UPI") {
      setShowUPIPayment(true);
    }
  };

  const triggerCODSuccess = (isFasterDeliverySelected) => {
    setFasterDelivery(isFasterDeliverySelected);
    setShowCODSuccess(true);
  };

  // NEW, user confirmed they'll pay the COD fee
  const handleConfirmCODWithFee = () => {
    setShowCODFeeModal(false);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "COD_confirmed_with_fee",
      cart_total: finalPayable,
      cod_fee: codHandlingFee,
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
      saved_amount: codHandlingFee,
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
    submitToGoogleForm("WhatsApp", fasterDelivery, true);
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
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 3000);
    trackFunnelEvent(EVENTS.UPI_LINK_COPIED, {});
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = "/books/uskillbook.png";
    link.download = "thebookx-upi-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackFunnelEvent(EVENTS.UPI_QR_DOWNLOADED, {});
  };

  const handleVerifyUPIPayment = () => {
    trackFunnelEvent(EVENTS.UPI_PAYMENT_VERIFIED, {
      amount: finalPayable,
      verification_time: verifyTimer,
    });
    // GA purchase — only counted here, when the user clicks Verify.
    trackPurchase({
      cartItems: cartBooks,
      totalAmount: netPayable,
      paymentId: `UPI-${Date.now()}`,
    });
    // Log the CONFIRMED UPI order (plain name, no "(unconfirmed)" tag).
    submitToGoogleForm("UPI", fasterDelivery, true);
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
    setShowUPIPayment(false);
    onClose();
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
            className="bill-modal"
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
                  Full Address <span className="red">*</span>
                </label>
                <textarea
                  className="sec-mid-btn textarea"
                  placeholder="House no, building, street, area, landmark…"
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

              {/* Wallet balance — auto-detected from the entered number, only
                  shown when the customer actually has credit */}
              {walletChecked &&
                walletCheckedPhone === phone.replace(/\D/g, "") &&
                walletBalance > 0 && (
                  <label className="wc-apply wc-card">
                    <span className="wc-icon">
                      <Wallet size={16} />
                    </span>
                    <span className="wc-apply-txt">
                      <span className="wc-bal">
                        Wallet balance ₹{walletBalance}
                      </span>
                      <span className="wc-apply-note">
                        {walletEnabled
                          ? `Applying ₹${walletApplied} to this order`
                          : `Tap to use up to ₹${WALLET_MAX_PER_ORDER}`}
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

              <div className="bill-row total">
                <span className="font-16 weight-600">Total Payable</span>
                <span className="font-20 weight-700 green">
                  ₹
                  {getTotalWithDelivery(false) +
                    (giftWrapSelected ? giftWrapCharge : 0)}
                </span>
              </div>

              {showContactFields && (
                <div className="flex flex-col gap-12 items-start mt-16">
                  <div className="flex flex-row gap-12">
                    <LoadingButton
                      className="pri-big-btn width100 flex flex-col"
                      onClick={() => attemptPayment("UPI")}
                    >
                      <p className="weight-600">Pay with UPI</p>
                      <span className="font-10">No extra charges</span>
                    </LoadingButton>

                    <LoadingButton
                      className="sec-big-btn width100 flex flex-col"
                      onClick={() => attemptPayment("COD")}
                    >
                      <p className="weight-600">Cash on Delivery</p>
                      <span className="font-10">Pay at your doorstep</span>
                    </LoadingButton>
                  </div>

                  <LoadingButton
                    className="sec-big-btn width100"
                    onClick={() => attemptPayment("WhatsApp")}
                  >
                    <div className="flex flex-row gap-12 items-center">
                      <FaWhatsapp size={30} color="#25D366" />
                      <div className="flex flex-col items-start">
                        <p className="weight-600">WhatsApp</p>
                        <span className="font-10">Chat &amp; order</span>
                      </div>
                    </div>
                  </LoadingButton>
                </div>
              )}

              {!isAddressValid() && (
                <div className="addr-warn addr-warn-orange">
                  <AlertCircle size={13} />
                  <span>Fill your city and full address to proceed</span>
                </div>
              )}

              {showContactFields &&
                (!name.trim() || phone.length !== 10) && (
                  <div className="addr-warn addr-warn-red">
                    <AlertCircle size={13} />
                    <span>Enter your name and a valid 10-digit phone</span>
                  </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}

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
                <span className="weight-600 font-16">
                  Choose Delivery Speed
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowFasterDeliveryModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="faster-delivery-content flex flex-col gap-32">
                <div className="delivery-option-card standard flex flex-col gap-12">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-12">
                      <Clock size={24} className="gray-500" />
                      <div className="flex flex-col gap-4">
                        <h4 className="font-16 weight-600">
                          Standard Delivery
                        </h4>
                        <p className="font-12 dark-50">
                          Get your order delivered in 5-7 business days
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                          <ShieldCheck size={14} className="green" />
                          <span className="font-10 green">Free tracking</span>
                        </div>
                      </div>
                    </div>
                    {!isCartBelow399 && (
                      <span
                        className="font-16 weight-600"
                        style={{ color: "#fb8500" }}
                      >
                        {standardDeliveryCharge < 0
                          ? `₹${standardDeliveryCharge}`
                          : "FREE"}
                      </span>
                    )}
                  </div>
                  <button
                    className="sec-big-btn width100 mt-16"
                    onClick={handleProceedWithoutFasterDelivery}
                  >
                    {isCartBelow399
                      ? "No fine, continue with standard delivery"
                      : "I'll continue with this"}
                  </button>
                </div>

                <div className="delivery-option-card faster flex flex-col gap-12">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-12">
                      <Zap size={24} className="orange" />
                      <div className="flex flex-col gap-4">
                        <h4 className="font-16 weight-600">Faster Delivery</h4>
                        <p className="font-12 dark-50">
                          Get your order delivered in 2-5 business days
                        </p>
                        <div className="flex flex-row gap-12">
                          <div className="flex items-center gap-4 mt-8">
                            <Truck size={14} className="orange" />
                            <span className="font-10 orange">
                              Priority shipping
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-8">
                            <ShieldCheck size={14} className="green" />
                            <span className="font-10 green">
                              Real-time tracking
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-16 weight-600 green">
                      +₹{fasterDeliveryCharge}
                    </span>
                  </div>
                  <button
                    className="pri-big-btn width100 mt-16"
                    onClick={handleProceedWithFasterDelivery}
                  >
                    Continue with Faster Delivery
                  </button>
                </div>
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
            codFee={codHandlingFee}
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
            codFee={codHandlingFee}
            quickReadCount={quickReadItems.length}
            quickReadTotal={qrAddOn}
            // ---- totals derived from above for convenience ----
            baseAmount={
              getTotalWithDelivery(fasterDelivery) +
              (giftWrap ? giftWrapCharge : 0)
            }
            totalAmount={
              getTotalWithDelivery(fasterDelivery) +
              (giftWrap ? giftWrapCharge : 0) +
              codHandlingFee
            }
            onContinue={handleCODSuccessContinue}
            onClose={() => setShowCODSuccess(false)}
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
            totalToPay={
              getTotalWithDelivery(fasterDelivery) +
              (giftWrap ? giftWrapCharge : 0)
            }
            qrUnlocked={qrUnlocked}
            upiCopied={upiCopied}
            verifyTimer={verifyTimer}
            canVerify={canVerify}
            upiId={UPI_ID}
            onRevealQR={handleUPIPaymentClick}
            onCopyUpi={handleCopyUpiId}
            onDownloadQR={handleDownloadQR}
            onVerify={handleVerifyUPIPayment}
            onClose={() => setShowUPIPayment(false)}
            onWhatsAppFallback={handleWhatsAppOrderClick}
            onSwitchToCOD={switchToCODFromUPI}
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

          {/* CTAs, emotionally-charged primary, neutral secondary */}
          <div className="flex flex-col gap-12" style={{ marginTop: 4 }}>
            <motion.button
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18 }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={onSwitchToUPI}
              className="pri-big-btn width100 flex flex-row items-center justify-center gap-8"
              style={{
                background:
                  "linear-gradient(135deg, var(--tertiary, #fb8500) 0%, var(--tertiary-light, #ffb703) 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Sparkles size={16} />
              Skip the ₹{codFee} fee, Pay via UPI
              <ArrowRight size={16} />
            </motion.button>

            <button
              type="button"
              onClick={onConfirmCOD}
              className="sec-mid-btn width100"
              style={{ padding: "12px 16px" }}
            >
              Yes, proceed with COD handling fee
            </button>
          </div>

          <span
            className="font-10 dark-50"
            style={{ textAlign: "center", marginTop: 2 }}
          >
            Pay UPI from any app, Google Pay, PhonePe, Paytm, BHIM
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
  onContinue,
  onClose,
}) {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const deliveryWindow = fasterDelivery
    ? "2-5 business days"
    : "3-9 business days";

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
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleOverlayClick}
      style={{ maxWidth: "980px", margin: "0 auto" }}
    >
      <motion.div
        className="bill-modal"
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
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
                minHeight: 240,
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div
                style={{ padding: "32px 20px 20px 20px", textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1,
                  }}
                  style={{
                    width: "72px",
                    height: "72px",
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--success, #008f0c), #00b510)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0, 143, 12, 0.35)",
                  }}
                >
                  <CheckCircle2 size={40} color="#fff" strokeWidth={3} />
                </motion.div>

                <div style={{ position: "relative", height: 0 }}>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0.6],
                        x: Math.cos((i * Math.PI * 2) / 8) * 80,
                        y: Math.sin((i * Math.PI * 2) / 8) * 80 - 80,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: [
                          "#fb8500",
                          "#ffb703",
                          "#008f0c",
                          "#fb8500",
                        ][i % 4],
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="weight-700"
                  style={{ fontSize: "20px", margin: "8px 0 6px" }}
                >
                  🎉 Order Confirmed!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="font-14 dark-50"
                  style={{ margin: 0 }}
                >
                  Your Cash on Delivery order has been placed
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{
                  padding: "16px",
                  background: "var(--dark-4)",
                  border: "1px solid var(--dark-10)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div className="flex flex-row gap-12 items-start">
                  <Truck
                    size={18}
                    style={{ color: "var(--success)", marginTop: 2 }}
                  />
                  <div className="flex flex-col" style={{ flex: 1 }}>
                    <span className="font-12 dark-50">Delivery in</span>
                    <span className="font-14 weight-600">{deliveryWindow}</span>
                    <span className="font-10 dark-50" style={{ marginTop: 2 }}>
                      Shipping ID will be shared once dispatched
                    </span>
                  </div>
                </div>

                <div className="flex flex-row gap-12 items-start">
                  <MapPin
                    size={18}
                    style={{ color: "var(--tertiary)", marginTop: 2 }}
                  />
                  <div className="flex flex-col" style={{ flex: 1 }}>
                    <span className="font-12 dark-50">Delivery Address</span>
                    <span className="font-14 weight-500">{name}</span>
                    <span
                      className="font-12"
                      style={{ color: "var(--foreground)" }}
                    >
                      {address}, {city} - {pincode}
                    </span>
                    <span className="font-12 dark-50">+91 {phone}</span>
                  </div>
                </div>

                {/* Itemised order breakdown, books + bill */}
                <div
                  style={{
                    borderTop: "1px dashed var(--dark-20)",
                    paddingTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* Books section header */}
                  <div className="flex flex-row items-center gap-8">
                    <Package size={14} style={{ color: "var(--tertiary)" }} />
                    <span className="font-12 weight-700">
                      Order Items ({cartBooks?.length || 0})
                    </span>
                  </div>

                  {/* Book line items */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {cartBooks?.map((book, idx) => (
                      <div
                        key={idx}
                        className="flex flex-row justify-between items-start gap-8"
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="font-12 weight-500"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {idx + 1}. {book.name}
                          </div>
                          <span className="font-10 dark-50">
                            {book.qty} × ₹{book.discountedPrice}
                          </span>
                        </div>
                        <span className="font-12 weight-600">
                          ₹{book.discountedPrice * book.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bill rows */}
                  <div
                    style={{
                      borderTop: "1px dashed var(--dark-20)",
                      paddingTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div className="flex flex-row justify-between font-12">
                      <span className="dark-50">Subtotal</span>
                      <span>₹{totalDiscounted}</span>
                    </div>

                    {offerDiscount > 0 && (
                      <div className="flex flex-row justify-between font-12">
                        <span className="dark-50">
                          Offer {offerLabel ? `(${offerLabel})` : ""}
                        </span>
                        <span
                          className="weight-600"
                          style={{ color: "var(--success)" }}
                        >
                          -₹{offerDiscount}
                        </span>
                      </div>
                    )}

                    {walletApplied > 0 && (
                      <div className="flex flex-row justify-between font-12">
                        <span className="dark-50">Wallet balance</span>
                        <span
                          className="weight-600"
                          style={{ color: "var(--success)" }}
                        >
                          -₹{walletApplied}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-row justify-between font-12">
                      <span className="dark-50">
                        {fasterDelivery
                          ? "Faster Delivery"
                          : "Standard Delivery"}
                      </span>
                      <span
                        className="weight-500"
                        style={{
                          color:
                            deliveryCharge > 0
                              ? "var(--foreground)"
                              : "var(--success)",
                        }}
                      >
                        {deliveryCharge > 0 ? `+₹${deliveryCharge}` : "FREE"}
                      </span>
                    </div>

                    {giftWrap && giftWrapCharge > 0 && (
                      <div className="flex flex-row justify-between font-12">
                        <span className="dark-50">🎁 Gift Wrap</span>
                        <span className="weight-500">+₹{giftWrapCharge}</span>
                      </div>
                    )}

                    {quickReadTotal > 0 && (
                      <div className="flex flex-row justify-between font-12">
                        <span className="dark-50">
                          ⚡ QuickReads ({quickReadCount})
                        </span>
                        <span
                          className="weight-600"
                          style={{ color: "var(--tertiary)" }}
                        >
                          +₹{quickReadTotal}
                        </span>
                      </div>
                    )}

                    {codFee > 0 && (
                      <div className="flex flex-row justify-between font-12">
                        <span className="dark-50">COD handling fee</span>
                        <span
                          className="weight-600"
                          style={{ color: "var(--tertiary)" }}
                        >
                          +₹{codFee}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Final total */}
                  <div
                    style={{
                      borderTop: "1px solid var(--dark-10)",
                      paddingTop: 10,
                    }}
                    className="flex flex-row justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-14 weight-700">
                        To pay at delivery
                      </span>
                      {codFee > 0 && (
                        <span className="font-10 dark-50">
                          Includes ₹{codFee} COD fee
                        </span>
                      )}
                    </div>
                    <span className="font-18 weight-700 green">
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: 16,
                }}
              >
                <button
                  className="sec-mid-btn width100 flex flex-row items-center justify-center gap-8"
                  onClick={handleNeedHelp}
                  style={{ padding: "10px 16px" }}
                >
                  <Headphones size={16} />
                  Need help? Contact us
                </button>

                <span
                  className="font-10 dark-50"
                  style={{ textAlign: "center", marginTop: 4 }}
                >
                  You can close this window...
                </span>
              </motion.div>
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
  verifyTimer,
  canVerify,
  upiId,
  onRevealQR,
  onCopyUpi,
  onDownloadQR,
  onVerify,
  onClose,
  onWhatsAppFallback,
  onSwitchToCOD,
}) {
  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: "980px", margin: "0 auto" }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal upi-payment-modal-v2"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div
          style={{
            padding: "20px",
            background:
              "linear-gradient(135deg, var(--tertiary-10, #fb850010) 0%, var(--tertiary-light-10, #ffb70310) 100%)",
            borderBottom: "1px solid var(--dark-10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="flex flex-col gap-4">
            <span className="font-12 dark-50 weight-500">Secure Payment</span>
            <div className="flex flex-row items-center gap-8">
              <span className="font-16 weight-700">Pay via UPI</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close UPI modal"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--foreground)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              padding: "16px",
              background: "var(--dark-4)",
              border: "1px solid var(--dark-10)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{ paddingTop: 8, marginTop: 4 }}
              className="flex justify-between items-center"
            >
              <span className="font-14 weight-600">Total to Pay</span>
              <span
                className="weight-700"
                style={{ fontSize: 22, color: "var(--success)" }}
              >
                ₹{totalToPay}
              </span>
            </div>
            {quickReadTotal > 0 && (
              <div
                className="font-11 flex items-center gap-4"
                style={{ color: "var(--tertiary, #fb8500)", fontWeight: 600 }}
              >
                ⚡ Includes {quickReadCount} QuickRead
                {quickReadCount > 1 ? "s" : ""} (₹{quickReadTotal})
              </div>
            )}
          </motion.div>

          {!qrUnlocked ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              style={{
                padding: "24px 16px",
                border: "2px dashed var(--tertiary)",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, var(--tertiary-10, #fb850010) 0%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                textAlign: "center",
              }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <QrCode size={26} />
              </motion.div>
              <div className="flex flex-col gap-4 items-center">
                <span className="font-14 weight-700">
                  Ready to pay ₹{totalToPay}?
                </span>
                <span className="font-12 dark-50">
                  Tap below to reveal the UPI QR code
                </span>
              </div>
              <button
                className="pri-big-btn width100"
                onClick={onRevealQR}
                style={{ maxWidth: 320 }}
              >
                Reveal QR Code to Pay
              </button>
              <button
                className="sec-mid-btn flex flex-row items-center gap-8"
                onClick={onWhatsAppFallback}
                style={{ marginTop: 4 }}
              >
                <FaWhatsapp size={16} color="#25D366" />
                <span className="font-12">Prefer WhatsApp? Chat & order</span>
              </button>
              {onSwitchToCOD && (
                <button
                  type="button"
                  className="upi-cod-switch"
                  onClick={onSwitchToCOD}
                >
                  <span>
                    Don&apos;t have an option to pay online? Choose Cash on
                    Delivery
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "20px 16px",
                background: "#fff",
                border: "1px solid var(--dark-10)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                className="flex flex-row gap-8 width100 "
                style={{ justifyContent: "center" }}
              >
                {["Scan", "Pay", "Verify"].map((step, i) => (
                  <div
                    key={step}
                    className="flex flex-row items-center justify-center gap-4"
                    style={{ flex: 1, maxWidth: 90 }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background:
                          i === 0 ? "var(--tertiary)" : "var(--dark-10)",
                        color: i === 0 ? "#fff" : "var(--dark-50)",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="font-10"
                      style={{
                        color: i === 0 ? "var(--foreground)" : "var(--dark-50)",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <Image
                src="/books/uskillbook.png"
                alt="UPI QR Code"
                width={280}
                height={340}
                style={{
                  borderRadius: 8,
                  boxShadow: "0 4px 16px var(--dark-10)",
                }}
              />

              <div className="flex flex-row items-center justify-center gap-8 width100">
                <button
                  className="sec-mid-btn flex flex-row gap-6 items-center"
                  onClick={onCopyUpi}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Copy size={14} />
                  <span className="font-12">
                    {upiCopied ? "Copied!" : upiId}
                  </span>
                </button>
                <button
                  className="sec-mid-btn flex flex-row gap-6 items-center"
                  onClick={onDownloadQR}
                  style={{ justifyContent: "center" }}
                >
                  <Download size={14} />
                  <span className="font-12">Save</span>
                </button>
              </div>

              <span
                className="font-11 dark-50"
                style={{ textAlign: "center", lineHeight: 1.5 }}
              >
                Pay using any UPI app, Google Pay, PhonePe, Paytm, BHIM, or any
                bank app
              </span>

              <div
                className="width100 flex flex-col gap-6 items-center"
                style={{ marginTop: 4 }}
              >
                <button
                  className={`pri-big-btn width100 ${!canVerify ? "disabled-btn" : ""}`}
                  disabled={!canVerify}
                  onClick={onVerify}
                  style={{
                    opacity: canVerify ? 1 : 0.6,
                    cursor: canVerify ? "pointer" : "not-allowed",
                  }}
                >
                  {canVerify
                    ? "✅ I've completed payment, Verify"
                    : `Verifying in ${verifyTimer}s…`}
                </button>
                <span className="font-10 dark-50">
                  Payment verification takes ~30 seconds
                </span>
              </div>
            </motion.div>
          )}

          <div
            className="flex flex-row justify-between items-center"
            style={{
              padding: "10px 12px",
              background: "var(--dark-4)",
              borderRadius: 10,
            }}
          >
            <div className="flex flex-row items-center gap-6">
              <ShieldCheck size={14} style={{ color: "var(--success)" }} />
              <span className="font-11 dark-50">Encrypted &amp; secure</span>
            </div>
            <div className="flex flex-row items-center gap-6">
              <Package size={14} style={{ color: "var(--tertiary)" }} />
              <span className="font-11 dark-50">Order tracked end-to-end</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
