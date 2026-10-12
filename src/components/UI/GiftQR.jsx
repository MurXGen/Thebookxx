"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Designful QR for gift orders — scanning opens the order link with the surprise
 * message. Rendered in festive maroon on a card with a ribbon + hint. The note
 * itself is NOT shown anywhere else for gift orders (only revealed via scan).
 */
export default function GiftQR({ value, size = 120, caption }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#7a1020", light: "#ffffff" },
    })
      .then((d) => alive && setSrc(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [value, size]);

  return (
    <div className="giftqr-card">
      <span className="giftqr-ribbon">🎁 Surprise inside</span>
      <div className="giftqr-frame">
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt="Scan to reveal the gift message"
            width={size}
            height={size}
            className="giftqr-img"
          />
        ) : (
          <div className="giftqr-ph" style={{ width: size, height: size }} />
        )}
      </div>
      <span className="giftqr-hint">{caption || "Scan to reveal the message"}</span>
    </div>
  );
}
