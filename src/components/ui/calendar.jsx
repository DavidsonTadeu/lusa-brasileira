import React from "react";
// Um componente de calendário visual completo é muito grande.
// Este é um substituto funcional que usa o seletor nativo do navegador mas tenta parecer integrado.
export const Calendar = ({ mode, selected, onSelect, className, disabled }) => {
  
  const handleChange = (e) => {
    const date = new Date(e.target.value);
    onSelect(date);
  };

  // Converte data para string YYYY-MM-DD
  const dateStr = selected ? selected.toISOString().split('T')[0] : '';

  return (
    <div className={`p-3 border rounded-lg bg-white ${className}`}>
      <p className="text-sm text-gray-500 mb-2 text-center">Selecione a data:</p>
      <input 
        type="date" 
        className="w-full p-2 border rounded"
        value={dateStr}
        onChange={handleChange}
        min={new Date().toISOString().split('T')[0]} // Impede datas passadas (básico)
      />
    </div>
  );
};