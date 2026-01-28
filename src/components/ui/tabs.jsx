import React from "react";

export const Tabs = ({ value, onValueChange, children, className }) => (
  <div className={className}>
    {React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}
  </div>
);

export const TabsList = ({ children, className }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ value: tabValue, children, className, value, onValueChange }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
      value === tabValue ? "bg-white text-black shadow-sm" : ""
    } ${className}`}
    onClick={() => onValueChange(tabValue)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value: tabValue, children, className, value }) => {
  if (value !== tabValue) return null;
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none ${className}`}>{children}</div>;
};