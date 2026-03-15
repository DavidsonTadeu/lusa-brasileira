import React from "react";
export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  // Verifica se já foi passada uma cor de fundo, se não, usa branco
  const hasBg = className?.includes("bg-");
  const defaultBg = hasBg ? "" : "bg-white";
  
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${defaultBg} ${className || ""}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";