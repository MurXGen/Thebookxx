// components/UI/CountdownTimer.jsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getRemainingOfferTime, getOneRupeeOfferData } from "@/utils/book";

export default function CountdownTimer({ onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const remaining = getRemainingOfferTime();
      setTimeLeft(remaining);

      if (remaining <= 0 && onExpire) {
        onExpire();
      }
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (timeLeft <= 0) return null;

  return (
    <div className="countdown-timer">
      <div className="timer-icon">
        <Clock size={20} />
      </div>
      <div className="timer-text">
        <span className="timer-label">Offer expires in</span>
        <span className="timer-value">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
}
