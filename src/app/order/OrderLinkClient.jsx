"use client";

// Lands an order link (from an AI assistant or a shared message): puts the
// books in the bag, saves the delivery details (city/state looked up from the
// pincode) and opens checkout — straight to "Choose payment method" when every
// detail is there. Nothing is ordered until the shopper picks a payment.

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { parseBooksParam, cleanPhone } from "@/lib/agentOrder";

async function lookupPin(pin) {
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const d = await r.json();
    const po = d?.[0]?.Status === "Success" ? d[0].PostOffice?.[0] : null;
    return po ? { city: po.District || "", state: po.State || "", area: po.Name || "" } : null;
  } catch {
    return null;
  }
}

export default function OrderLinkClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCart, addToCart } = useStore();
  const [status, setStatus] = useState({ step: "loading", msg: "" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const { items, unknown, notes } = parseBooksParam(params.get("books"));
      if (!items.length) {
        setStatus({
          step: "error",
          msg: unknown.length
            ? `We couldn't find: ${unknown.join(", ")}.`
            : "This link has no books in it.",
        });
        return;
      }

      // Fresh bag with exactly the linked books.
      clearCart();
      items.forEach(({ book, qty }) => {
        for (let i = 0; i < qty; i++) addToCart(book.id);
      });

      // Delivery details → the same draft the checkout form restores from.
      const pincode = String(params.get("pincode") || "").replace(/\D/g, "").slice(0, 6);
      const loc = pincode.length === 6 ? await lookupPin(pincode) : null;
      let prev = {};
      try {
        prev = JSON.parse(localStorage.getItem("checkoutAddress") || "{}") || {};
      } catch {
        /* ignore */
      }
      const draft = {
        ...prev,
        name: (params.get("name") || prev.name || "").trim(),
        phone: cleanPhone(params.get("phone") || prev.phone || ""),
        pincode: pincode || prev.pincode || "",
        address: (params.get("address") || prev.address || "").trim(),
        city: loc?.city || prev.city || "",
        district: loc?.city || prev.district || "",
        state: loc?.state || prev.state || "",
        area: loc?.area || prev.area || "",
        fasterDelivery: true,
      };
      const email = (params.get("email") || "").trim();
      try {
        localStorage.setItem("checkoutAddress", JSON.stringify(draft));
        if (email) localStorage.setItem("checkoutEmail", email);
        if (draft.pincode) {
          localStorage.setItem("delivery_pincode", draft.pincode);
          if (draft.city) localStorage.setItem("delivery_city", draft.city);
        }
        localStorage.setItem(
          "tbx_order_link",
          JSON.stringify({ at: Date.now(), src: params.get("src") || params.get("utm_source") || "link" }),
        );
      } catch {
        /* storage blocked — checkout will just ask again */
      }

      if (unknown.length || notes.length)
        setStatus({ step: "note", msg: [...notes, unknown.length ? `Not found: ${unknown.join(", ")}` : ""].filter(Boolean).join(" · ") });

      // Let the bag save, then open checkout.
      setTimeout(() => router.replace("/bag?checkout=1"), unknown.length || notes.length ? 1600 : 400);
    })();
  }, [params, router, clearCart, addToCart]);

  return (
    <main className="olink">
      {status.step === "error" ? (
        <div className="olink-card">
          <AlertCircle size={28} className="olink-err-ic" />
          <b>That order link didn&apos;t work</b>
          <p>{status.msg}</p>
          <Link href="/books" className="pri-big-btn">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="olink-card">
          <Loader2 size={28} className="lb-spinner olink-spin" />
          <b>Setting up your order…</b>
          <p>Adding your books and delivery details.</p>
          {status.step === "note" && <p className="olink-note">{status.msg}</p>}
        </div>
      )}
    </main>
  );
}
