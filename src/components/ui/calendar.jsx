import React from "react";

export const Calendar = ({ mode, selected, onSelect, className, disabled }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    
    // Lógica blindada da data
    const [year, month, day] = val.split('-');
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
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
        Escolha a data
      </label>
      
      <input 
        type="date" 
        className="w-full h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 font-medium text-[16px] shadow-sm cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
        value={dateStr}
        onChange={handleChange}
        min={minDate} 
      />
    </div>
  );
};