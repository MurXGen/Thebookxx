// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ArrowRight } from "lucide-react";

// export default function PaymentSuccessPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [orderData, setOrderData] = useState(null);

//   // Fetch saved checkout data
//   useEffect(() => {
//     const savedAddress = JSON.parse(localStorage.getItem("checkoutAddress"));
//     const savedCart = JSON.parse(localStorage.getItem("checkoutCart"));
//     const savedAmount = localStorage.getItem("finalPayable");

//     setOrderData({
//       address: savedAddress,
//       cart: savedCart,
//       amount: savedAmount,
//     });
//   }, []);

//   if (!orderData) return null;

//   const { address, cart, amount } = orderData;

//   const phoneNumber = "917710892108";

//   const message = `
// ✅ Payment Successful!

// 📚 Order Details:
// ${cart
//   ?.map((b) => `• ${b.name} x ${b.qty} = ₹${b.discountedPrice * b.qty}`)
//   .join("\n")}

// 💰 Total Paid: ₹${amount}

// 📍 Delivery Address:
// ${address?.address}
// ${address?.city} - ${address?.pincode}

// 🚚 Quick Delivery: ${address?.quickDelivery ? "Yes" : "No"}

// Thank you for your order 🙏
// `;

//   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//     message,
//   )}`;

//   return (
//     <section className="section-1200 flex flex-col gap-24 items-center">
//       <h1 className="font-20 weight-600 green">Payment Successful 🎉</h1>

//       <div className="trending-card pad_16 flex flex-col gap-12 width100">
//         <h3 className="weight-600">Order Summary</h3>

//         {cart?.map((book) => (
//           <div key={book.id} className="flex justify-between font-14">
//             <span>
//               {book.name} x {book.qty}
//             </span>
//             <span>₹{book.discountedPrice * book.qty}</span>
//           </div>
//         ))}

//         <hr />

//         <div className="flex justify-between weight-600">
//           <span>Total Paid</span>
//           <span>₹{amount}</span>
//         </div>
//       </div>

//       <div className="trending-card pad_16 flex flex-col gap-8 width100">
//         <h3 className="weight-600">Delivery Address</h3>
//         <p className="font-14">{address?.address}</p>
//         <p className="font-14">
//           {address?.city} - {address?.pincode}
//         </p>
//         <p className="font-14">
//           Quick Delivery: {address?.quickDelivery ? "Yes" : "No"}
//         </p>
//       </div>

//       <button
//         className="pri-big-btn flex gap-8 items-center"
//         onClick={() => window.open(whatsappUrl, "_blank")}
//       >
//         Send Order on WhatsApp <ArrowRight size={16} />
//       </button>
//     </section>
//   );
// }
