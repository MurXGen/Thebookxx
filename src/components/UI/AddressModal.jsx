"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingButton from "./LoadingButton";
import { X } from "lucide-react";
import Image from "next/image";

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

  const UPI_ID = "yourupi@upi";

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
          <motion.div className="bill-modal-overlay">
            <motion.div
              className="bill-modal payment-modal"
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
                    src="/upi-qr.png"
                    alt="UPI QR"
                    width={220}
                    height={220}
                  />
                </motion.div>

                {!qrUnlocked && (
                  <button
                    className="pri-mid-btn"
                    onClick={() => setQrUnlocked(true)}
                  >
                    Reveal QR Code
                  </button>
                )}

                {/* UPI ID */}
                <div className="flex flex-col items-center gap-6">
                  <span className="font-12 dark-50">UPI ID</span>

                  <button
                    className="sec-mid-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(UPI_ID);
                      setUpiCopied(true);
                    }}
                  >
                    {UPI_ID}
                  </button>
                </div>

                {/* Save QR */}
                <a href="/upi-qr.png" download className="sec-mid-btn">
                  Save QR Code
                </a>

                {/* Open UPI */}
                <LoadingButton
                  className="pri-big-btn"
                  disabled={!upiCopied}
                  onClick={() => {
                    window.location.href = "upi://pay";
                    setReturnedFromUpi(true);
                  }}
                >
                  Open UPI Apps
                </LoadingButton>

                {/* After return */}
                {returnedFromUpi && (
                  <button
                    className="tertiary-btn"
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
                    Submit Order Details
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      ;
    </AnimatePresence>
  );
}
