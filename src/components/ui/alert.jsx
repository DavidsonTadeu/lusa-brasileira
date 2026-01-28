import React from "react";
export const Alert = ({ children, className }) => (
  <div role="alert" className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950 ${className}`}>
    {children}
  </div>
);
export const AlertDescription = ({ children, className }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
);