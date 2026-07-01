import { ImageResponse } from "next/og";

// Branded social share card (1200×630). Replaces the previous favicon-as-OG bug
// so links shared on WhatsApp / Twitter / Facebook render a real preview.
export const runtime = "edge";
export const alt = "TheBookX — Buy Books Online in India, Starting at ₹1";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1306 60%, #fb8500 180%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#ffb703",
          }}
        >
          TheBookX
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 28,
            maxWidth: 940,
          }}
        >
          Buy Books Online in India, Starting at ₹1
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            marginTop: 30,
            color: "#e9edf4",
          }}
        >
          Free shipping · Cash on Delivery · Trusted by 50,000+ readers
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 26,
            color: "#ffb703",
            fontWeight: 600,
          }}
        >
          www.thebookx.in
        </div>
      </div>
    ),
    { ...size }
  );
}
