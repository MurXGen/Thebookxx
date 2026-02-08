"use client";

import Image from "next/image";
import { X, Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";

export default function BookDetailsModal({ book, onClose }) {
  const { cart, addToCart, toggleWishlist, wishlist } = useStore();
  const inWishlist = wishlist.includes(book.id);
  const router = useRouter();

  const isOneRupee = book.discountedPrice === 1;

  const hasOneRupeeInCart = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  const handleWishlist = () => {
    toggleWishlist(book.id);

    // ⏪ Go back after action
    router.back();
  };

  const handleAddToCart = () => {
    addToCart(book.id);

    // ⏪ Go back after action
    router.push("/");
  };

  return (
    <div className="book-detail=section">
      <div className="section-1200 flex flex-col gap-24">
        {/* ❌ Close */}
        <div className="  flex flex-row gap-12 items-center">
          <ArrowLeft size={20} onClick={onClose} className="cursor-pointer" />
          <div className="flex flex-col">
            <h2 className="font-16 weight-600">{book.name}</h2>
          </div>
        </div>

        {/* Image */}
        <div className="book-detail-image">
          <Image
            src={book.image}
            alt={book.name}
            width={100}
            height={100}
            priority
          />
          <Image
            src={book.image}
            alt={book.name}
            width={100}
            height={100}
            priority
          />
        </div>

        {/* Content */}
        <div className="book-detail-body">
          <div className="flex flex-col">
            <div>
              <h2 className="font-24">{book.name}</h2>
              <p className="font-12 dark-50">{book.description}</p>
            </div>
            <span className="font-12 dark-50">{book.size}</span>
          </div>

          <div className="price-row flex flex-row items-center">
            <span className="font-32 weight-600 green">
              ₹{book.discountedPrice}
            </span>
            <span className="original font-32">₹{book.originalPrice}</span>
          </div>
          <div className="dashed-border"></div>

          <div className="flex flex-row gap-12 tags">
            {book.catalogue?.map((tag) => (
              <span key={tag} className="sec-mid-btn">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="book-detail-cta section-1200">
          <LoadingButton
            className="width100 flex flex-row items-center gap-12 justify-center sec-big-btn"
            onClick={handleWishlist}
            icon={<Heart size={20} fill={inWishlist ? "red" : "none"} />}
          >
            Save for later
          </LoadingButton>

          <LoadingButton
            className="width100 pri-big-btn flex flex-row items-center gap-12 justify-center"
            onClick={handleAddToCart}
            disabled={isOneRupee && hasOneRupeeInCart}
            icon={<ShoppingCart size={20} />}
          >
            Add to Cart
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
