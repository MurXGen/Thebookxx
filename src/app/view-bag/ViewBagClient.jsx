"use client";

import { books } from "@/utils/book";
import { CART_OFFERS, getExtraDeliveryCharge } from "@/utils/cartOffers";
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
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewBagClient() {
  const searchParams = useSearchParams();
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
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [showShipmentInput, setShowShipmentInput] = useState(false);
  const [savedShipmentNumber, setSavedShipmentNumber] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);

    // Get order data from URL
    const orderParam = searchParams.get("order");
    if (orderParam) {
      try {
        const decodedOrder = JSON.parse(decodeURIComponent(orderParam));
        setOrderData(decodedOrder);

        // Load saved status from localStorage
        const savedStatus = localStorage.getItem(
          `order_status_${decodedOrder.orderId}`,
        );
        if (savedStatus) {
          setOrderStatus(JSON.parse(savedStatus));
        }

        // Load saved tracking ID
        const savedTracking = localStorage.getItem(
          `tracking_id_${decodedOrder.orderId}`,
        );
        if (savedTracking) {
          setSavedTrackingId(savedTracking);
        }

        // Load saved shipment number
        const savedShipment = localStorage.getItem(
          `shipment_number_${decodedOrder.orderId}`,
        );
        if (savedShipment) {
          setSavedShipmentNumber(savedShipment);
        }
      } catch (e) {
        console.error("Failed to parse order data", e);
      }
    }
  }, [searchParams]);

  const itemsParam = searchParams.get("items");

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

  const cartBooks = itemsParam
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
    .filter(Boolean);

  if (!cartBooks.length) {
    return (
      <div className="section-1200">
        <h2>No valid books found</h2>
      </div>
    );
  }

  const totalDiscounted = cartBooks.reduce(
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

  const appliedOffer = getAppliedOffer(totalDiscounted);

  let offerDiscount = 0;
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
      offerLabel = `₹${appliedOffer.value} OFF`;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((totalDiscounted * appliedOffer.value) / 100);
      offerLabel = "Free delivery 🚚";
    }
  }

  const finalPayable = totalDiscounted - offerDiscount;
  const extraDeliveryCharge = getExtraDeliveryCharge(totalDiscounted);
  const totalWithDelivery = finalPayable + extraDeliveryCharge;

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

  const handleSaveShipmentNumber = () => {
    if (shipmentNumber.trim()) {
      setSavedShipmentNumber(shipmentNumber);
      localStorage.setItem(
        `shipment_number_${orderData?.orderId}`,
        shipmentNumber,
      );
      setShowShipmentInput(false);
      setShipmentNumber("");
    }
  };

  // Get the primary WhatsApp number (customer's number)
  const getPrimaryWhatsAppNumber = () => {
    return orderData?.phone;
  };

  // Get the secondary WhatsApp number (shipment number if exists)
  const getSecondaryWhatsAppNumber = () => {
    return savedShipmentNumber || null;
  };

  // Send message to single or multiple numbers
  const sendWhatsAppMessage = (message, sendToBoth = false) => {
    const primaryNumber = getPrimaryWhatsAppNumber();
    const secondaryNumber = getSecondaryWhatsAppNumber();

    if (sendToBoth && secondaryNumber) {
      // Send to both numbers
      window.open(`https://wa.me/${primaryNumber}?text=${message}`, "_blank");
      setTimeout(() => {
        window.open(
          `https://wa.me/${secondaryNumber}?text=${message}`,
          "_blank",
        );
      }, 500);
    } else {
      // Send to primary number only
      if (primaryNumber) {
        window.open(`https://wa.me/${primaryNumber}?text=${message}`, "_blank");
      }
    }
  };

  const handleRemindCustomer = (sendToBoth = false) => {
    const message = encodeURIComponent(
      `📚 *Order Update from TheBookX*\n\n` +
        `Dear ${orderData?.name || "Customer"},\n\n` +
        `Your order #${orderData?.orderId} has been shipped and will be delivered in 3-5 business days.\n\n` +
        `📦 Tracking ID: ${savedTrackingId || "Not available"}\n\n` +
        `Thank you for shopping with TheBookX! Happy reading! 📖✨\n\n` +
        `For any queries, feel free to reach out to us.`,
    );

    sendWhatsAppMessage(message, sendToBoth);
  };

  const handleRemindShipping = (sendToBoth = false) => {
    const message = encodeURIComponent(
      `📚 *Order Update from TheBookX*\n\n` +
        `Dear ${orderData?.name || "Customer"},\n\n` +
        `Your order #${orderData?.orderId} is confirmed and will be shipped within 1-2 business days.\n\n` +
        `You will receive a tracking ID once shipped.\n\n` +
        `Thank you for your patience! 📖✨\n\n` +
        `For any queries, feel free to reach out to us.`,
    );

    sendWhatsAppMessage(message, sendToBoth);
  };

  const isCOD = orderData?.paymentMethod === "COD";
  const isUPI = orderData?.paymentMethod === "UPI";

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
            <div>
              <span className="font-12 gray-500">Phone</span>
              <p className="font-14 weight-500">
                {orderData.phone || "Not provided"}
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

              {/* COD Section */}
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
                    <span className="font-14">50% Advance Paid</span>
                  </label>
                </div>
              )}

              {/* Shipment Number Section - Secondary WhatsApp Number */}
              <div className="shipment-number-section mt-12">
                <div className="flex justify-between items-center">
                  <span className="font-14 weight-500">
                    Secondary WhatsApp Number (Shipment Updates)
                  </span>
                  {!savedShipmentNumber && (
                    <button
                      onClick={() => setShowShipmentInput(!showShipmentInput)}
                      className="sec-mid-btn font-12 flex items-center gap-4"
                      style={{ padding: "4px 12px" }}
                    >
                      <Plus size={12} />
                      Add Number
                    </button>
                  )}
                </div>

                {savedShipmentNumber ? (
                  <div className="flex items-center justify-between gap-8 p-12 bg-gray-50 rounded-8 mt-8">
                    <div className="flex items-center gap-8">
                      <Send size={16} className="blue" />
                      <span className="font-14">{savedShipmentNumber}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSavedShipmentNumber("");
                        localStorage.removeItem(
                          `shipment_number_${orderData?.orderId}`,
                        );
                      }}
                      className="text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : showShipmentInput ? (
                  <div className="flex flex-col gap-8 mt-8">
                    <div className="flex gap-8">
                      <input
                        type="tel"
                        className="sec-mid-btn flex-grow"
                        placeholder="Enter WhatsApp number with country code (e.g., 919876543210)"
                        value={shipmentNumber}
                        onChange={(e) =>
                          setShipmentNumber(e.target.value.replace(/\D/g, ""))
                        }
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={handleSaveShipmentNumber}
                        className="pri-big-btn"
                        style={{ padding: "8px 16px" }}
                        disabled={
                          !shipmentNumber.trim() || shipmentNumber.length < 10
                        }
                      >
                        Save
                      </button>
                    </div>
                    <span className="font-10 gray-500">
                      This number will receive shipment updates along with the
                      customer
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Shipping Status */}
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

              {/* Tracking ID Section */}
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

              {/* Reminder Buttons */}
              <div className="reminder-buttons-section mt-16">
                {orderStatus.isShipped && savedTrackingId ? (
                  <div className="flex flex-col gap-8">
                    <button
                      onClick={() => handleRemindCustomer(false)}
                      className="pri-big-btn width100 flex items-center justify-center gap-8"
                      style={{ background: "#25D366" }}
                    >
                      <Bell size={16} />
                      Remind Customer (Order Shipped)
                      <Send size={14} />
                    </button>
                    {savedShipmentNumber && (
                      <button
                        onClick={() => handleRemindCustomer(true)}
                        className="sec-big-btn width100 flex items-center justify-center gap-8"
                        style={{
                          border: "2px solid #25D366",
                          color: "#25D366",
                        }}
                      >
                        <Send size={16} />
                        Remind Both (Customer + Shipment)
                      </button>
                    )}
                  </div>
                ) : !orderStatus.isShipped ? (
                  <div className="flex flex-col gap-8">
                    <button
                      onClick={() => handleRemindShipping(false)}
                      className="pri-big-btn width100 flex items-center justify-center gap-8"
                      style={{ background: "#FF9800" }}
                    >
                      <Calendar size={16} />
                      Remind Customer (Shipping in 1-2 days)
                      <Send size={14} />
                    </button>
                    {savedShipmentNumber && (
                      <button
                        onClick={() => handleRemindShipping(true)}
                        className="sec-big-btn width100 flex items-center justify-center gap-8"
                        style={{
                          border: "2px solid #FF9800",
                          color: "#FF9800",
                        }}
                      >
                        <Send size={16} />
                        Remind Both (Customer + Shipment)
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Status Timeline */}
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

      {/* Books Section */}
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

      {/* Bill Summary */}
      <div className="viewbag-bill flex flex-col gap-8">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{totalOriginal}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>- ₹{totalOriginal - totalDiscounted}</span>
        </div>

        {appliedOffer && (
          <div className="flex justify-between green">
            <span>Offer Applied</span>
            <span>{offerLabel}</span>
          </div>
        )}

        {extraDeliveryCharge > 0 && (
          <div className="flex justify-between red">
            <span>Delivery Charges</span>
            <span>+ ₹{extraDeliveryCharge}</span>
          </div>
        )}

        <hr />

        <div className="flex justify-between weight-600 font-16">
          <span>Total Payable</span>
          <span>₹{totalWithDelivery}</span>
        </div>
      </div>

      <a
        href={`https://wa.me/917710892108?text=${encodeURIComponent(
          `Hi 👋 Here is my order details.\nOrder ID: ${orderData?.orderId || "N/A"}\nTotal: ₹${totalWithDelivery}`,
        )}`}
        target="_blank"
        className="pri-big-btn"
      >
        Continue on WhatsApp
      </a>
    </section>
  );
}
