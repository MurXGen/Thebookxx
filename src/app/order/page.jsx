import { Suspense } from "react";
import OrderLinkClient from "./OrderLinkClient";

export const metadata = {
  title: "Your TheBookX order | Books from ₹1",
  description:
    "Your books and delivery details are ready. Review them and choose how to pay: UPI or Cash on Delivery.",
  robots: { index: false, follow: true },
};

export default function OrderLinkPage() {
  return (
    <Suspense fallback={null}>
      <OrderLinkClient />
    </Suspense>
  );
}
