"use client";

import { saveOrder } from "@/utils/indexDB";
import { books } from "@/utils/book";
import {
  CART_OFFERS,
  getDeliveryCharge,
  getDeliveryLabel,
  getOriginalCharge,
  getDeliveryDescription,
} from "@/utils/cartOffers";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  Clock,
  Bell,
  Send,
  MapPin,
  Calendar,
  Plus,
  X,
  Phone,
  Zap,
  Download,
  Gift,
  AlertTriangle,
  FileText,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const safelyParseOrderData = (orderParam) => {
  try {
    let decoded = decodeURIComponent(orderParam);
    decoded = decoded
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"');
    return JSON.parse(decoded);
  } catch (e) {
    console.error("First parse attempt failed:", e);
    try {
      let fixed = decodeURIComponent(orderParam);
      fixed = fixed.replace(/\n/g, "\\n");
      fixed = fixed.replace(/\r/g, "\\r");
      fixed = fixed.replace(/([^\\])\\n/g, "$1\\\\n");
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Second parse attempt failed:", e2);
      try {
        const decoded = decodeURIComponent(orderParam);
        const parsed = new Function("return (" + decoded + ")")();
        return parsed;
      } catch (e3) {
        console.error("All parse attempts failed:", e3);
        return null;
      }
    }
  }
};

// Reasons available when "Unable to Deliver" is checked.
// `key` is stored in localStorage; `label` shown in UI; `message` is used in the
// WhatsApp reminder body.
const UNABLE_TO_DELIVER_REASONS = [
  {
    key: "address_mismatch",
    label: "Address mismatch or incomplete",
    message:
      "the delivery address provided seems incomplete or doesn't match the location. Could you please share the correct, complete address (including landmark) so we can re-attempt delivery?",
  },
  {
    key: "number_mismatch",
    label: "Phone number not reachable / wrong",
    message:
      "the courier was unable to reach you on the contact number provided. Could you please share an alternate working number so we can coordinate the re-delivery?",
  },
  {
    key: "customer_unavailable",
    label: "Customer not available",
    message:
      "the courier visited your address but you were not available to receive the order. Could you please share a time slot when someone will be at the address so we can re-attempt delivery?",
  },
  {
    key: "address_not_found",
    label: "Address not found by courier",
    message:
      "the courier couldn't locate the delivery address. Could you please share a Google Maps link or a clearer landmark so the re-delivery goes smoothly?",
  },
  {
    key: "customer_refused",
    label: "Customer refused to accept",
    message:
      "the courier informed us that the package was refused at the time of delivery. Could you let us know if there's an issue we can help resolve, or if you'd like us to re-attempt the delivery?",
  },
  {
    key: "other",
    label: "Other reason",
    message:
      "the delivery couldn't be completed. Could you please reach out so we can sort this out and schedule a re-delivery at your convenience?",
  },
];

