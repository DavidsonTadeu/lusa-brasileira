import React from "react";

export const Calendar = ({ mode, selected, onSelect, className, disabled }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    
    // Separa exatamente o ano, mes e dia da string (Ex: 2026-03-15)
    const [year, month, day] = val.split('-');
    
    // Cria a data no fuso local exato à meia-noite (00:00:00)
    // Sem adicionar horas a mais!
    const date = new Date(year, parseInt(month) - 1, day, 0, 0, 0);
    onSelect(date);
  };

  let dateStr = "";
  if (selected) {
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  const today = new Date();
  const ty = today.getFullYear();
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const minDate = `${ty}-${tm}-${td}`;

  return (
    <div className={`p-4 border border-gray-200 rounded-xl bg-white shadow-sm ${className}`}>
      <p className="text-sm text-[var(--primary)] mb-3 text-center font-bold uppercase tracking-wider">
        Toque para escolher a data:
      </p>
      
      <input 
        type="date" 
        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-medium cursor-pointer focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
        value={dateStr}
        onChange={handleChange}
        min={minDate} 
      />
      
      <p className="text-xs text-gray-400 text-center mt-4 leading-tight">
        * Nota: Ao selecionar um dia de folga ou bloqueado, a lista de horários aparecerá vazia.
      </p>
    </div>
  );
};