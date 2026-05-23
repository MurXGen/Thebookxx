"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingButton from "./LoadingButton";
import {
  Copy,
  Download,
  FileText,
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { EVENTS } from "@/lib/trackingEvents";
import { trackFunnelEvent } from "@/lib/analytics";
import { trackOrderToGoogleForm } from "@/utils/googleFormOrder";

// Quick delivery eligible pincodes
const PINCODE_DATA_KEY = "user_pincode";
const QUICK_DELIVERY_PINCODES = ["400019", "400017"];

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
  // Offer info passed from bag page
  offerDiscount = 0,
  offerLabel = "",
  // URL generators passed from bag page — used at click-time
  // to build the view-bag link with the user's actual selections.
  generateViewBagLinkWithDetails,
  shortenUrl,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
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
  const [showCODPayment, setShowCODPayment] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [returnedFromUpi, setReturnedFromUpi] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);

  const [giftWrap, setGiftWrap] = useState(giftWrapSelected);

  const UPI_ID = "7977960242-1@okbizaxis";

  // Track modal open
  useEffect(() => {
    if (open) {
      trackFunnelEvent(EVENTS.ADDRESS_MODAL_OPENED, {
        cart_total: finalPayable,
        has_gift_wrap: giftWrapSelected,
      });
      setAddressFormStartTime(Date.now());
    }
  }, [open]);

  // Track address form completion
  useEffect(() => {
    if (showContactFields && name && phone && address && city && pincode) {
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

  // Track pincode auto-population
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
          }
        } catch (error) {
          console.error("Error loading saved pincode data:", error);
        }
      }
    }
  }, [open]);

  // Track pincode manual entry
  const handlePincodeChange = (e) => {
    const newPincode = e.target.value.replace(/\D/g, "");
    if (newPincode.length === 6 && pincode.length !== 6) {
      trackFunnelEvent(EVENTS.PINCODE_MANUAL_ENTRY, {
        pincode: newPincode,
      });
    }
    setPincode(newPincode);
  };

  useEffect(() => {
    if (open) {
      const savedPincodeData = localStorage.getItem(PINCODE_DATA_KEY);
      if (savedPincodeData) {
        try {
          const parsedData = JSON.parse(savedPincodeData);
          if (parsedData.pincode && !pincode) {
            setPincode(parsedData.pincode);
            if (parsedData.pincode.length === 6) {
              fetchLocationByPincode(parsedData.pincode);
            }
          }
          if (parsedData.city && !city) {
            setCity(parsedData.city);
          }
          if (parsedData.state && !state) {
            setState(parsedData.state);
          }
          if (parsedData.area && !area) {
            setArea(parsedData.area);
          }
          if (parsedData.district && !district) {
            setDistrict(parsedData.district);
          }
        } catch (error) {
          console.error("Error loading saved pincode data:", error);
        }
      }
    }
  }, [open]);

  // Check if cart value is below 450
  const isCartBelow450 = totalDiscounted < 399;

  // Calculate delivery charge based on selection
  const getDeliveryCharge = (isFaster) => {
    if (isFaster) {
      return fasterDeliveryCharge;
    }
    return standardDeliveryCharge;
  };

  // Calculate total with current delivery selection
  const getTotalWithDelivery = (isFaster) => {
    return finalPayable + getDeliveryCharge(isFaster);
  };

  const totalWithDelivery = getTotalWithDelivery(fasterDelivery);
  const codAdvanceAmount = 99;
  const codRemainingAmount = totalWithDelivery - codAdvanceAmount;

  const totalWithCurrentSelection = getTotalWithDelivery(fasterDelivery);

  // ----- Build a TinyURL at click-time using the parent's generators -----
  // Returns "" silently if generators weren't passed or shortening fails.
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
          state,
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
        } catch (e) {
          // Shortener failed — fall back to the long URL
          return longUrl;
        }
      }
      return longUrl;
    } catch (e) {
      console.error("buildShortLink failed:", e);
      return "";
    }
  };

  // ----- Shared Google Form submit helper -----
  // Now async — awaits the TinyURL generation so the sheet gets it.
  // Still doesn't block the UI in any meaningful way (typically <1s).
  const submitToGoogleForm = async (paymentType) => {
    try {
      const shortLink = await buildShortLink(paymentType);

      // Fire-and-forget once we have the URL
      trackOrderToGoogleForm({
        addressData: {
          name,
          phone,
          pincode,
          city,
          state,
          address,
        },
        paymentType, // "COD" | "UPI" | "WhatsApp"
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
      }).catch((err) => {
        console.error("Google Form submit failed:", err);
      });
    } catch (err) {
      console.error("Google Form submit threw:", err);
    }
  };
  // --------------------------------------------

  // Fetch location details based on pincode
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
        setState(postOffice.State);
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
        setState("");
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
    if (address && city) {
      setShowContactFields(true);
    } else {
      setShowContactFields(false);
    }
  }, [address, city]);

  const isFasterDeliveryAvailable = true;

  // Timer for UPI verification
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
    const handleFocus = () => {
      if (upiCopied) setReturnedFromUpi(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [upiCopied]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("checkoutAddress"));
    if (saved) {
      setName(saved.name || "");
      setPhone(saved.phone || "");
      setCity(saved.city || "");
      setPincode(saved.pincode || "");
      setAddress(saved.address || "");
      setState(saved.state || "");
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
          state,
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
    state,
    district,
    area,
    fasterDelivery,
    showContactFields,
  ]);

  const handleProceedWithFasterDelivery = () => {
    setFasterDelivery(true);
    setShowFasterDeliveryModal(false);

    trackFunnelEvent(EVENTS.DELIVERY_SPEED_SELECTED, {
      choice: "faster",
      delivery_charge: fasterDeliveryCharge,
      cart_total: finalPayable,
    });

    if (tempPaymentMethod === "COD") {
      proceedWithCOD(true, giftWrapSelected);
    } else if (tempPaymentMethod === "UPI") {
      proceedWithUPI(true, giftWrapSelected);
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

    if (tempPaymentMethod === "COD") {
      proceedWithCOD(false, giftWrapSelected);
    } else if (tempPaymentMethod === "UPI") {
      proceedWithUPI(false, giftWrapSelected);
    }
  };

  // Send Telegram notification for payment initiation with full order details
  const sendTelegramNotification = async (
    paymentType,
    amount,
    isFasterDeliverySelected,
  ) => {
    const deliveryCharge = getDeliveryCharge(isFasterDeliverySelected);
    const giftWrapAmount = giftWrap ? giftWrapCharge : 0;
    const totalWithDelivery = finalPayable + deliveryCharge + giftWrapAmount;

    const cartBooksList =
      cartBooks
        ?.map(
          (book, idx) =>
            `${idx + 1}. *${book.name}* × ${book.qty} = ₹${book.discountedPrice * book.qty}`,
        )
        .join("\n") || "No books found";

    const orderMessage = `
💳 *PAYMENT INITIATED - THEBOOKX*

━━━━━━━━━━━━━━━━━━━━
*👤 CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━
👨 *Name:* ${name || "Customer"}
📞 *Phone:* ${phone || "Not provided"}

━━━━━━━━━━━━━━━━━━━━
*📍 DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━
🏠 *Address:* ${address || "Not provided"}
🏙️ *City:* ${city || "Not specified"}
🗺️ *District:* ${district || "Not specified"}
📍 *State:* ${state || "Not specified"}
📮 *Pincode:* ${pincode || "Not specified"}

━━━━━━━━━━━━━━━━━━━━
*📦 ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━
${cartBooksList}

━━━━━━━━━━━━━━━━━━━━
*💰 BILL DETAILS*
━━━━━━━━━━━━━━━━━━━━
📚 Subtotal: ₹${finalPayable}
🚚 Delivery: ${isFasterDeliverySelected ? "Faster Delivery" : "Standard Delivery"}
📦 Delivery Charge: +₹${deliveryCharge}
${giftWrap ? `🎁 Gift Wrap: +₹${giftWrapCharge}` : ""}
━━━━━━━━━━━━━━━━━━━━
*💵 TOTAL PAYABLE: ₹${totalWithDelivery}*

━━━━━━━━━━━━━━━━━━━━
*💳 PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━
💳 *Payment Type:* ${paymentType}
💰 *Amount to Pay:* ₹${amount}

━━━━━━━━━━━━━━━━━━━━
🕐 *Time:* ${new Date().toLocaleString()}

_User has initiated payment. Waiting for verification..._
  `;

    try {
      await fetch("https://api.journalx.app/api/bookxTelegram/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: orderMessage,
          customerName: name,
          customerPhone: phone,
          totalAmount: totalWithDelivery,
          paymentType: paymentType,
        }),
      });
      console.log("Telegram notification sent for payment initiation");
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  };

  const handleUPIPaymentClick = async () => {
    if (!isFormValid()) return;

    trackFunnelEvent(EVENTS.UPI_PAYMENT_INITIATED, {
      total_amount: finalPayable,
      delivery_type: fasterDelivery ? "faster" : "standard",
    });

    await sendTelegramNotification(
      "UPI Full Payment",
      finalPayable,
      fasterDelivery,
    );

    setQrUnlocked(true);
    trackFunnelEvent(EVENTS.UPI_QR_REVEALED, {
      amount: finalPayable,
    });
  };

  const handleCODPartialPaymentClick = async () => {
    if (!isFormValid()) return;

    trackFunnelEvent(EVENTS.COD_PARTIAL_PAYMENT_CLICKED, {
      advance_amount: codAdvanceAmount,
      total_amount: totalWithDelivery,
      delivery_type: fasterDelivery ? "faster" : "standard",
    });

    await sendTelegramNotification(
      "COD Partial Payment (50%)",
      codAdvanceAmount,
      fasterDelivery,
    );

    setQrUnlocked(true);
    trackFunnelEvent(EVENTS.COD_QR_REVEALED, {
      amount: codAdvanceAmount,
    });
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

  const proceedWithCOD = (isFasterDeliverySelected, isGiftWrapSelected) => {
    if (!name || !phone) {
      alert("Please enter your name and phone number");
      return;
    }

    setFasterDelivery(isFasterDeliverySelected);
    setGiftWrap(isGiftWrapSelected);
    setShowCODPayment(true);
  };

  const proceedWithUPI = (isFasterDeliverySelected, isGiftWrapSelected) => {
    if (!name || !phone) {
      alert("Please enter your name and phone number");
      return;
    }

    setFasterDelivery(isFasterDeliverySelected);
    setGiftWrap(isGiftWrapSelected);
    setShowUPIPayment(true);
  };

  // === The 3 buttons that fire the Google Form submit ===
  // Note: handlers are async so we can build the TinyURL before submit.
  // UI doesn't wait — the rest of the click flow continues immediately.

  const handleCODClick = () => {
    if (!isFormValid()) return;

    // Fire-and-forget submit with TinyURL + offer (async internally)
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
    handleVerifyCODPayment();
  };

  // ======================================================

  const handleVerifyCODPayment = () => {
    trackFunnelEvent(EVENTS.COD_PAYMENT_VERIFIED, {
      amount: codAdvanceAmount,
      verification_time: verifyTimer,
    });

    if (handleCODCheckout) {
      handleCODCheckout(
        {
          name,
          phone,
          city,
          pincode,
          address,
          state,
          district,
          area,
          fasterDelivery: fasterDelivery && isFasterDeliveryAvailable,
          giftWrap: giftWrap,
        },
        fasterDelivery && isFasterDeliveryAvailable,
        giftWrap,
      );
    }
    setShowCODPayment(false);
    onClose();
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
          state,
          district,
          area,
          fasterDelivery: fasterDelivery && isFasterDeliveryAvailable,
          giftWrap: giftWrap,
        },
        fasterDelivery && isFasterDeliveryAvailable,
        giftWrap,
      );
    }
    setShowUPIPayment(false);
    onClose();
  };

  const isAddressValid = () => {
    return city && address;
  };

  const isFormValid = () => {
    return name && phone && isAddressValid();
  };

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
              {/* Pincode - Optional now */}
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <MapPin size={14} />
                  Pincode <span className="gray-500">(Optional)</span>
                </label>
                <input
                  className={`sec-mid-btn ${!isValidPincode && pincode ? "error-border" : ""}`}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={handlePincodeChange}
                />
                {isFetchingLocation && (
                  <span className="font-10 gray-500 mt-4">
                    Fetching location details...
                  </span>
                )}
              </div>

              {/* Location Details Grid */}
              <div className="flex flex-row justify-between gap-12">
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

                {state && (
                  <div className="input-group">
                    <label>State</label>
                    <input
                      className="sec-mid-btn width100 gray-bg"
                      value={state}
                      readOnly
                      disabled
                    />
                  </div>
                )}
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

              {/* Name and Phone */}
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
                          maxLength={10}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="dashed-border my-12"></div>

              <div className="bill-row total">
                <span className="font-16 weight-600">Total Payable</span>

                <span className="font-20 weight-700 green">
                  ₹
                  {totalWithStandardDelivery +
                    (giftWrapSelected ? giftWrapCharge : 0)}
                </span>
              </div>

              {/* Buttons */}
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
                      <span className="font-10">Now Rs.99 + At Delivery</span>
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

              {/* Reminders */}
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
                    Please enter your name and phone number to proceed
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Faster Delivery Confirmation Modal */}
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
                    {!isCartBelow450 && (
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
                    {isCartBelow450
                      ? "No fine, continue with standard delivery"
                      : "I'll continue with this"}
                  </button>
                </div>

                {isFasterDeliveryAvailable && (
                  <div className="delivery-option-card faster flex flex-col gap-12">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-12">
                        <Zap size={24} className="orange" />
                        <div className="flex flex-col gap-4">
                          <h4 className="font-16 weight-600">
                            Faster Delivery
                          </h4>
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
                )}

                {!isFasterDeliveryAvailable && (
                  <div className="delivery-option-card unavailable flex flex-col gap-12">
                    <div className="flex gap-12">
                      <AlertCircle size={24} className="red" />
                      <div>
                        <h4 className="weight-600">
                          Faster Delivery Not Available
                        </h4>
                        <p className="font-12 dark-50 mt-4">
                          Unfortunately, faster delivery is not available for
                          your pincode. We're working on expanding our service
                          area!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI Payment Modal */}
      <AnimatePresence>
        {showUPIPayment && (
          <motion.div
            className="pay-online-modal-overlay"
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="pay-online-bill-modal payment-modal flex flex-col gap-12"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4 }}
            >
              <div className="bill-header">
                <span className="weight-600">Pay via UPI</span>
                <span onClick={() => setShowUPIPayment(false)}>
                  <X size={16} />
                </span>
              </div>

              <div className="payment-order-summary">
                <div className="flex justify-between">
                  <span>Books Total</span>
                  <span>₹{finalPayable}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {fasterDelivery ? (
                      "🚀 Faster Delivery"
                    ) : standardDeliveryCharge === 100 ? (
                      "📦 Standard Delivery"
                    ) : standardDeliveryCharge > 0 ? (
                      <span className="flex items-center gap-4">
                        <span>💛 Handling & Care Fee</span>
                      </span>
                    ) : (
                      "Delivery"
                    )}
                  </span>

                  <span
                    className={
                      fasterDelivery
                        ? "orange"
                        : standardDeliveryCharge > 0 &&
                            standardDeliveryCharge !== 100
                          ? "dark-50"
                          : ""
                    }
                  >
                    {fasterDelivery
                      ? `+₹${fasterDeliveryCharge}`
                      : standardDeliveryCharge > 0
                        ? `+₹${standardDeliveryCharge}`
                        : "FREE"}
                  </span>
                </div>

                {fasterDelivery && (
                  <div className="flex justify-between green">
                    <span>⚡ Faster Delivery</span>
                    <span>Priority shipping</span>
                  </div>
                )}

                {giftWrap && giftWrapCharge > 0 && (
                  <div className="flex justify-between">
                    <span>🎁 Gift Wrap</span>
                    <span className="orange">+₹{giftWrapCharge}</span>
                  </div>
                )}

                <div className="flex justify-between weight-600">
                  <span>Total to Pay</span>

                  <span className="green">
                    ₹
                    {getTotalWithDelivery(fasterDelivery) +
                      (giftWrap ? giftWrapCharge : 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-16">
                {qrUnlocked && (
                  <motion.div
                    className="qr-wrapper"
                    animate={{
                      filter: qrUnlocked ? "blur(0px)" : "blur(12px)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src="/books/uskillbook.png"
                      alt="UPI QR Code for payment"
                      width={350}
                      height={420}
                    />

                    <div className="flex flex-row items-center justify-center gap-8 mt-12">
                      <button
                        className="sec-mid-btn flex flex-row gap-8"
                        onClick={handleCopyUpiId}
                      >
                        <Copy size={16} />
                        {upiCopied ? "Copied!" : UPI_ID}
                      </button>

                      <button
                        className="pri-big-btn flex flex-row gap-8"
                        onClick={handleDownloadQR}
                      >
                        <Download size={16} /> Save QR
                      </button>
                    </div>

                    <div className="qr-instructions flex items-center mt-12">
                      <span className="font-12 text-center">
                        Pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                        by scanning the QR code or copying the UPI ID.
                      </span>
                    </div>
                  </motion.div>
                )}

                {!qrUnlocked && (
                  <div className="flex flex-row justify-between width100 gap-12">
                    <LoadingButton
                      className="sec-big-btn width100 flex flex-col"
                      onClick={handleWhatsAppOrderClick}
                      disabled={!isFormValid()}
                    >
                      <div className="flex flex-row gap-12">
                        <FaWhatsapp size={16} color="#25D366" />
                        <span>Chat & Order</span>
                      </div>
                    </LoadingButton>
                    <button
                      className="pri-big-btn width100"
                      onClick={handleUPIPaymentClick}
                    >
                      Make UPI Payment
                    </button>
                  </div>
                )}

                {qrUnlocked && (
                  <div className="width100 flex flex-col gap-8 items-center">
                    <span className="font-12">
                      After completing payment, click verify
                    </span>
                    <div className="flex flex-row gap-4 width100">
                      <button
                        className={`pri-big-btn width100 ${!canVerify ? "disabled-btn" : ""}`}
                        disabled={!canVerify}
                        onClick={handleVerifyUPIPayment}
                      >
                        {canVerify
                          ? "✅ Verify Payment"
                          : `Wait ${verifyTimer}s to verify`}
                      </button>
                    </div>
                    <span className="font-10 gray-500">
                      Payment verification takes ~30 seconds
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COD Advance Payment Modal */}
      <AnimatePresence>
        {showCODPayment && (
          <motion.div
            className="pay-online-modal-overlay"
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="pay-online-bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4 }}
            >
              <div className="bill-header">
                <span className="weight-600">
                  Cash on Delivery - Just ₹{codAdvanceAmount}
                </span>
                <span onClick={() => setShowCODPayment(false)}>
                  <X size={16} />
                </span>
              </div>

              <div className="payment-order-summary">
                <div className="flex justify-between">
                  <span>Books Total</span>
                  <span>₹{finalPayable}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {fasterDelivery ? (
                      "🚀 Faster Delivery"
                    ) : standardDeliveryCharge === 100 ? (
                      "📦 Standard Delivery"
                    ) : standardDeliveryCharge > 0 ? (
                      <span className="flex items-center gap-4">
                        <span>💛 Handling & Care Fee</span>
                      </span>
                    ) : (
                      "Delivery"
                    )}
                  </span>

                  <span
                    className={
                      fasterDelivery
                        ? "orange"
                        : standardDeliveryCharge > 0 &&
                            standardDeliveryCharge !== 100
                          ? "dark-50"
                          : ""
                    }
                  >
                    {fasterDelivery
                      ? `+₹${fasterDeliveryCharge}`
                      : standardDeliveryCharge > 0
                        ? `+₹${standardDeliveryCharge}`
                        : "FREE"}
                  </span>
                </div>

                {fasterDelivery && (
                  <div className="flex justify-between green">
                    <span>⚡ Faster Delivery</span>
                    <span>Priority shipping</span>
                  </div>
                )}

                {giftWrap && giftWrapCharge > 0 && (
                  <div className="flex justify-between">
                    <span>🎁 Gift Wrap</span>
                    <span className="orange">+₹{giftWrapCharge}</span>
                  </div>
                )}

                <div className="dashed-border my-8"></div>

                <div className="flex justify-between">
                  <span>Total Amount</span>

                  <span className="weight-600">
                    ₹{totalWithDelivery + (giftWrap ? giftWrapCharge : 0)}
                  </span>
                </div>

                <div className="flex justify-between orange">
                  <span>💳 Advance Payment (₹ 99)</span>
                  <span className="weight-600">₹{codAdvanceAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>💰 Remaining at Delivery</span>

                  <span className="weight-600">
                    ₹
                    {totalWithDelivery +
                      (giftWrap ? giftWrapCharge : 0) -
                      codAdvanceAmount}
                  </span>
                </div>

                <div className="dashed-border my-8"></div>

                <div className="flex justify-between weight-600">
                  <span>Total to Pay Now</span>

                  <span className="green weight-700 font-20">
                    ₹{codAdvanceAmount}
                  </span>
                </div>
              </div>

              {qrUnlocked && (
                <motion.div
                  className="qr-wrapper"
                  animate={{
                    filter: qrUnlocked ? "blur(0px)" : "blur(12px)",
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/books/uskillbook.png"
                    alt="UPI QR Code for payment"
                    width={350}
                    height={420}
                  />

                  <div className="flex flex-row items-center justify-center gap-8 mt-12">
                    <button
                      className="sec-mid-btn flex flex-row gap-8"
                      onClick={handleCopyUpiId}
                    >
                      <Copy size={16} />
                      {upiCopied ? "Copied!" : UPI_ID}
                    </button>

                    <button
                      className="pri-big-btn flex flex-row gap-8"
                      onClick={handleDownloadQR}
                    >
                      <Download size={16} /> Save QR
                    </button>
                  </div>

                  <div className="qr-instructions flex items-center mt-12">
                    <span className="font-12 text-center">
                      Pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                      by scanning the QR code or copying the UPI ID.
                    </span>
                  </div>
                </motion.div>
              )}

              {!qrUnlocked && (
                <div className="flex flex-row justify-between width100 gap-12">
                  <LoadingButton
                    className="sec-big-btn width100 flex flex-col"
                    onClick={handleWhatsAppOrderClick}
                    disabled={!isFormValid()}
                  >
                    <div className="flex flex-row gap-12">
                      <FaWhatsapp size={16} color="#25D366" />
                      <span>Pay fully at Delivery</span>
                    </div>
                  </LoadingButton>
                  <button
                    className="pri-big-btn width100"
                    onClick={handleCODPartialPaymentClick}
                  >
                    Make Partial Payment
                  </button>
                </div>
              )}

              {qrUnlocked && (
                <div className="width100 flex flex-col gap-8 items-center">
                  <span className="font-12">
                    After completing payment, click verify
                  </span>
                  <div className="flex flex-row gap-4 width100">
                    <button
                      className={`pri-big-btn width100 ${!canVerify ? "disabled-btn" : ""}`}
                      disabled={!canVerify}
                      onClick={handleVerifyCODPayment}
                    >
                      {canVerify
                        ? "✅ Verify Payment & Confirm Order"
                        : `Wait ${verifyTimer}s to verify`}
                    </button>
                  </div>
                  <span className="font-10 gray-500">
                    Payment verification takes ~30 seconds
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
