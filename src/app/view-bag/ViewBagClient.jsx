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
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const safelyParseOrderData = (orderParam) => {
  try {
    // First, decode the URI component
    let decoded = decodeURIComponent(orderParam);

    // Replace any escaped newlines and other problematic characters
    decoded = decoded
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"');

    // Parse the JSON
    return JSON.parse(decoded);
  } catch (e) {
    console.error("First parse attempt failed:", e);

    try {
      // Second attempt: Try to fix common JSON issues
      let fixed = decodeURIComponent(orderParam);

      // Fix unescaped newlines in strings
      fixed = fixed.replace(/\n/g, "\\n");
      fixed = fixed.replace(/\r/g, "\\r");

      // Fix any other problematic characters
      fixed = fixed.replace(/([^\\])\\n/g, "$1\\\\n");

      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Second parse attempt failed:", e2);

      try {
        // Third attempt: Use a more aggressive approach
        const decoded = decodeURIComponent(orderParam);
        // Use Function constructor as a fallback (safe since we control the input)
        const parsed = new Function("return (" + decoded + ")")();
        return parsed;
      } catch (e3) {
        console.error("All parse attempts failed:", e3);
        return null;
      }
    }
  }
};

export default function ViewBagClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [parseError, setParseError] = useState(false);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderStatus, setOrderStatus] = useState({
    isShipped: false,
    isDelivered: false,
    advancePaid: false,
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

  // Check for missing itemsParam AFTER cartBooks is defined
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
    console.log("Raw orderParam from useSearchParams:", orderParam);

    if (orderParam) {
      try {
        // The orderParam is already decoded by Next.js, so parse it directly
        const parsedOrder = JSON.parse(orderParam);

        console.log("Successfully parsed order:", parsedOrder.orderId);

        setOrderData(parsedOrder);
        setIsFasterDelivery(parsedOrder.fasterDelivery || false);
        setIsGiftWrap(parsedOrder.giftWrap || false);
        setGiftWrapCharge(parsedOrder.giftWrapCharge || 0);

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
          setOrderStatus(JSON.parse(savedStatus));
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
        console.error("Raw orderParam:", orderParam);

        // Try to fix common JSON issues
        try {
          let fixedOrder = orderParam;
          // Fix any unescaped newlines or control characters
          fixedOrder = fixedOrder
            .replace(/[\n\r\t]/g, " ")
            .replace(/\s+/g, " ");
          // Fix literal backslash n
          fixedOrder = fixedOrder.replace(/\\n/g, " ").replace(/\\r/g, " ");
          const recoveredOrder = JSON.parse(fixedOrder);
          console.log("Recovered order:", recoveredOrder.orderId);
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

    // ----- COD amount calculation -----
    // Rules:
    //   - If payment method is COD:
    //       - advance paid  -> COD = totalWithDelivery - advanceAmount (default 99)
    //       - advance NOT paid -> COD = totalWithDelivery
    //   - If payment method is not COD -> COD = 0
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
    // -----------------------------------

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
      isCOD, // NEW
      advanceAmount, // NEW (stored so card can recompute if needed)
      codAmount, // NEW (already-computed amount to collect on delivery)
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
        isDelivered: orderStatus.isDelivered,
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

  // Get dynamic delivery charges using the new logic
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
  const totalWithDelivery = finalPayableValue + deliveryCharge + giftWrapCharge;

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

  const handleStatusUpdate = (field, value) => {
    const newStatus = { ...orderStatus, [field]: value };
    setOrderStatus(newStatus);
    if (orderData) {
      localStorage.setItem(
        `order_status_${orderData.orderId}`,
        JSON.stringify(newStatus),
      );
    }
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
    csvContent += `Item Delivered,${orderStatus.isDelivered ? "Yes" : "No"}\n`;
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

    const deliveryDays = isFasterDelivery ? "3-5" : "5-7";
    const deliveryText = isFasterDelivery
      ? `delivered in ${deliveryDays} business days (Priority Shipping)`
      : `delivered in ${deliveryDays} business days`;

    if (messageType === "shipped") {
      message = encodeURIComponent(
        `📚 *Order Update from TheBookX*\n\n` +
          `Dear ${orderData?.name || "Customer"},\n\n` +
          `Your order #${orderData?.orderId} has been shipped and will be ${deliveryText}.\n\n` +
          `📦 Tracking ID: ${savedTrackingId || "Not available"}\n\n` +
          `Here is the link to track : https://www.indiapost.gov.in \n\n` +
          `Thank you for shopping with TheBookX! Happy reading! 📖✨\n\n` +
          `For any queries, feel free to reach out to us.`,
      );
    } else if (messageType === "shipping") {
      message = encodeURIComponent(
        `📚 *Order Update from TheBookX*\n\n` +
          `Dear ${orderData?.name || "Customer"},\n\n` +
          `Your order #${orderData?.orderId} is confirmed and will be shipped within 1-2 business days.\n\n` +
          `Expected delivery: ${deliveryDays} business days after shipping.\n\n` +
          `You will receive a tracking ID once shipped.\n\n` +
          `Thank you for your patience! 📖✨\n\n` +
          `For any queries, feel free to reach out to us.`,
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

      {/* User Details Section */}
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
                    {/* {originalCharge && (
                      <span className="font-12 line-through gray-400 mr-8">
                        ₹{originalCharge}
                      </span>
                    )} */}
                    <span
                      className={`font-14 weight-500 ${isFasterDelivery ? "orange" : "red"}`}
                    >
                      + ₹{deliveryCharge}
                    </span>
                    {/* {deliverySavings > 0 && (
                      <span className="font-10 green ml-8">
                        Save ₹{deliverySavings}
                      </span>
                    )} */}
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

              <div className="reminder-buttons-section mt-16">
                {orderStatus.isShipped && savedTrackingId ? (
                  <button
                    onClick={() => handleRemindClick("shipped")}
                    className="pri-big-btn width100 flex items-center justify-center gap-8"
                    style={{ background: "#25D366" }}
                  >
                    <Bell size={16} />
                    Remind Customer (Order Shipped)
                    <Send size={14} />
                  </button>
                ) : !orderStatus.isShipped ? (
                  <button
                    onClick={() => handleRemindClick("shipping")}
                    className="pri-big-btn width100 flex items-center justify-center gap-8"
                    style={{ background: "#FF9800" }}
                  >
                    <Calendar size={16} />
                    Remind Customer (Shipping in 1-2 days)
                    <Send size={14} />
                  </button>
                ) : null}
              </div>

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
              {/* {originalCharge && (
                <span className="font-12 line-through gray-400 mr-8">
                  ₹{originalCharge}
                </span>
              )} */}
              <span>+ ₹{deliveryCharge}</span>
              {/* {deliverySavings > 0 && (
                <span className="font-10 green ml-8">
                  Save ₹{deliverySavings}
                </span>
              )} */}
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
        <hr />
        <div className="flex justify-between weight-600 font-16">
          <span>Total Payable</span>
          <span className="green font-20 weight-700">₹{totalWithDelivery}</span>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <button
          onClick={downloadOrderCSV}
          className="sec-big-btn flex items-center justify-center gap-8"
          style={{ width: "100%" }}
        >
          <Download size={18} />
          Download Order Details (CSV)
        </button>
        <a
          href={`https://wa.me/917710892108?text=${encodeURIComponent(
            `Hi 👋 Here is my order details.\nOrder ID: ${orderData?.orderId || "N/A"}\nTotal: ₹${totalWithDelivery}`,
          )}`}
          target="_blank"
          className="pri-big-btn"
          style={{ textAlign: "center" }}
        >
          Continue on WhatsApp
        </a>
        <button
          onClick={exportToCOList}
          className="sec-big-btn flex items-center justify-center gap-8"
          style={{ width: "100%" }}
        >
          Export to COList (Admin)
        </button>
      </div>
    </section>
  );
}
