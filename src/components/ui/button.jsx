import React from "react";
export const Button = ({ children, className, variant, size, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-[var(--primary)] text-white hover:bg-opacity-90",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-input hover:bg-gray-100 hover:text-accent-foreground",
    ghost: "hover:bg-gray-100 hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };
  return (
    <button 
      className={`${baseStyle} ${variants[variant || 'default']} ${sizes[size || 'default']} ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  );
};