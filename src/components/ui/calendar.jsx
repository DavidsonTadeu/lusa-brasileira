import React from "react";

export const Calendar = ({ mode, selected, onSelect, className, disabled }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    
    // CORREÇÃO SÊNIOR: Trava a data no meio-dia local para blindar contra fuso horário.
    // Assim, se a pessoa clica no dia 15, nunca vai voltar para o dia 14.
    const [year, month, day] = val.split('-');
    const date = new Date(year, parseInt(month) - 1, day, 12, 0, 0);
    onSelect(date);
  };

  // Formata a data escolhida para o padrão que o input nativo exige (YYYY-MM-DD)
  let dateStr = "";
  if (selected) {
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  // Calcula a data de hoje para impedir que o cliente marque agendamentos no passado
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
        * Nota: O calendário permite clicar em qualquer dia, mas se a data estiver indisponível, a lista de horários abaixo aparecerá vazia.
      </p>
    </div>
  );
};