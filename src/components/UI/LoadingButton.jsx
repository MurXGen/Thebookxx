"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoadingButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  icon = null,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      await onClick?.(e);
    } finally {
      // allow UI transition before enabling again
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <button
      type={type}
      className={`${className} flex items-center justify-center gap-12 transition-all duration-300 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {icon && icon}
          <span className="transition-opacity duration-300">{children}</span>
        </>
      )}
    </button>
  );
}
