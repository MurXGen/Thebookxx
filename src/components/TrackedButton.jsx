// components/TrackedButton.jsx
"use client";

import { useTrackClick } from "@/lib/trackingHooks";

export default function TrackedButton({
  eventName,
  eventParams = {},
  onClick,
  children,
  ...props
}) {
  const handleTrackedClick = useTrackClick(eventName, () => eventParams);

  const handleClick = (e) => {
    handleTrackedClick();
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