export default function ViewBagClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [parseError, setParseError] = useState(false);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderStatus, setOrderStatus] = useState({
    isShipped: false,
    isOutForDelivery: false, // NEW
    isDelivered: false,
    advancePaid: false,
    isUnableToDeliver: false, // NEW
    unableToDeliverReason: "", // NEW — stores the reason key
  });
  const [trackingId, setTrackingId] = useState("");
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [savedTrackingId, setSavedTrackingId] = useState("");
  const [alternativeNumbers, setAlternativeNumbers] = useState([]);
  const [showAlternativeInput, setShowAlternativeInput] = useState(false);
  const [newAlternativeNumber, setNewAlternativeNumber] = useState("");
  const [showNumberSelection, setShowNumberSelection] = useState(false);
  const [pendingMessageType, setPendingMessageType] = useState(null);
  const [standardDeliveryCharge, setStandardDeliveryCharge] = useState(0);
  const [fasterDeliveryCharge, setFasterDeliveryCharge] = useState(0);
  const [isFasterDelivery, setIsFasterDelivery] = useState(false);
  const [giftWrapCharge, setGiftWrapCharge] = useState(0);
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [codHandlingFee, setCodHandlingFee] = useState(0);
  const [standardOriginalCharge, setStandardOriginalCharge] = useState(null);
  const [fasterOriginalCharge, setFasterOriginalCharge] = useState(null);
  const [totalDiscounted, setTotalDiscounted] = useState(0);
  const [finalPayable, setFinalPayable] = useState(0);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerLabel, setOfferLabel] = useState(null);

  const itemsParam = searchParams.get("items");

  // Parse cartBooks FIRST (before any conditional returns)
  const cartBooks = itemsParam
    ? itemsParam
        .split(",")
        .map((entry) => {
          const [id, qty] = entry.split(":");
          const book = books.find((b) => b.id === id);
          if (!book || !qty) return null;
          return {
            ...book,
            qty: Math.max(1, Number(qty)),
          };
        })
        .filter(Boolean)
    : [];

  if (!itemsParam) {
    return (
      <div className="section-1200 flex flex-col gap-12 items-center">
        <h2>Invalid or expired bag link</h2>
        <button onClick={() => router.push("/")} className="pri-big-btn">
          Browse Books
        </button>
      </div>
    );
  }

  if (!cartBooks.length) {
    return (
      <div className="section-1200">
        <h2>No valid books found</h2>
      </div>
    );
  }

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const orderParam = searchParams.get("order");

    if (orderParam) {
      try {
        const parsedOrder = JSON.parse(orderParam);

        setOrderData(parsedOrder);
        setIsFasterDelivery(parsedOrder.fasterDelivery || false);
        setIsGiftWrap(parsedOrder.giftWrap || false);
        setGiftWrapCharge(parsedOrder.giftWrapCharge || 0);
        setCodHandlingFee(parsedOrder.codHandlingFee || 0);

        if (parsedOrder.totalDiscounted) {
          setTotalDiscounted(parsedOrder.totalDiscounted);
        }

        if (parsedOrder.deliveryCharge !== undefined) {
          if (parsedOrder.fasterDelivery) {
            setFasterDeliveryCharge(parsedOrder.deliveryCharge);
          } else {
            setStandardDeliveryCharge(parsedOrder.deliveryCharge);
          }
        }

        const savedStatus = localStorage.getItem(
          `order_status_${parsedOrder.orderId}`,
        );
        if (savedStatus) {
          // Merge with default to backfill new fields for older saved data
          const parsed = JSON.parse(savedStatus);
          setOrderStatus((prev) => ({ ...prev, ...parsed }));
        }

        const savedTracking = localStorage.getItem(
          `tracking_id_${parsedOrder.orderId}`,
        );
        if (savedTracking) {
          setSavedTrackingId(savedTracking);
        }

        const savedNumbers = localStorage.getItem(
          `alternative_numbers_${parsedOrder.orderId}`,
        );
        if (savedNumbers) {
          setAlternativeNumbers(JSON.parse(savedNumbers));
        }

        setLoading(false);
        setParseError(false);
      } catch (e) {
        console.error("Failed to parse order data:", e);
        try {
          let fixedOrder = orderParam;
          fixedOrder = fixedOrder
            .replace(/[\n\r\t]/g, " ")
            .replace(/\s+/g, " ");
          fixedOrder = fixedOrder.replace(/\\n/g, " ").replace(/\\r/g, " ");
          const recoveredOrder = JSON.parse(fixedOrder);
          setOrderData(recoveredOrder);
          setParseError(false);
        } catch (e2) {
          console.error("Recovery also failed:", e2);
          setParseError(true);
        }
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const exportToCOList = async () => {
    if (!orderData || !cartBooks.length) {
      console.error("Missing order data or cart books");
      return;
    }

    const deliveryCharge = getDeliveryChargeValue();

    const isCOD =
      (orderData.paymentMethod || "").toLowerCase().includes("cod") ||
      (orderData.paymentMethod || "").toLowerCase().includes("cash");

    const advanceAmount = orderData.advanceAmount || 99;

    let codAmount = 0;
    if (isCOD) {
      codAmount = orderStatus.advancePaid
        ? Math.max(0, totalWithDelivery - advanceAmount)
        : totalWithDelivery;
    }

    const orderToSave = {
      orderId: orderData.orderId,
      name: orderData.name || "",
      phone: orderData.phone || "",
      address: orderData.address || "",
      city: orderData.city || "",
      district: orderData.district || "",
      state: orderData.state || "",
      pincode: orderData.pincode || "",
      paymentMethod: orderData.paymentMethod || "",
      isCOD,
      advanceAmount,
      codAmount,
      isFasterDelivery: isFasterDelivery,
      isGiftWrap: isGiftWrap,
      deliveryCharge: deliveryCharge,
      giftWrapCharge: giftWrapCharge,
      totalAmount: totalWithDelivery,
      orderDate: orderData.orderDate || new Date().toISOString(),
      trackingId: savedTrackingId,
      status: {
        advancePaid: orderStatus.advancePaid,
        isShipped: orderStatus.isShipped,
        isOutForDelivery: orderStatus.isOutForDelivery,
        isDelivered: orderStatus.isDelivered,
        isUnableToDeliver: orderStatus.isUnableToDeliver,
        unableToDeliverReason: orderStatus.unableToDeliverReason,
      },
      books: cartBooks.map((book) => ({
        name: book.name,
        quantity: book.qty,
        price: book.discountedPrice,
        total: book.discountedPrice * book.qty,
      })),
      alternativeNumbers: alternativeNumbers,
    };

    try {
      await saveOrder(orderToSave);
      alert("Order saved to COList successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Please try again.");
    }
  };

  const totalDiscountedValue = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const getAppliedOffer = (amount) => {
    return [...CART_OFFERS].reverse().find((o) => amount >= o.target) || null;
  };

  const appliedOffer = getAppliedOffer(totalDiscountedValue);

  let offerDiscountValue = 0;
  let offerLabelValue = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscountValue = appliedOffer.value;
      offerLabelValue = `₹${appliedOffer.value} OFF`;
    }
    if (appliedOffer.type === "percentage") {
      offerDiscountValue = Math.round(
        (totalDiscountedValue * appliedOffer.value) / 100,
      );
      offerLabelValue = "Free delivery 🚚";
    }
  }

  const finalPayableValue = totalDiscountedValue - offerDiscountValue;

  const standardCharge = getDeliveryCharge(totalDiscountedValue, false);
  const fasterCharge = getDeliveryCharge(totalDiscountedValue, true);
  const standardLabel = getDeliveryLabel(totalDiscountedValue, false);
  const fasterLabel = getDeliveryLabel(totalDiscountedValue, true);
  const standardOriginal = getOriginalCharge(totalDiscountedValue, false);
  const fasterOriginal = getOriginalCharge(totalDiscountedValue, true);

  const getDeliveryChargeValue = () => {
    if (orderData?.deliveryCharge !== undefined) {
      return orderData.deliveryCharge;
    }
    if (isFasterDelivery) {
      return fasterCharge;
    }
    return standardCharge;
  };

  const deliveryCharge = getDeliveryChargeValue();
  const totalWithDelivery =
    finalPayableValue + deliveryCharge + giftWrapCharge + codHandlingFee;

  const getDeliveryChargeDisplay = () => {
    if (isFasterDelivery) return fasterCharge;
    return standardCharge;
  };

  const getDeliveryLabelDisplay = () => {
    if (isFasterDelivery) return fasterLabel;
    return standardLabel;
  };

  const getOriginalChargeDisplay = () => {
    if (isFasterDelivery) return fasterOriginal;
    return standardOriginal;
  };

  // Generic helper — persist the new orderStatus to localStorage
  const persistStatus = (newStatus) => {
    setOrderStatus(newStatus);
    if (orderData) {
      localStorage.setItem(
        `order_status_${orderData.orderId}`,
        JSON.stringify(newStatus),
      );
    }
  };

  const handleStatusUpdate = (field, value) => {
    persistStatus({ ...orderStatus, [field]: value });
  };

  // Toggle "Unable to Deliver" — when turning OFF, clear the reason too
  const handleUnableToDeliverToggle = (checked) => {
    persistStatus({
      ...orderStatus,
      isUnableToDeliver: checked,
      unableToDeliverReason: checked ? orderStatus.unableToDeliverReason : "",
    });
  };

  const handleReasonChange = (reasonKey) => {
    persistStatus({
      ...orderStatus,
      unableToDeliverReason: reasonKey,
    });
  };

  const handleSaveTrackingId = () => {
    if (trackingId.trim()) {
      setSavedTrackingId(trackingId);
      localStorage.setItem(`tracking_id_${orderData?.orderId}`, trackingId);
      setShowTrackingInput(false);
      setTrackingId("");
    }
  };

  const handleSaveAlternativeNumber = () => {
    if (
      newAlternativeNumber.trim() &&
      /^\d{10}$/.test(newAlternativeNumber.trim())
    ) {
      const updatedNumbers = [
        ...alternativeNumbers,
        newAlternativeNumber.trim(),
      ];
      setAlternativeNumbers(updatedNumbers);
      localStorage.setItem(
        `alternative_numbers_${orderData?.orderId}`,
        JSON.stringify(updatedNumbers),
      );
      setNewAlternativeNumber("");
      setShowAlternativeInput(false);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handleDeleteAlternativeNumber = (indexToDelete) => {
    const updatedNumbers = alternativeNumbers.filter(
      (_, index) => index !== indexToDelete,
    );
    setAlternativeNumbers(updatedNumbers);
    localStorage.setItem(
      `alternative_numbers_${orderData?.orderId}`,
      JSON.stringify(updatedNumbers),
    );
  };

  const handleRemindClick = (messageType) => {
    setPendingMessageType(messageType);
    setShowNumberSelection(true);
  };

  const downloadOrderCSV = () => {
    if (!orderData || !cartBooks.length) return;

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "District",
      "State",
      "Pincode",
      "Payment Method",
      "Delivery Type",
      "Delivery Charge",
      "Gift Wrap",
      "Gift Wrap Charge",
      "Order Date",
      "Total Amount",
    ];

    const row = [
      orderData.orderId || "N/A",
      orderData.name || "N/A",
      orderData.phone || "N/A",
      `"${orderData.address || "N/A"}"`,
      orderData.city || "N/A",
      orderData.district || "N/A",
      orderData.state || "N/A",
      orderData.pincode || "N/A",
      orderData.paymentMethod || "N/A",
      isFasterDelivery ? fasterLabel : standardLabel,
      deliveryCharge,
      isGiftWrap ? "Yes" : "No",
      giftWrapCharge,
      orderData.orderDate || new Date().toISOString(),
      totalWithDelivery,
    ];

    let csvContent = headers.join(",") + "\n";
    csvContent += row.join(",") + "\n\n";
    csvContent += "Order Items\n";
    csvContent += "Item Name,Quantity,Price,Total\n";
    cartBooks.forEach((book) => {
      csvContent += `"${book.name}",${book.qty},${book.discountedPrice},${book.discountedPrice * book.qty}\n`;
    });
    csvContent += "\nOrder Status\n";
    csvContent += `Advance Paid,${orderStatus.advancePaid ? "Yes" : "No"}\n`;
    csvContent += `Item Shipped,${orderStatus.isShipped ? "Yes" : "No"}\n`;
    csvContent += `Out for Delivery,${orderStatus.isOutForDelivery ? "Yes" : "No"}\n`;
    csvContent += `Item Delivered,${orderStatus.isDelivered ? "Yes" : "No"}\n`;
    csvContent += `Unable to Deliver,${orderStatus.isUnableToDeliver ? "Yes" : "No"}\n`;
    if (orderStatus.isUnableToDeliver && orderStatus.unableToDeliverReason) {
      const reasonObj = UNABLE_TO_DELIVER_REASONS.find(
        (r) => r.key === orderStatus.unableToDeliverReason,
      );
      csvContent += `Failure Reason,"${reasonObj?.label || orderStatus.unableToDeliverReason}"\n`;
    }
    csvContent += `Tracking ID,${savedTrackingId || "Not available"}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `order_${orderData.orderId}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===== Canvas-based Invoice Export =====
  // Draws an invoice on a hidden canvas and downloads it as PNG.
  // Pure canvas — no external libraries.
  const exportInvoice = () => {
    if (!orderData || !cartBooks.length) {
      alert("Order data not available");
      return;
    }

    // Brand colors (match design tokens)
    const COLORS = {
      bg: "#ffffff",
      text: "#0a0a0a",
      muted: "#6b7280",
      tertiary: "#fb8500",
      success: "#008f0c",
      border: "#e5e7eb",
      stripe: "#fafafa",
    };

    // Dynamic height — calculated based on item count
    const baseHeight = 700;
    const perItemHeight = 32;
    const extraForItems = Math.max(0, cartBooks.length - 3) * perItemHeight;
    const W = 800;
    const H = baseHeight + extraForItems + 200;

    const canvas = document.createElement("canvas");
    canvas.width = W * 2; // 2x for sharper output on retina
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);

    // Helpers
    const text = (str, x, y, opts = {}) => {
      ctx.font = opts.font || "14px Inter, system-ui, sans-serif";
      ctx.fillStyle = opts.color || COLORS.text;
      ctx.textAlign = opts.align || "left";
      ctx.textBaseline = opts.baseline || "alphabetic";
      ctx.fillText(str, x, y);
    };
    const line = (x1, y1, x2, y2, color = COLORS.border, width = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    const rect = (x, y, w, h, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
    };
    const wrapText = (str, x, y, maxWidth, lineHeight, opts = {}) => {
      ctx.font = opts.font || "14px Inter, system-ui, sans-serif";
      ctx.fillStyle = opts.color || COLORS.text;
      const words = String(str || "").split(" ");
      let line = "";
      let curY = y;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), x, curY);
          line = w + " ";
          curY += lineHeight;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), x, curY);
      return curY;
    };

    // Background
    rect(0, 0, W, H, COLORS.bg);

    // Header band — orange brand strip
    rect(0, 0, W, 8, COLORS.tertiary);

    let y = 60;

    // Brand + INVOICE
    text("TheBookX", 40, y, {
      font: "bold 30px Inter, sans-serif",
      color: COLORS.tertiary,
    });
    text("INVOICE", W - 40, y, {
      font: "bold 30px Inter, sans-serif",
      color: COLORS.text,
      align: "right",
    });

    y += 22;
    text("thebookx.in", 40, y, {
      font: "12px sans-serif",
      color: COLORS.muted,
    });
    text(`Order #${orderData.orderId || "—"}`, W - 40, y, {
      font: "12px sans-serif",
      color: COLORS.muted,
      align: "right",
    });

    y += 6;
    const orderDate = orderData.orderDate
      ? new Date(orderData.orderDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    text(`Date: ${orderDate}`, W - 40, y + 14, {
      font: "12px sans-serif",
      color: COLORS.muted,
      align: "right",
    });

    y += 36;
    line(40, y, W - 40, y);

    // BILL TO block
    y += 30;
    text("BILL TO", 40, y, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
    });
    y += 22;
    text(orderData.name || "Customer", 40, y, {
      font: "bold 16px sans-serif",
    });
    y += 22;
    text(`+91 ${orderData.phone || ""}`, 40, y, {
      font: "13px sans-serif",
      color: COLORS.muted,
    });
    y += 18;
    const fullAddr = [
      orderData.address,
      orderData.city,
      orderData.state,
      orderData.pincode ? `- ${orderData.pincode}` : "",
    ]
      .filter(Boolean)
      .join(", ");
    y = wrapText(fullAddr, 40, y, W - 80, 18, {
      font: "13px sans-serif",
      color: COLORS.text,
    });

    // PAYMENT / DELIVERY block — top right of bill-to row
    const payX = W - 40;
    let payY = y - 80;
    text("PAYMENT", payX, payY, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
      align: "right",
    });
    payY += 22;
    text(orderData.paymentMethod || "—", payX, payY, {
      font: "bold 14px sans-serif",
      align: "right",
    });
    payY += 20;
    text(
      isFasterDelivery ? "Faster Delivery" : "Standard Delivery",
      payX,
      payY,
      { font: "13px sans-serif", color: COLORS.muted, align: "right" },
    );

    y += 30;
    line(40, y, W - 40, y);

    // ITEMS table header
    y += 28;
    text("ITEMS", 40, y, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
    });
    text("QTY", 480, y, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
      align: "center",
    });
    text("PRICE", 600, y, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
      align: "right",
    });
    text("TOTAL", W - 40, y, {
      font: "bold 11px sans-serif",
      color: COLORS.muted,
      align: "right",
    });

    y += 12;
    line(40, y, W - 40, y);

    // ITEMS rows
    y += 12;
    cartBooks.forEach((book, idx) => {
      if (idx % 2 === 0) {
        rect(40, y - 4, W - 80, 28, COLORS.stripe);
      }
      const itemTotal = book.discountedPrice * book.qty;
      const nameTrimmed =
        book.name.length > 38 ? book.name.slice(0, 38) + "…" : book.name;
      text(nameTrimmed, 50, y + 14, { font: "13px sans-serif" });
      text(String(book.qty), 480, y + 14, {
        font: "13px sans-serif",
        align: "center",
      });
      text(`₹${book.discountedPrice}`, 600, y + 14, {
        font: "13px sans-serif",
        align: "right",
      });
      text(`₹${itemTotal}`, W - 50, y + 14, {
        font: "bold 13px sans-serif",
        align: "right",
      });
      y += 28;
    });

    y += 10;
    line(40, y, W - 40, y);

    // Bill summary — right-aligned
    y += 24;
    const subtotalAmt = totalDiscountedValue;
    const discountAmt = totalOriginal - totalDiscountedValue;
    const summaryRow = (label, value, opts = {}) => {
      text(label, 480, y, {
        font: opts.bold ? "bold 13px sans-serif" : "13px sans-serif",
        color: opts.color || COLORS.muted,
      });
      text(value, W - 40, y, {
        font: opts.bold ? "bold 13px sans-serif" : "13px sans-serif",
        color: opts.valueColor || opts.color || COLORS.text,
        align: "right",
      });
      y += 22;
    };

    summaryRow("Subtotal", `₹${totalOriginal}`);
    if (discountAmt > 0) {
      summaryRow("Discount", `-₹${discountAmt}`, {
        valueColor: COLORS.success,
      });
    }
    if (appliedOffer && offerDiscountValue > 0) {
      summaryRow(`Offer (${offerLabelValue})`, `-₹${offerDiscountValue}`, {
        valueColor: COLORS.success,
      });
    }
    summaryRow(
      isFasterDelivery ? "Faster Delivery" : "Standard Delivery",
      deliveryCharge > 0 ? `+₹${deliveryCharge}` : "FREE",
      { valueColor: deliveryCharge > 0 ? COLORS.text : COLORS.success },
    );
    if (isGiftWrap && giftWrapCharge > 0) {
      summaryRow("Gift Wrap", `+₹${giftWrapCharge}`);
    }
    if (codHandlingFee > 0) {
      summaryRow("COD Handling Fee", `+₹${codHandlingFee}`, {
        valueColor: COLORS.tertiary,
      });
    }

    y += 6;
    line(480, y, W - 40, y, COLORS.text, 2);
    y += 28;

    // TOTAL row — bold
    text("TOTAL", 480, y, { font: "bold 18px sans-serif" });
    text(`₹${totalWithDelivery}`, W - 40, y, {
      font: "bold 22px sans-serif",
      color: COLORS.tertiary,
      align: "right",
    });

    // Footer
    y += 50;
    line(40, y, W - 40, y);
    y += 28;
    text("Thank you for shopping with TheBookX!", W / 2, y, {
      font: "italic 13px sans-serif",
      color: COLORS.muted,
      align: "center",
    });
    y += 18;
    text("For any queries: support@thebookx.in  |  +91 77108 92108", W / 2, y, {
      font: "11px sans-serif",
      color: COLORS.muted,
      align: "center",
    });

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderData.orderId || Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const sendWhatsAppMessage = (phoneNumber, messageType) => {
    let message = "";
    let formattedNumber = phoneNumber;

    if (phoneNumber && !phoneNumber.startsWith("+")) {
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      if (cleanNumber.length === 10) {
        formattedNumber = `+91${cleanNumber}`;
      } else if (cleanNumber.length === 12 && cleanNumber.startsWith("91")) {
        formattedNumber = `+${cleanNumber}`;
      } else if (cleanNumber.length === 13 && cleanNumber.startsWith("91")) {
        formattedNumber = `+${cleanNumber}`;
      } else {
        formattedNumber = `+91${cleanNumber.slice(-10)}`;
      }
    }

    // ---- Shared building blocks for the new branded message format ----
    const customerName = orderData?.name || "there";
    const orderId = orderData?.orderId || "N/A";
    const itemsSummary = cartBooks
      .map((b) => `${b.name}${b.qty > 1 ? ` × ${b.qty}` : ""}`)
      .join(", ");
    const shippingAddress = orderData
      ? [
          orderData.address,
          orderData.city,
          orderData.state,
          orderData.pincode ? `- ${orderData.pincode}` : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    const orderStatusUrl = "https://thebookx.in/profile";
    const deliveryDays = isFasterDelivery ? "3-5" : "5-7";

    // The "Check Order Status" footer — appears on every message, mirrors the
    // CTA from the reference screenshot.
    const footer =
      `\n\n🔗 *Check Order Status:* ${orderStatusUrl}\n` +
      `\nReply STOP to unsubscribe`;

    if (messageType === "shipping") {
      // Order received, not yet shipped — mirrors the reference screenshot
      message = encodeURIComponent(
        `Hello ${customerName},\n\n` +
          `Your order has been successfully received.\n\n` +
          `*Order Details:*\n` +
          `Order ID: #${orderId}\n` +
          `Order Total: ₹${totalWithDelivery}\n` +
          `Items: ${itemsSummary || "Your items"}\n` +
          `Shipping Address: ${shippingAddress || "On file"}\n\n` +
          `You will be notified once your order is shipped.\n\n` +
          `_*Please re-check your address and let us know at the earliest in case of changes. Due to a high influx of orders, your order will be shipped in 3-4 days._` +
          footer,
      );
    } else if (messageType === "shipped") {
      message = encodeURIComponent(
        `Hello ${customerName},\n\n` +
          `Your order has been shipped! 🚚\n\n` +
          `*Order Details:*\n` +
          `Order ID: #${orderId}\n` +
          `Tracking ID: ${savedTrackingId || "Will share soon"}\n` +
          `Order Total: ₹${totalWithDelivery}\n` +
          `Items: ${itemsSummary || "Your items"}\n\n` +
          `Expected delivery in ${deliveryDays} business days.\n` +
          `Track your shipment: https://www.indiapost.gov.in\n\n` +
          `Happy reading! 📖✨` +
          footer,
      );
    } else if (messageType === "out_for_delivery") {
      message = encodeURIComponent(
        `Hello ${customerName},\n\n` +
          `Great news! Your order is *out for delivery* today. 🚚\n\n` +
          `*Order Details:*\n` +
          `Order ID: #${orderId}\n` +
          `Tracking ID: ${savedTrackingId || "Not available"}\n` +
          `Shipping Address: ${shippingAddress || "On file"}\n\n` +
          `Please keep your phone reachable so our delivery partner can contact you. ` +
          `If you're not available, kindly share an alternate number or a time slot.\n\n` +
          `Thank you for shopping with TheBookX!` +
          footer,
      );
    } else if (messageType === "unable_to_deliver") {
      const reasonObj = UNABLE_TO_DELIVER_REASONS.find(
        (r) => r.key === orderStatus.unableToDeliverReason,
      );
      const reasonBlurb =
        reasonObj?.message ||
        "the delivery couldn't be completed. Could you reach out so we can sort this out and re-attempt the delivery?";

      message = encodeURIComponent(
        `Hello ${customerName},\n\n` +
          `We tried to deliver your order today but ${reasonBlurb}\n\n` +
          `*Order Details:*\n` +
          `Order ID: #${orderId}\n` +
          `Tracking ID: ${savedTrackingId || "Not available"}\n\n` +
          `Please reply with the updated details and we'll arrange a re-delivery right away.\n\n` +
          `Thank you for your patience.\n— Team TheBookX` +
          footer,
      );
    }

    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
    setShowNumberSelection(false);
    setPendingMessageType(null);
  };

  const isCOD = orderData?.paymentMethod === "COD";
  const isUPI = orderData?.paymentMethod === "UPI";
  const originalCharge = getOriginalChargeDisplay();
  const deliverySavings = originalCharge ? originalCharge - deliveryCharge : 0;

  return (
    <section className="section-1200 flex flex-col gap-24">
      <div className="flex gap-12 items-center">
        <ArrowLeft
          size={20}
          onClick={() => router.push("/")}
          className="cursor-pointer"
        />
        <h2 className="font-16 weight-600">Order Details</h2>
      </div>

      {orderData && (
        <div className="flex flex-col gap-16">
          <h3 className="font-16 weight-600 mb-16">Customer Details</h3>

          <div className="grid-2 gap-12">
            <div>
              <span className="font-12 gray-500">Name</span>
              <p className="font-14 weight-500">
                {orderData.name || "Not provided"}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-12 gray-500">Address</span>
              <p className="font-14">{orderData.address}</p>
            </div>
            <div>
              <span className="font-12 gray-500">City</span>
              <p className="font-14">{orderData.city}</p>
            </div>
            <div>
              <span className="font-12 gray-500">District</span>
              <p className="font-14">{orderData.district}</p>
            </div>
            <div>
              <span className="font-12 gray-500">State</span>
              <p className="font-14">{orderData.state}</p>
            </div>
            <div>
              <span className="font-12 gray-500">Pincode</span>
              <p className="font-14">{orderData.pincode}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="font-12 gray-500">Phone Number</span>
              {!showAlternativeInput && (
                <button
                  onClick={() => setShowAlternativeInput(true)}
                  className="sec-mid-btn flex items-center gap-4"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                >
                  <Plus size={12} />
                  Add Alternative
                </button>
              )}
            </div>
            <p className="font-14 flex items-center gap-8 weight-500 mb-8">
              <Phone size={14} className="gray-500" />
              {orderData.phone ? `+91${orderData.phone}` : "Not provided"}{" "}
              (Primary)
            </p>

            {alternativeNumbers.length > 0 && (
              <div className="mt-8">
                {alternativeNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-8 mb-4 p-8 bg-gray-50 rounded-8"
                  >
                    <div className="flex items-center gap-8">
                      <Phone size={14} className="gray-500" />
                      <span className="font-14">+91{number}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAlternativeNumber(index)}
                      className="sec-mid-btn flex flex-row items-center"
                      style={{ color: "#dc2626" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAlternativeInput && (
              <div className="flex gap-8 mt-8">
                <input
                  type="tel"
                  className="sec-mid-btn flex-grow"
                  placeholder="Enter 10-digit mobile number"
                  value={newAlternativeNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setNewAlternativeNumber(e.target.value.replace(/\D/g, ""))
                  }
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleSaveAlternativeNumber}
                  className="pri-big-btn"
                  style={{ padding: "8px 16px" }}
                  disabled={!newAlternativeNumber.trim()}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAlternativeInput(false);
                    setNewAlternativeNumber("");
                  }}
                  className="sec-mid-btn"
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="dashed-border my-16"></div>

          <div className="flex flex-col">
            <h3 className="font-16 weight-600 mb-16">Payment & Delivery</h3>

            <div className="flex flex-col gap-12">
              <div className="flex justify-between items-center">
                <span className="font-14">Payment Method</span>
                <span className="font-14 weight-500">
                  {isCOD
                    ? "💵 Cash on Delivery"
                    : isUPI
                      ? "📱 UPI Payment"
                      : orderData.paymentMethod}
                </span>
              </div>

              {isGiftWrap && (
                <div className="flex justify-between items-center">
                  <span className="font-14">Gift Wrap</span>
                  <span className="font-14 weight-500 orange">
                    🎁 Included (+₹{giftWrapCharge})
                  </span>
                </div>
              )}

              {codHandlingFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-14">COD Handling Fee</span>
                  <span className="font-14 weight-500 orange">
                    💵 +₹{codHandlingFee}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-14">Delivery Type</span>
                <span
                  className={`font-14 weight-500 ${isFasterDelivery ? "orange" : "green"}`}
                >
                  {isFasterDelivery ? (
                    <span className="flex items-center gap-4">
                      <Zap size={14} />
                      {fasterLabel}
                    </span>
                  ) : (
                    <span className="flex items-center gap-4">
                      <Truck size={14} />
                      {standardLabel}
                    </span>
                  )}
                </span>
              </div>

              {deliveryCharge > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-14">
                    {totalDiscountedValue >= 799
                      ? "Handling Fee"
                      : "Delivery Charge"}
                  </span>
                  <div className="text-right">
                    <span
                      className={`font-14 weight-500 ${isFasterDelivery ? "orange" : "red"}`}
                    >
                      + ₹{deliveryCharge}
                    </span>
                  </div>
                </div>
              )}

              {deliveryCharge === 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-14">Delivery Charge</span>
                  <span className="font-14 weight-500 green">FREE</span>
                </div>
              )}

              {isCOD && (
                <div className="cod-section">
                  <label className="flex items-center gap-8 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orderStatus.advancePaid}
                      onChange={(e) =>
                        handleStatusUpdate("advancePaid", e.target.checked)
                      }
                      className="cursor-pointer"
                    />
                    <span className="font-14">Advance Paid</span>
                  </label>
                </div>
              )}

              {/* ===== Shipping status checkboxes ===== */}
              <div className="shipping-status-section mt-12">
                <label className="flex items-center gap-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orderStatus.isShipped}
                    onChange={(e) =>
                      handleStatusUpdate("isShipped", e.target.checked)
                    }
                    className="cursor-pointer"
                  />
                  <span className="font-14">Item Shipped</span>
                </label>

                {orderStatus.isShipped && (
                  <>
                    {/* NEW: Out for Delivery */}
                    <label className="flex items-center gap-8 mt-8 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderStatus.isOutForDelivery}
                        onChange={(e) =>
                          handleStatusUpdate(
                            "isOutForDelivery",
                            e.target.checked,
                          )
                        }
                        className="cursor-pointer"
                      />
                      <span className="font-14">Out for Delivery</span>
                    </label>

                    <label className="flex items-center gap-8 mt-8 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderStatus.isDelivered}
                        onChange={(e) =>
                          handleStatusUpdate("isDelivered", e.target.checked)
                        }
                        className="cursor-pointer"
                      />
                      <span className="font-14">Item Delivered</span>
                    </label>

                    {/* NEW: Unable to Deliver — only shown if not yet delivered */}
                    {!orderStatus.isDelivered && (
                      <div className="mt-12">
                        <label className="flex items-center gap-8 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={orderStatus.isUnableToDeliver}
                            onChange={(e) =>
                              handleUnableToDeliverToggle(e.target.checked)
                            }
                            className="cursor-pointer"
                          />
                          <span className="font-14 red flex items-center gap-4">
                            <AlertTriangle size={14} />
                            Unable to Deliver
                          </span>
                        </label>

                        {orderStatus.isUnableToDeliver && (
                          <div
                            className="mt-12 p-12"
                            style={{
                              background: "var(--tertiary-10, #fb850010)",
                              border: "1px solid var(--tertiary, #fb8500)",
                              borderRadius: "8px",
                            }}
                          >
                            <span className="font-12 weight-600 mb-8 block">
                              Select reason:
                            </span>
                            <div className="flex flex-col gap-4">
                              {UNABLE_TO_DELIVER_REASONS.map((r) => (
                                <label
                                  key={r.key}
                                  className="flex items-center gap-8 cursor-pointer"
                                  style={{ padding: "4px 0" }}
                                >
                                  <input
                                    type="radio"
                                    name="unable_reason"
                                    value={r.key}
                                    checked={
                                      orderStatus.unableToDeliverReason ===
                                      r.key
                                    }
                                    onChange={() => handleReasonChange(r.key)}
                                    style={{ accentColor: "#fb8500" }}
                                  />
                                  <span className="font-13">{r.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {orderStatus.isShipped && (
                <div className="tracking-section mt-16">
                  <div className="flex flex-col gap-12">
                    <div className="flex justify-between items-center">
                      <span className="font-14 weight-500">Tracking ID</span>
                      {!savedTrackingId && (
                        <button
                          onClick={() =>
                            setShowTrackingInput(!showTrackingInput)
                          }
                          className="sec-mid-btn font-12"
                          style={{ padding: "4px 12px" }}
                        >
                          Add Tracking ID
                        </button>
                      )}
                    </div>

                    {savedTrackingId ? (
                      <div className="flex items-center gap-8 p-12 bg-gray-50 rounded-8">
                        <MapPin size={16} className="green" />
                        <span className="font-14">{savedTrackingId}</span>
                      </div>
                    ) : showTrackingInput ? (
                      <div className="flex flex-col gap-8">
                        <div className="flex gap-8">
                          <input
                            type="text"
                            className="sec-mid-btn flex-grow"
                            placeholder="Enter tracking ID (e.g., SBK123456789)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button
                            onClick={handleSaveTrackingId}
                            className="pri-big-btn"
                            style={{ padding: "8px 16px" }}
                            disabled={!trackingId.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* ===== Reminder buttons (priority order) ===== */}
              <div className="reminder-buttons-section mt-16 flex flex-col gap-8">
                {/* Unable to Deliver — takes top priority when active */}
                {orderStatus.isUnableToDeliver &&
                  orderStatus.unableToDeliverReason && (
                    <button
                      onClick={() => handleRemindClick("unable_to_deliver")}
                      className="pri-big-btn width100 flex items-center justify-center gap-8"
                      style={{ background: "var(--danger, #ef4444)" }}
                    >
                      <AlertTriangle size={16} />
                      Notify Customer (Delivery Issue)
                      <Send size={14} />
                    </button>
                  )}

                {/* Out for Delivery */}
                {orderStatus.isOutForDelivery &&
                  !orderStatus.isDelivered &&
                  !orderStatus.isUnableToDeliver && (
                    <button
                      onClick={() => handleRemindClick("out_for_delivery")}
                      className="pri-big-btn width100 flex items-center justify-center gap-8"
                      style={{ background: "#2196F3" }}
                    >
                      <Truck size={16} />
                      Notify Customer (Out for Delivery)
                      <Send size={14} />
                    </button>
                  )}

                {/* Shipped */}
                {orderStatus.isShipped &&
                  !orderStatus.isOutForDelivery &&
                  savedTrackingId && (
                    <button
                      onClick={() => handleRemindClick("shipped")}
                      className="pri-big-btn width100 flex items-center justify-center gap-8"
                      style={{ background: "#25D366" }}
                    >
                      <Bell size={16} />
                      Remind Customer (Order Shipped)
                      <Send size={14} />
                    </button>
                  )}

                {/* Not yet shipped */}
                {!orderStatus.isShipped && (
                  <button
                    onClick={() => handleRemindClick("shipping")}
                    className="pri-big-btn width100 flex items-center justify-center gap-8"
                    style={{ background: "#FF9800" }}
                  >
                    <Calendar size={16} />
                    Remind Customer (Shipping in 1-2 days)
                    <Send size={14} />
                  </button>
                )}
              </div>

              {/* ===== Status timeline ===== */}
              <div className="status-timeline mt-16">
                <div className="flex items-center gap-8">
                  {orderStatus.advancePaid || isUPI ? (
                    <CheckCircle size={16} className="green" />
                  ) : (
                    <Clock size={16} className="gray-400" />
                  )}
                  <span className="font-12">
                    Payment{" "}
                    {orderStatus.advancePaid || isUPI ? "Received" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-8 mt-8">
                  {orderStatus.isShipped ? (
                    <Truck size={16} className="green" />
                  ) : (
                    <Clock size={16} className="gray-400" />
                  )}
                  <span className="font-12">
                    Order {orderStatus.isShipped ? "Shipped" : "Processing"}
                  </span>
                </div>

                {/* NEW: Out for Delivery row */}
                <div className="flex items-center gap-8 mt-8">
                  {orderStatus.isOutForDelivery ? (
                    <Truck size={16} className="green" />
                  ) : (
                    <Clock size={16} className="gray-400" />
                  )}
                  <span className="font-12">
                    {orderStatus.isOutForDelivery
                      ? "Out for Delivery"
                      : "Awaiting dispatch"}
                  </span>
                </div>

                <div className="flex items-center gap-8 mt-8">
                  {orderStatus.isDelivered ? (
                    <Package size={16} className="green" />
                  ) : (
                    <Clock size={16} className="gray-400" />
                  )}
                  <span className="font-12">
                    Order {orderStatus.isDelivered ? "Delivered" : "In Transit"}
                  </span>
                </div>

                {/* NEW: Unable to Deliver row (only shown if active) */}
                {orderStatus.isUnableToDeliver && (
                  <div className="flex items-center gap-8 mt-8">
                    <AlertTriangle size={16} className="red" />
                    <span className="font-12 red">
                      Unable to deliver
                      {orderStatus.unableToDeliverReason && (
                        <>
                          {" — "}
                          {
                            UNABLE_TO_DELIVER_REASONS.find(
                              (r) =>
                                r.key === orderStatus.unableToDeliverReason,
                            )?.label
                          }
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNumberSelection && (
        <div className="bill-modal-overlay">
          <div className="bill-modal">
            <div className="bill-header">
              <h3 className="font-18 weight-600">Select Phone Number</h3>
              <span
                onClick={() => setShowNumberSelection(false)}
                className="cursor-pointer"
              >
                <X size={20} />
              </span>
            </div>
            <p className="font-14 gray-500 mb-16">
              Choose which number to send the reminder to:
            </p>
            <div className="flex flex-col gap-8">
              <button
                onClick={() =>
                  sendWhatsAppMessage(orderData?.phone, pendingMessageType)
                }
                className="sec-mid-btn"
                style={{ textAlign: "left" }}
              >
                <Phone size={18} className="green" />
                <div>
                  <div className="font-14 weight-500">{orderData?.phone}</div>
                  <div className="font-12 gray-500">Primary Number</div>
                </div>
              </button>
              {alternativeNumbers.map((number, index) => (
                <button
                  key={index}
                  onClick={() =>
                    sendWhatsAppMessage(number, pendingMessageType)
                  }
                  className="sec-mid-btn"
                  style={{ textAlign: "left" }}
                >
                  <Phone size={18} className="blue" />
                  <div>
                    <div className="font-14 weight-500">{number}</div>
                    <div className="font-12 gray-500">Alternative Number</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <h3 className="font-16 weight-600 mt-16">
        Order Items ({cartBooks.length} books)
      </h3>

      <div className="grid-2">
        {cartBooks.map((book) => {
          const savings =
            book.originalPrice * book.qty - book.discountedPrice * book.qty;
          return (
            <article
              key={book.id}
              className="trending-card"
              itemScope
              itemType="https://schema.org/Product"
            >
              <div className="book-image-wrapper">
                {book.image ? (
                  <Image
                    src={book.image}
                    alt={`${book.name} book cover`}
                    width={150}
                    height={200}
                    className="book-image loaded"
                    style={{ objectFit: "cover" }}
                    itemProp="image"
                  />
                ) : (
                  <div className="book-image-placeholder">📘</div>
                )}
              </div>
              <div className="pad_16 flex flex-col gap-12 book-card">
                <h3 className="font-14 weight-500 dark-50" itemProp="name">
                  {book.name}
                </h3>
                <p className="font-12 dark-50">Quantity: {book.qty}</p>
                <div className="flex flex-row gap-24 justify-between book-content">
                  <div
                    className="flex flex-col width100"
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                  >
                    <div className="price-row">
                      <span className="discounted" itemProp="price">
                        ₹{book.discountedPrice * book.qty}
                      </span>
                      <span className="original">
                        ₹{book.originalPrice * book.qty}
                      </span>
                    </div>
                    <meta itemProp="priceCurrency" content="INR" />
                    {savings > 0 && (
                      <span className="green font-10">You save ₹{savings}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="viewbag-bill flex flex-col gap-8">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{totalOriginal}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>- ₹{totalOriginal - totalDiscountedValue}</span>
        </div>
        {appliedOffer && (
          <div className="flex justify-between green">
            <span>Offer Applied</span>
            <span>{offerLabelValue}</span>
          </div>
        )}
        {deliveryCharge > 0 && (
          <div
            className={`flex justify-between ${isFasterDelivery ? "orange" : "red"}`}
          >
            <span>
              {totalDiscountedValue >= 799 ? "Handling Fee" : "Delivery Charge"}{" "}
              {isFasterDelivery && "(Express)"}
            </span>
            <div className="text-right">
              <span>+ ₹{deliveryCharge}</span>
            </div>
          </div>
        )}
        {deliveryCharge === 0 && (
          <div className="flex justify-between green">
            <span>Delivery Charge</span>
            <span>FREE</span>
          </div>
        )}
        {isGiftWrap && giftWrapCharge > 0 && (
          <div className="flex justify-between orange">
            <span>🎁 Gift Wrap</span>
            <span>+ ₹{giftWrapCharge}</span>
          </div>
        )}
        {codHandlingFee > 0 && (
          <div className="flex justify-between orange">
            <span>💵 COD Handling Fee</span>
            <span>+ ₹{codHandlingFee}</span>
          </div>
        )}
        <hr />
        <div className="flex justify-between weight-600 font-16">
          <span>Total Payable</span>
          <span className="green font-20 weight-700">₹{totalWithDelivery}</span>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* Primary CTA — chat with support, prefilled with order context */}
        <a
          href={`https://wa.me/917710892108?text=${encodeURIComponent(
            `Hey hi 👋\n\nI need help with my order #${orderData?.orderId || "N/A"}.\n\nCould you please let me know when it will be shipped?\n\nThanks!`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pri-big-btn flex items-center justify-center gap-8"
          style={{ textAlign: "center" }}
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </a>

        {/* Export Invoice — canvas → PNG */}
        <button
          onClick={exportInvoice}
          className="sec-big-btn flex items-center justify-center gap-8"
          style={{ width: "100%" }}
        >
          <FileText size={18} />
          Export Invoice
        </button>

        {/* Export CSV */}
        <button
          onClick={downloadOrderCSV}
          className="sec-big-btn flex items-center justify-center gap-8"
          style={{ width: "100%" }}
        >
          <Download size={18} />
          Download Order Details (CSV)
        </button>
      </div>
    </section>
  );
}
