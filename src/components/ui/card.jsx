import React from "react";
export const Card = ({ className, ...props }) => {
  // Garante que a classe passada (ex: bg-gray-800) sobrescreva o padrão (bg-white)
  const hasBg = className?.includes("bg-");
  const defaultBg = hasBg ? "" : "bg-white";
  
  return (
    <div className={`rounded-lg border text-gray-950 shadow-sm ${defaultBg} ${className || ""}`} {...props} />
  );
};
export const CardHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ""}`} {...props} />
);
export const CardTitle = ({ className, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`} {...props} />
);
export const CardContent = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className || ""}`} {...props} />
);