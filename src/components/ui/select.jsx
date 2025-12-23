import React, { createContext, useContext, useState } from "react";

// 1. O "Cérebro" (Contexto)
const SelectContext = createContext(null);

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className }) => {
  const context = useContext(SelectContext);
  
  if (!context) return null; // Proteção contra uso fora do Select
  const { open, setOpen } = context;
  
  // Estilo padrão (se não passar classe de cor)
  const hasBg = className?.includes("bg-");
  const defaultStyle = hasBg ? "" : "bg-white border-gray-300 text-gray-900";

  return (
    <button 
      type="button" // Impede envio de form
      className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 ${defaultStyle} ${className || ''}`}
      onClick={() => setOpen(!open)}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder, value: propValue }) => {
  const context = useContext(SelectContext);
  const selectedValue = context ? context.value : propValue;
  
  return (
    <span className="block truncate">
      {selectedValue || placeholder || "Selecione..."}
    </span>
  );
};

export const SelectContent = ({ children, className }) => {
  const context = useContext(SelectContext);
  
  if (!context || !context.open) return null;

  const { setOpen } = context;

  // Estilo padrão
  const hasBg = className?.includes("bg-");
  const defaultBg = hasBg ? "" : "bg-white text-gray-950";

  return (
    <>
      {/* Camada invisível para fechar ao clicar fora */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      
      {/* O Menu em si */}
      <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md animate-in fade-in-0 zoom-in-95 w-full mt-1 ${defaultBg} ${className || ''}`}>
        <div className="p-1">
          {children}
        </div>
      </div>
    </>
  );
};

export const SelectItem = ({ value, children, className }) => {
  const context = useContext(SelectContext);
  
  // Se por algum motivo o contexto falhar, não quebra a tela
  if (!context) return null;

  const { onValueChange, setOpen, value: selectedValue } = context;

  const isSelected = selectedValue === value;

  return (
    <div 
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-black/10 hover:brightness-90 ${isSelected ? 'font-semibold' : ''} ${className || ''}`}
      onClick={(e) => {
        e.stopPropagation(); // Impede eventos indesejados
        onValueChange(value);
        setOpen(false);
      }}
    >
      {/* Indicador visual de seleção (opcional) */}
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-[var(--primary)]">
          ●
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  );
};