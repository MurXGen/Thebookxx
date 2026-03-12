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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FREE_PINCODES = ["400018", "400017", "400020", "400021"];

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
  handleWhatsAppCheckout,
}) {
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [quickDelivery, setQuickDelivery] = useState(false);
  const [extraCharge, setExtraCharge] = useState(0);

  const [showPayment, setShowPayment] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [returnedFromUpi, setReturnedFromUpi] = useState(false);

  const [verifyTimer, setVerifyTimer] = useState(30);
  const [canVerify, setCanVerify] = useState(false);

  const UPI_ID = "7977960242-1@okbizaxis";

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
      setCity(saved.city || "");
      setPincode(saved.pincode || "");
      setAddress(saved.address || "");
      setQuickDelivery(saved.quickDelivery || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "checkoutAddress",
      JSON.stringify({ city, pincode, address, quickDelivery }),
    );
  }, [city, pincode, address, quickDelivery]);

  useEffect(() => {
    if (quickDelivery && pincode.length === 6) {
      setExtraCharge(FREE_PINCODES.includes(pincode) ? 0 : 100);
    } else {
      setExtraCharge(0);
    }
  }, [quickDelivery, pincode]);

  const resetForm = () => {
    setCity("");
    setPincode("");
    setAddress("");
    setQuickDelivery(false);
    localStorage.removeItem("checkoutAddress");
  };

  const handleSubmit = () => {
    handleWhatsAppCheckout({
      city,
      pincode,
      address,
      quickDelivery,
      extraCharge,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="bill-modal-overlay" onClick={onClose}>
          <motion.div
            className="bill-modal address-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bill-header">
              <span className="weight-600">Delivery Details</span>
              <span className="cursor-pointer" onClick={onClose}>
                <X size={16} />
              </span>
            </div>

            <div className="">
              {/* City */}
              <div className="input-group">
                <label>City</label>
                <input
                  list="cities"
                  className="sec-mid-btn"
                  placeholder="Select or type city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <datalist id="cities">
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Pincode */}
              <div className="input-group">
                <label>Pincode</label>
                <input
                  className="sec-mid-btn"
                  placeholder="6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              {/* Address */}
              <div className="input-group">
                <label>Full Address</label>
                <textarea
                  className="sec-mid-btn textarea"
                  placeholder="House no, street, area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Quick Delivery */}
              <div className="bill-row">
                <label className="flex gap-8 items-center">
                  <input
                    type="checkbox"
                    checked={quickDelivery}
                    onChange={(e) => setQuickDelivery(e.target.checked)}
                  />
                  Quick Delivery {"(30 - 60 mins)"}
                </label>
                {quickDelivery && <span className="green">₹{extraCharge}</span>}
              </div>

              <div className="bill-row total">
                <span className="font-16">Total Payable</span>
                <span className="font-16">₹{finalPayable + extraCharge}</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-row gap-12 items-start">
                {/* Pay Now */}
                <LoadingButton
                  className="sec-big-btn width100"
                  onClick={() => setShowPayment(true)}
                >
                  <p>Pay Now</p>
                  <span className="font-10 dark-50">No extra charges</span>
                </LoadingButton>

                {/* Pay at Delivery */}
                <LoadingButton
                  className="pri-big-btn width100 flex flex-col"
                  onClick={handleSubmit}
                >
                  <p>Pay at Delivery</p>
                  <span className="font-10">50% advance + ₹100</span>
                </LoadingButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
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
              {/* Header */}
              <div className="bill-header">
                <span className="weight-600">Pay via UPI</span>
                <span onClick={() => setShowPayment(false)}>
                  <X size={16} />
                </span>
              </div>

              {/* QR Section */}
              <div className="flex flex-col items-center gap-16">
                <motion.div
                  className="qr-wrapper"
                  animate={{ filter: qrUnlocked ? "blur(0px)" : "blur(12px)" }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/books1/uskillbook.png"
                    alt="UPI QR"
                    width={350}
                    height={420}
                  />

                  {/* UPI Actions */}
                  <div className="flex flex-row items-center justify-center gap-8">
                    <button
                      className="sec-mid-btn flex flex-row gap-8"
                      onClick={() => {
                        navigator.clipboard.writeText(UPI_ID);
                        setUpiCopied(true);
                      }}
                    >
                      <Copy size={16} />
                      {UPI_ID}
                    </button>

                    <button
                      className="sec-mid-btn flex flex-row gap-8"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = "/books1/uskillbook.png";
                        link.download = "upi-qr.png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download size={16} /> Save QR Code
                    </button>
                  </div>
                  {/* Instructions */}
                  <div className="qr-instructions flex items-center">
                    <span className="font-12" style={{ textAlign: "center" }}>
                      Pay using any UPI app by copying the UPI ID or downloading
                      the QR image and scanning it.
                    </span>
                  </div>
                </motion.div>

                {!qrUnlocked && (
                  <button
                    className="pri-big-btn"
                    onClick={() => setQrUnlocked(true)}
                  >
                    Reveal QR Code
                  </button>
                )}

                {qrUnlocked && (
                  <div className="width100 flex flex-col gap-8 items-center">
                    <span className="font-12">
                      Complete payment and wait to verify
                    </span>
                    <div className="flex flex-row gap-4">
                      <button
                        className={`pri-big-btn width100 ${!canVerify ? "disabled-btn" : ""}`}
                        disabled={!canVerify}
                        onClick={() => {
                          handleWhatsAppCheckout({
                            city,
                            pincode,
                            address,
                            quickDelivery,
                            extraCharge,
                            payment: "UPI",
                          });
                        }}
                      >
                        {canVerify
                          ? "Verify after payment"
                          : `Verify in ${verifyTimer}s`}
                      </button>
                      <div className="timer-circle">{verifyTimer}s</div>
                    </div>
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
