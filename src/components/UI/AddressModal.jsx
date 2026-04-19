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

// Quick delivery eligible pincodes
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
  extraDeliveryCharge = 0,
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
  const [extraCharge, setExtraCharge] = useState(0);
  const [isValidPincode, setIsValidPincode] = useState(true);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showContactFields, setShowContactFields] = useState(false);
  const [showFasterDeliveryModal, setShowFasterDeliveryModal] = useState(false);
  const [tempPaymentMethod, setTempPaymentMethod] = useState(null);

  const [showPayment, setShowPayment] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [returnedFromUpi, setReturnedFromUpi] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);

  const UPI_ID = "7977960242-1@okbizaxis";

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
        setIsValidPincode(false);
        setPincodeError(
          "Invalid pincode. Please enter a valid Indian pincode.",
        );
        setArea("");
        setCity("");
        setDistrict("");
        setState("");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      setPincodeError("Unable to verify pincode. Please check and try again.");
      setIsValidPincode(false);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Auto-fetch when pincode reaches 6 digits
  useEffect(() => {
    if (pincode.length === 6) {
      fetchLocationByPincode(pincode);
    } else if (pincode.length > 0 && pincode.length < 6) {
      setPincodeError("Please enter a complete 6-digit pincode");
      setIsValidPincode(false);
    } else {
      setIsValidPincode(true);
      setPincodeError("");
    }
  }, [pincode]);

  // Show contact fields only when address and pincode are verified
  useEffect(() => {
    if (isValidPincode && pincode.length === 6 && city && address) {
      setShowContactFields(true);
    } else {
      setShowContactFields(false);
    }
  }, [isValidPincode, pincode, city, address]);

  // Check if faster delivery is available for this pincode
  const isFasterDeliveryAvailable = true;

  // Calculate extra charge based on faster delivery selection
  useEffect(() => {
    if (fasterDelivery && pincode.length === 6 && isFasterDeliveryAvailable) {
      setExtraCharge(100);
    } else {
      setExtraCharge(0);
    }
  }, [fasterDelivery, pincode, isFasterDeliveryAvailable]);

  // Calculate total with all charges
  const totalWithAllCharges = finalPayable + extraDeliveryCharge + extraCharge;

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

  const resetForm = () => {
    setName("");
    setPhone("");
    setCity("");
    setPincode("");
    setAddress("");
    setState("");
    setDistrict("");
    setArea("");
    setFasterDelivery(false);
    setShowContactFields(false);
    localStorage.removeItem("checkoutAddress");
  };

  const handleProceedWithFasterDelivery = () => {
    setFasterDelivery(true);
    setShowFasterDeliveryModal(false);

    if (tempPaymentMethod === "COD") {
      proceedWithCOD();
    } else if (tempPaymentMethod === "UPI") {
      proceedWithUPI();
    }
  };

  const handleProceedWithoutFasterDelivery = () => {
    setFasterDelivery(false);
    setShowFasterDeliveryModal(false);

    if (tempPaymentMethod === "COD") {
      proceedWithCOD();
    } else if (tempPaymentMethod === "UPI") {
      proceedWithUPI();
    }
  };

  const proceedWithCOD = () => {
    if (!isValidPincode || pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }

    if (!name || !phone) {
      alert("Please enter your name and phone number");
      return;
    }

    if (handleCODCheckout) {
      handleCODCheckout({
        name,
        phone,
        city,
        pincode,
        address,
        state,
        district,
        area,
        fasterDelivery: fasterDelivery && isFasterDeliveryAvailable,
        extraCharge,
        paymentMethod: "COD",
      });
    }
    onClose();
  };

  const proceedWithUPI = () => {
    if (!isValidPincode || pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }

    if (!name || !phone) {
      alert("Please enter your name and phone number");
      return;
    }

    setShowPayment(true);
  };

  const handleCODClick = () => {
    if (!isFormValid()) return;
    setTempPaymentMethod("COD");
    setShowFasterDeliveryModal(true);
  };

  const handleUPIClick = () => {
    if (!isFormValid()) return;
    setTempPaymentMethod("UPI");
    setShowFasterDeliveryModal(true);
  };

  const handleVerifyPayment = () => {
    if (handleWhatsAppCheckout) {
      handleWhatsAppCheckout({
        name,
        phone,
        city,
        pincode,
        address,
        state,
        district,
        area,
        fasterDelivery: fasterDelivery && isFasterDeliveryAvailable,
        extraCharge,
        paymentMethod: "UPI",
      });
    }
    setShowPayment(false);
    onClose();
  };

  const isAddressValid = () => {
    return city && pincode.length === 6 && address && isValidPincode;
  };

  const isFormValid = () => {
    return name && phone && isAddressValid();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="bill-modal-overlay" onClick={onClose}>
          <motion.div
            className="bill-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
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
                  Pincode <span className="red">*</span>
                </label>
                <input
                  className={`sec-mid-btn ${!isValidPincode && pincode ? "error-border" : ""}`}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, ""))
                  }
                />
                {isFetchingLocation && (
                  <span className="font-10 gray-500 mt-4">
                    Fetching location details...
                  </span>
                )}
                {pincodeError && (
                  <span className="font-12 red flex items-center gap-4 mt-4">
                    <AlertCircle size={12} />
                    {pincodeError}
                  </span>
                )}
                {isValidPincode &&
                  pincode.length === 6 &&
                  !isFetchingLocation && (
                    <span className="font-10 green mt-4">
                      ✓ Location verified
                    </span>
                  )}
              </div>

              {/* Location Details Grid */}
              <div className="flex flex-row justify-between gap-12">
                <div className="input-group">
                  <label>City / District</label>
                  <input
                    list="cities"
                    className="sec-mid-btn"
                    placeholder="Auto-filled from pincode"
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
                      className="sec-mid-btn gray-bg"
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

              {/* Name and Phone - Only shown after address is verified */}
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
                          className="sec-mid-btn"
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
                          className="sec-mid-btn"
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

              {/* Delivery Charge Breakdown */}
              <div className="flex flex-col gap-8">
                {extraDeliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="font-14">Standard Delivery</span>
                    <span className="font-14">₹{extraDeliveryCharge}</span>
                  </div>
                )}
              </div>

              <div className="bill-row total">
                <span className="font-16 weight-600">Total Payable</span>
                <span className="font-20 weight-700 green">
                  ₹{totalWithAllCharges}
                </span>
              </div>

              {/* Buttons - Only shown after contact fields are filled */}
              {showContactFields && (
                <div className="flex flex-row gap-12 items-start mt-16">
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
                    <span className="font-10">
                      Pay 50% now + 50% on delivery
                    </span>
                  </LoadingButton>
                </div>
              )}

              {/* Address completion reminder */}
              {!isAddressValid() && (
                <div className="flex flex-row flex-center gap-4 orange items-center infoMessage mt-12">
                  <AlertCircle size={14} />
                  <span className="font-12">
                    Please fill your pincode, city, and full address first
                  </span>
                </div>
              )}

              {/* Form completion reminder */}
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
                        <h4 className="weight-600">Standard Delivery</h4>
                        <p className="font-12 dark-50 mt-4">
                          Get your order delivered in 5-7 business days
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                          <ShieldCheck size={14} className="green" />
                          <span className="font-10 green">Free tracking</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-16 weight-600 green">FREE</span>
                  </div>
                  <button
                    className="sec-mid-btn width100 mt-16"
                    onClick={handleProceedWithoutFasterDelivery}
                  >
                    Choose Standard Delivery
                  </button>
                </div>

                {isFasterDeliveryAvailable && (
                  <div className="delivery-option-card faster flex flex-col gap-12">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-12">
                        <Zap size={24} className="orange" />
                        <div className="flex flex-col gap-4">
                          <h4 className="weight-600">Faster Delivery</h4>
                          <p className="font-12 dark-50 mt-4">
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
                                Free tracking
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-16 weight-600 orange">+₹100</span>
                    </div>
                    <button
                      className="pri-big-btn width100 mt-16"
                      onClick={handleProceedWithFasterDelivery}
                    >
                      Choose Faster Delivery
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
        {showPayment && (
          <motion.div className="pay-online-modal-overlay">
            <motion.div
              className="pay-online-bill-modal payment-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4 }}
            >
              <div className="bill-header">
                <span className="weight-600">Pay via UPI</span>
                <span onClick={() => setShowPayment(false)}>
                  <X size={16} />
                </span>
              </div>

              <div className="payment-order-summary">
                <div className="flex justify-between">
                  <span>Books Total</span>
                  <span>₹{finalPayable}</span>
                </div>
                {extraDeliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Standard Delivery</span>
                    <span>₹{extraDeliveryCharge}</span>
                  </div>
                )}
                {fasterDelivery && isFasterDeliveryAvailable && (
                  <div className="flex justify-between orange">
                    <span>Faster Delivery (Express)</span>
                    <span>+₹{extraCharge}</span>
                  </div>
                )}
                <div className="flex justify-between weight-600">
                  <span>Total to Pay</span>
                  <span className="green">₹{totalWithAllCharges}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-16">
                <motion.div
                  className="qr-wrapper"
                  animate={{ filter: qrUnlocked ? "blur(0px)" : "blur(12px)" }}
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
                      onClick={() => {
                        navigator.clipboard.writeText(UPI_ID);
                        setUpiCopied(true);
                        setTimeout(() => setUpiCopied(false), 3000);
                      }}
                    >
                      <Copy size={16} />
                      {upiCopied ? "Copied!" : UPI_ID}
                    </button>

                    <button
                      className="pri-big-btn flex flex-row gap-8"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = "/books/uskillbook.png";
                        link.download = "thebookx-upi-qr.png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
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

                {!qrUnlocked && (
                  <button
                    className="pri-big-btn"
                    onClick={() => setQrUnlocked(true)}
                  >
                    Reveal QR Code to Pay
                  </button>
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
                        onClick={handleVerifyPayment}
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
    </AnimatePresence>
  );
}
