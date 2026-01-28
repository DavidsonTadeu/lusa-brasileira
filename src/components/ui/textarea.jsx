import React from "react";
export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  const hasBg = className?.includes("bg-");
  const defaultBg = hasBg ? "" : "bg-white";

  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${defaultBg} ${className || ""}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";