import { useState } from 'react';
import entretienService from '../../services/entretienService';

export default function InterviewReportModal({ entretien, onClose, onSave, readOnly = false }) {
  const existing = entretien.report || entretien.compte_rendu || {};
  const [form, setForm] = useState({
    evaluation_notes: existing?.evaluation_notes || '',
    strengths: existing?.strengths || '',
    weaknesses: existing?.weaknesses || '',
    next_steps: existing?.next_steps || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.evaluation_notes.trim()) return setError('L’évaluation générale est obligatoire.');
    setLoading(true);
    try {
      const res = await entretienService.submitCompteRendu(entretien.id, form);
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de sauvegarde');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-6 border-b"><h2 className="text-xl font-semibold">Compte rendu</h2><button onClick={onClose} className="text-2xl">&times;</button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}
          <div>
            <label className="block font-medium mb-1">Évaluation générale *</label>
            <textarea
              name="evaluation_notes"
              rows="4"
              value={form.evaluation_notes}
              onChange={e => setForm({ ...form, evaluation_notes: e.target.value })}
              className="w-full border rounded p-2"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Points forts</label>
            <textarea
              rows="2"
              value={form.strengths}
              onChange={e => setForm({ ...form, strengths: e.target.value })}
              className="w-full border rounded p-2"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Points à améliorer</label>
            <textarea
              rows="2"
              value={form.weaknesses}
              onChange={e => setForm({ ...form, weaknesses: e.target.value })}
              className="w-full border rounded p-2"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Prochaines étapes</label>
            <textarea
              rows="2"
              value={form.next_steps}
              onChange={e => setForm({ ...form, next_steps: e.target.value })}
              className="w-full border rounded p-2"
              disabled={readOnly}
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border rounded py-2">Fermer</button>
            {!readOnly && (
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded py-2">Sauvegarder</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}