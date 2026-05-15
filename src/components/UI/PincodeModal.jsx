"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, MapPin, Truck, ShieldCheck, Clock, Phone } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";
import { useTrackView } from "@/lib/trackingHooks";

const PINCODE_STORAGE_KEY = "pincode_modal_last_shown";
const PINCODE_DATA_KEY = "user_pincode";

export default function PincodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Track modal view when opened
  useTrackView(EVENTS.PINCODE_MODAL_VIEWED, {}, isOpen);

  // Check if modal should be shown (once every 24 hours)
  useEffect(() => {
    const checkAndShowModal = () => {
      const lastShown = localStorage.getItem(PINCODE_STORAGE_KEY);
      const savedPincode = localStorage.getItem(PINCODE_DATA_KEY);

      // If user already submitted pincode before, don't show modal
      if (savedPincode) {
        // Track that pincode was auto-filled from storage
        trackFunnelEvent(EVENTS.PINCODE_AUTO_FILLED, {
          source: "localStorage",
          has_pincode: true,
        });
        return;
      }

      if (lastShown) {
        const lastShownTime = parseInt(lastShown, 10);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - lastShownTime) / (1000 * 60 * 60);

        if (hoursPassed >= 24) {
          setIsOpen(true);
          setStartTime(Date.now());
        }
      } else {
        // First time visitor
        setIsOpen(true);
        setStartTime(Date.now());
      }
    };

    const timer = setTimeout(checkAndShowModal, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Send data to Telegram
  const sendToTelegram = async (pincodeValue, location, phone) => {
    const message = `
📍 *New Pincode Submission*

━━━━━━━━━━━━━━━━━━━━
📮 *Pincode:* ${pincodeValue}
🏙️ *City:* ${location?.city || "Unknown"}
🗺️ *State:* ${location?.state || "Unknown"}
📞 *Phone:* ${phone || "Not provided"}
🕐 *Time:* ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━
*TheBookX Pincode Collection*
    `;

    try {
      await fetch("https://api.journalx.app/api/bookxTelegram/pincode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          pincode: pincodeValue,
          city: location?.city,
          state: location?.state,
          phone: phone,
        }),
      });
    } catch (error) {
      console.error("Error sending to Telegram:", error);
    }
  };

  // Fetch location details based on pincode
  const fetchLocationDetails = async (pincodeValue) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincodeValue}`,
      );
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.District,
          state: postOffice.State,
          country: "India",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching location:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      trackFunnelEvent(EVENTS.PINCODE_SUBMITTED, {
        status: "error",
        error_reason: "invalid_pincode",
        pincode_length: pincode.length,
      });
      return;
    }

    setLoading(true);
    setError("");

    const location = await fetchLocationDetails(pincode);
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : null;

    // Track successful submission
    trackFunnelEvent(EVENTS.PINCODE_SUBMITTED, {
      status: "success",
      pincode: pincode,
      city: location?.city,
      state: location?.state,
      phone_provided: !!phoneNumber,
      time_spent_seconds: timeSpent,
      is_manual_entry: true,
    });

    // Send to Telegram
    await sendToTelegram(pincode, location, phoneNumber);

    // Store in localStorage
    localStorage.setItem(
      PINCODE_DATA_KEY,
      JSON.stringify({
        pincode: pincode,
        city: location?.city,
        state: location?.state,
        phone: phoneNumber,
        submittedAt: Date.now(),
      }),
    );

    localStorage.setItem(PINCODE_STORAGE_KEY, Date.now().toString());

    setLocationData(location);
    setLoading(false);

    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  };

  const handleSkip = () => {
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : null;

    trackFunnelEvent(EVENTS.PINCODE_SKIPPED, {
      time_spent_seconds: timeSpent,
      has_pincode_input: !!pincode,
      has_phone_input: !!phoneNumber,
    });

    localStorage.setItem(PINCODE_STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  // Track when user starts typing pincode
  const handlePincodeChange = (value) => {
    const newValue = value.replace(/\D/g, "");
    setPincode(newValue);
    setError("");

    if (newValue.length === 6) {
      trackFunnelEvent(EVENTS.PINCODE_MANUAL_ENTRY, {
        pincode_complete: true,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bill-modal-overlay"
          style={{ maxWidth: "980px", margin: "0 auto" }}
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bill-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bill-header">
              <span className="weight-600 font-16">📍 Share Your Location</span>
              <span className="cursor-pointer" onClick={handleSkip}>
                <X size={16} />
              </span>
            </div>

            <div className="address-form-content">
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <MapPin size={14} />
                  Enter Pincode <span className="red">*</span>
                </label>
                <input
                  className={`sec-mid-btn ${error ? "error-border" : ""}`}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
                {error && (
                  <span className="font-12 red flex items-center gap-4 mt-4">
                    <span>⚠️</span>
                    {error}
                  </span>
                )}
              </div>

              {/* Optional Phone Number Field */}
              <div className="input-group">
                <label className="flex flex-row gap-4 flex-center items-center">
                  <Phone size={14} />
                  Phone Number <span className="gray-500">(Optional)</span>
                </label>
                <input
                  className="sec-mid-btn"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                />
                <span className="font-10 gray-500 mt-4">
                  Get notified about special offers and delivery updates
                </span>
              </div>

              {/* Benefits Section */}
              <div className="delivery-info-section mt-12">
                <div className="flex flex-col gap-8 p-12 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-8">
                    <Truck size={18} className="green" />
                    <span className="font-12">Check delivery availability</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <Clock size={18} className="green" />
                    <span className="font-12">Estimated delivery time</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <ShieldCheck size={18} className="green" />
                    <span className="font-12">Better recommendations</span>
                  </div>
                </div>
              </div>

              <div className="dashed-border my-12"></div>

              {/* Buttons */}
              <div className="flex flex-col gap-12 mt-16">
                <LoadingButton
                  className="pri-big-btn width100"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </LoadingButton>

                <button className="sec-mid-btn width100" onClick={handleSkip}>
                  Skip for now
                </button>
              </div>

              {locationData && (
                <div className="flex flex-row flex-center gap-4 green items-center infoMessage mt-12">
                  <span>✓</span>
                  <span className="font-12">
                    Delivery available to {locationData.city},{" "}
                    {locationData.state}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
