"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { EVENTS } from "@/lib/trackingEvents";
import { trackFunnelEvent } from "@/lib/analytics";
import { trackOrderToGoogleForm } from "@/utils/googleFormOrder";

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

/**
 * Normalize a phone string to a clean 10-digit Indian mobile number.
 * Accepts: "9876543210", "+91 9876543210", "+919876543210",
 *          "91 98765 43210", "98765-43210", etc.
 * Returns up to 10 digits — caller validates length === 10 for "complete".
 */
function normalizePhone(raw = "") {
  if (!raw) return "";
  // Strip everything that isn't a digit
  let digits = String(raw).replace(/\D/g, "");
  // Drop leading 91 country code if we ended up with 12 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // Drop leading 0 if we ended up with 11 digits (some users type "0987...")
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // Keep the last 10 digits if we still somehow have more
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

export default function AddressModal({
  open,
  onClose,
  finalPayable,
  totalDiscounted,
  handleWhatsAppCheckout,
  handleCODCheckout,
  handleUPICheckout,
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
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
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

  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [showCODSuccess, setShowCODSuccess] = useState(false); // NEW — COD success animation
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);

  const [giftWrap, setGiftWrap] = useState(giftWrapSelected);

  const UPI_ID = "7977960242-1@okbizaxis";

  // ---------- Effects ----------
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

  // Phone input handler — keeps the input lightweight, but normalizes on every
  // change so paste of "+91 98765 43210" becomes "9876543210" immediately.
  const handlePhoneChange = (e) => {
    setPhone(normalizePhone(e.target.value));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    setPhone(normalizePhone(pasted));
  };

  // Cart value bucket helpers
  const isCartBelow399 = totalDiscounted < 399;

  const getDeliveryCharge = (isFaster) =>
    isFaster ? fasterDeliveryCharge : standardDeliveryCharge;

  const getTotalWithDelivery = (isFaster) =>
    finalPayable + getDeliveryCharge(isFaster);

  const totalWithDelivery = getTotalWithDelivery(fasterDelivery);
  const codAdvanceAmount = 99;

  // ---------- Pincode location lookup ----------
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

  // ---------- UPI verify timer ----------
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

  // ---------- Restore saved address (no `state` anymore) ----------
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

  // ---------- TinyURL helper ----------
  const buildShortLink = async (paymentTypeLabel) => {
    if (typeof generateViewBagLinkWithDetails !== "function") return "";
    try {
      const longUrl = generateViewBagLinkWithDetails(
        {
          name,
          phone,
          address,
          area,
          city,
          district,
          pincode,
        },
        paymentTypeLabel,
        fasterDelivery,
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

  const submitToGoogleForm = async (paymentType) => {
    try {
      const shortLink = await buildShortLink(paymentType);
      trackOrderToGoogleForm({
        addressData: { name, phone, pincode, city, address },
        paymentType,
        fasterDeliveryChoice: fasterDelivery,
        giftWrapSelected: giftWrap || giftWrapSelected,
        shortLink,
        totalWithDelivery:
          getTotalWithDelivery(fasterDelivery) +
          (giftWrap || giftWrapSelected ? giftWrapCharge : 0),
        finalPayable,
        totalDiscounted,
        offerDiscount,
        offerLabel,
        cartBooks,
      }).catch((err) => console.error("Google Form submit failed:", err));
    } catch (err) {
      console.error("Google Form submit threw:", err);
    }
  };

  // ---------- Delivery speed selection ----------
  const handleProceedWithFasterDelivery = () => {
    setFasterDelivery(true);
    setShowFasterDeliveryModal(false);
    trackFunnelEvent(EVENTS.DELIVERY_SPEED_SELECTED, {
      choice: "faster",
      delivery_charge: fasterDeliveryCharge,
      cart_total: finalPayable,
    });

    if (tempPaymentMethod === "COD") triggerCODSuccess(true);
    else if (tempPaymentMethod === "UPI") setShowUPIPayment(true);
  };

  const handleProceedWithoutFasterDelivery = () => {
    setFasterDelivery(false);
    setShowFasterDeliveryModal(false);
    trackFunnelEvent(EVENTS.DELIVERY_SPEED_SELECTED, {
      choice: "standard",
      delivery_charge: standardDeliveryCharge,
      cart_total: finalPayable,
    });

    if (tempPaymentMethod === "COD") triggerCODSuccess(false);
    else if (tempPaymentMethod === "UPI") setShowUPIPayment(true);
  };

  // ---------- Trigger COD success modal ----------
  const triggerCODSuccess = (isFasterDeliverySelected) => {
    setFasterDelivery(isFasterDeliverySelected);
    setShowCODSuccess(true);
  };

  // ---------- COD success → WhatsApp ----------
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

  // ---------- Payment method click handlers ----------
  const handleCODClick = () => {
    if (!isFormValid()) return;
    submitToGoogleForm("COD");
    setTempPaymentMethod("COD");
    setShowFasterDeliveryModal(true);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "COD",
      cart_total: finalPayable,
    });
  };

  const handleUPIClick = () => {
    if (!isFormValid()) return;
    submitToGoogleForm("UPI");
    setTempPaymentMethod("UPI");
    setShowFasterDeliveryModal(true);
    trackFunnelEvent(EVENTS.PAYMENT_METHOD_SELECTED, {
      method: "UPI",
      cart_total: finalPayable,
    });
  };

  const handleWhatsAppOrderClick = () => {
    if (!isFormValid()) return;
    submitToGoogleForm("WhatsApp");
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

  // ---------- UPI payment actions ----------
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

  const isAddressValid = () => Boolean(city && address);
  const isFormValid = () =>
    Boolean(name && phone.length === 10 && isAddressValid());

  // Phone validation hint
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
              {/* Pincode */}
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <MapPin size={14} />
                  Pincode
                </label>
                <input
                  className={`sec-mid-btn ${!isValidPincode && pincode ? "error-border" : ""}`}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={handlePincodeChange}
                  inputMode="numeric"
                />
                {isFetchingLocation && (
                  <span className="font-10 gray-500 mt-4">
                    Fetching location details...
                  </span>
                )}
              </div>

              {/* City only (State removed) */}
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
              </div>

              {/* Full Address */}
              <div className="input-group">
                <label>
                  Full Address <span className="red">*</span>
                </label>
                <textarea
                  className="sec-mid-btn textarea"
                  placeholder="House no, street, landmark, area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Name + Phone */}
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

              <div className="bill-row total">
                <span className="font-16 weight-600">Total Payable</span>
                <span className="font-20 weight-700 green">
                  ₹
                  {totalWithStandardDelivery +
                    (giftWrapSelected ? giftWrapCharge : 0)}
                </span>
              </div>

              {/* Payment Buttons */}
              {showContactFields && (
                <div className="flex flex-col gap-12 items-start mt-16">
                  <div className="flex flex-row gap-12">
                    <LoadingButton
                      className="pri-big-btn width100"
                      onClick={handleUPIClick}
                      disabled={!isFormValid()}
                    >
                      <p className="weight-600">Pay with UPI</p>
                      <span className="font-10">No extra charges</span>
                    </LoadingButton>

                    <LoadingButton
                      className="sec-big-btn width100 flex flex-col"
                      onClick={handleCODClick}
                      disabled={!isFormValid()}
                    >
                      <p className="weight-600">Cash on Delivery</p>
                      <span className="font-10">Pay at your doorstep</span>
                    </LoadingButton>
                  </div>

                  <LoadingButton
                    className="sec-big-btn width100 flex flex-col"
                    onClick={handleWhatsAppOrderClick}
                    disabled={!isFormValid()}
                  >
                    <div className="flex flex-row gap-12">
                      <FaWhatsapp size={32} color="#25D366" />
                      <div className="flex flex-col">
                        <p className="weight-600">Whatsapp</p>
                        <span className="font-10">Chat & Order</span>
                      </div>
                    </div>
                  </LoadingButton>
                </div>
              )}

              {/* Validation hints */}
              {!isAddressValid() && (
                <div className="flex flex-row flex-center gap-4 orange items-center infoMessage mt-12">
                  <AlertCircle size={14} />
                  <span className="font-12">
                    Please fill your city and full address to proceed
                  </span>
                </div>
              )}

              {showContactFields && !isFormValid() && (
                <div className="flex flex-row flex-center gap-4 red items-center infoMessage mt-12">
                  <AlertCircle size={14} />
                  <span className="font-12">
                    Please enter your name and a valid 10-digit phone number
                  </span>
                </div>
              )}

              {/* ===== Bottom freebie badge ===== */}
              <FreebieBadge />
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
                    className="sec-mid-btn width100 mt-16"
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

      {/* ========== COD SUCCESS MODAL (NEW) ========== */}
      <AnimatePresence>
        {showCODSuccess && (
          <CODSuccessModal
            name={name}
            phone={phone}
            address={address}
            city={city}
            pincode={pincode}
            fasterDelivery={fasterDelivery}
            totalAmount={
              getTotalWithDelivery(fasterDelivery) +
              (giftWrap ? giftWrapCharge : 0)
            }
            cartBooks={cartBooks}
            onContinue={handleCODSuccessContinue}
            onClose={() => setShowCODSuccess(false)}
          />
        )}
      </AnimatePresence>

      {/* ========== UPI Payment Modal (Redesigned) ========== */}
      <AnimatePresence>
        {showUPIPayment && (
          <UPIPaymentModal
            finalPayable={finalPayable}
            fasterDelivery={fasterDelivery}
            fasterDeliveryCharge={fasterDeliveryCharge}
            standardDeliveryCharge={standardDeliveryCharge}
            giftWrap={giftWrap}
            giftWrapCharge={giftWrapCharge}
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
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// =====================================================================
// ============== Sub-component: FreebieBadge (bottom strip) ===========
// =====================================================================
function FreebieBadge() {
  return (
    <motion.div
      className="freebie-badge"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        marginTop: "20px",
        padding: "12px 14px",
        background:
          "linear-gradient(135deg, var(--tertiary-light-10, #ffb70320) 0%, var(--tertiary-10, #fb850010) 100%)",
        border: "1px dashed var(--tertiary, #fb8500)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          flexShrink: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--tertiary-light, #ffb703), var(--tertiary, #fb8500))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Gift size={18} />
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "var(--weight-700, 700)",
            color: "var(--foreground, #0a0a0a)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span>Bookmarks &amp; surprise gift packs</span>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "var(--dark-50, #828282)",
            marginTop: "2px",
          }}
        >
          Free with every order — included automatically
        </div>
      </div>
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
  cartBooks,
  onContinue,
  onClose,
}) {
  // Auto-trigger WhatsApp after a short celebration
  useEffect(() => {
    const t = setTimeout(() => {
      onContinue();
    }, 7000);
    return () => clearTimeout(t);
  }, [onContinue]);

  const deliveryWindow = fasterDelivery
    ? "2–5 business days"
    : "3–9 business days";

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
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div style={{ padding: "32px 20px 20px 20px", textAlign: "center" }}>
          {/* Animated tick */}
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
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
            >
              <CheckCircle2 size={40} color="#fff" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Confetti dots */}
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
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: ["#fb8500", "#ffb703", "#008f0c", "#fb8500"][
                    i % 4
                  ],
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
            style={{
              fontSize: "20px",
              margin: "8px 0 6px",
              color: "var(--foreground)",
            }}
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

        {/* Order summary card */}
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
          {/* Delivery ETA */}
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

          {/* Address */}
          <div className="flex flex-row gap-12 items-start">
            <MapPin
              size={18}
              style={{ color: "var(--tertiary)", marginTop: 2 }}
            />
            <div className="flex flex-col" style={{ flex: 1 }}>
              <span className="font-12 dark-50">Delivery Address</span>
              <span className="font-14 weight-500">{name}</span>
              <span className="font-12" style={{ color: "var(--foreground)" }}>
                {address}, {city} - {pincode}
              </span>
              <span className="font-12 dark-50">+91 {phone}</span>
            </div>
          </div>

          {/* Delivery type chip */}
          <div className="flex flex-row gap-12 items-center">
            {fasterDelivery ? (
              <Zap size={18} style={{ color: "var(--tertiary)" }} />
            ) : (
              <Clock size={18} style={{ color: "var(--dark-50)" }} />
            )}
            <div className="flex flex-col" style={{ flex: 1 }}>
              <span className="font-12 dark-50">Delivery Speed</span>
              <span className="font-14 weight-500">
                {fasterDelivery ? "Faster Delivery" : "Standard Delivery"}
              </span>
            </div>
            <span className="font-16 weight-700 green">₹{totalAmount}</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
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
            Auto-redirecting to WhatsApp in a few seconds…
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// ============== Sub-component: UPIPaymentModal (Redesigned) ==========
// =====================================================================
function UPIPaymentModal({
  finalPayable,
  fasterDelivery,
  fasterDeliveryCharge,
  standardDeliveryCharge,
  giftWrap,
  giftWrapCharge,
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
        {/* Header with gradient */}
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
              <Smartphone size={18} style={{ color: "var(--tertiary)" }} />
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Amount card */}
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
            <div className="flex justify-between font-13">
              <span className="dark-50">Books Subtotal</span>
              <span className="weight-500">₹{finalPayable}</span>
            </div>
            <div className="flex justify-between font-13">
              <span className="dark-50">
                {fasterDelivery ? "Faster Delivery" : "Delivery"}
              </span>
              <span
                className="weight-500"
                style={{
                  color: fasterDelivery
                    ? "var(--tertiary)"
                    : standardDeliveryCharge > 0
                      ? "var(--dark-50)"
                      : "var(--success)",
                }}
              >
                {fasterDelivery
                  ? `+₹${fasterDeliveryCharge}`
                  : standardDeliveryCharge > 0
                    ? `+₹${standardDeliveryCharge}`
                    : "FREE"}
              </span>
            </div>
            {giftWrap && giftWrapCharge > 0 && (
              <div className="flex justify-between font-13">
                <span className="dark-50">🎁 Gift Wrap</span>
                <span
                  className="weight-500"
                  style={{ color: "var(--tertiary)" }}
                >
                  +₹{giftWrapCharge}
                </span>
              </div>
            )}
            <div
              style={{
                borderTop: "1px dashed var(--dark-20)",
                paddingTop: 8,
                marginTop: 4,
              }}
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
          </motion.div>

          {/* QR section — locked or unlocked */}
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
              {/* Step strip */}
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
                Pay using any UPI app — Google Pay, PhonePe, Paytm, BHIM, or any
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
                    ? "✅ I've completed payment — Verify"
                    : `Verifying in ${verifyTimer}s…`}
                </button>
                <span className="font-10 dark-50">
                  Payment verification takes ~30 seconds
                </span>
              </div>
            </motion.div>
          )}

          {/* Trust strip */}
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
