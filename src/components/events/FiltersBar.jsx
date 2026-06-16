import { useState } from 'react';

export default function FiltersBar({ filters, onChange }) {
  const [localType, setLocalType] = useState(filters.type || '');
  const [localStatus, setLocalStatus] = useState(filters.status || '');

  const handleApply = () => onChange({ type: localType, status: localStatus });
  const handleReset = () => { setLocalType(''); setLocalStatus(''); onChange({}); };

  return (
    <div className="bg-white p-5 rounded-[28px] shadow-[0_20px_40px_rgba(15,23,42,0.08)] mb-6 flex flex-wrap gap-4 items-end border border-slate-200">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-sm font-medium mb-2 text-slate-600">Type</label>
        <select value={localType} onChange={(e) => setLocalType(e.target.value)} className="w-full border border-slate-200 rounded-2xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
          <option value="">Tous</option>
          <option value="telephonique">Téléphonique</option>
          <option value="rh">RH</option>
          <option value="technique">Technique</option>
          <option value="final">Final</option>
        </select>
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="block text-sm font-medium mb-2 text-slate-600">Statut</label>
        <select value={localStatus} onChange={(e) => setLocalStatus(e.target.value)} className="w-full border border-slate-200 rounded-2xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
          <option value="">Tous</option>
          <option value="planifie">Planifié</option>
          <option value="confirme">Confirmé</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
          <option value="reporte">Reporté</option>
        </select>
      </div>
      <button onClick={handleApply} className="bg-gradient-to-r from-[#2563eb] to-[#22d3ee] text-white px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition">Filtrer</button>
      <button onClick={handleReset} className="border border-slate-300 bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl transition hover:bg-slate-100">Réinitialiser</button>
    </div>
  );
}