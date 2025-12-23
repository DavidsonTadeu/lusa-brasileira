import React, { createContext, useContext } from "react";

const RadioGroupContext = createContext(null);

export const RadioGroup = ({ value, onValueChange, className, children }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={`grid gap-2 ${className}`} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export const RadioGroupItem = ({ value, id, className }) => {
  const context = useContext(RadioGroupContext);
  
  if (!context) {
    return null;
  }

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => context.onValueChange(value)}
      className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        isSelected ? "bg-[var(--primary)] border-[var(--primary)]" : "border-gray-400"
      } ${className}`}
      id={id}
    >
      {isSelected && (
        <span className="flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </span>
      )}
    </button>
  );
};