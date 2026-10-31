// app/escrow/layout.js
import "./escrow.css";

export const metadata = {
  title: "Escrow — safe two-party deals",
  description:
    "Create or join a TBX escrow: agree on terms, add proof links, and let our team verify before the deal is marked complete.",
  robots: { index: false, follow: false },
};

export default function EscrowLayout({ children }) {
  return children;
}
