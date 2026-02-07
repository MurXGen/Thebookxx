"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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
    const totalAmount = finalPayable + extraCharge;

    const note = `
Hello
  `;

    const upiUrl = `upi://pay?pa=murthythevar@fifederal&pn=Thebookx&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

    window.location.href = upiUrl;

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
                ✕
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
              <div className="flex flex-row gap-12 items-center">
                <button className="sec-big-btn width100" onClick={resetForm}>
                  Reset
                </button>
                <button className="pri-big-btn width100" onClick={handleSubmit}>
                  Submit Order
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
