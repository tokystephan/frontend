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

  const interviewTitle = entretien?.candidat?.full_name || entretien?.candidate?.full_name || entretien?.candidat?.name || entretien?.candidate?.name || 'Entretien';

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-blue-600">Compte rendu</p>
            <h2 className="text-xl font-semibold text-gray-900">{interviewTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{readOnly ? 'Consultation du compte rendu' : 'Renseignez les éléments clés de l’évaluation'}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {readOnly
              ? 'Vous consultez un compte rendu déjà enregistré. Les champs sont en lecture seule.'
              : 'Ajoutez une synthèse claire pour faciliter la suite du processus de recrutement.'}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Évaluation générale *</label>
            <textarea
              name="evaluation_notes"
              rows="4"
              value={form.evaluation_notes}
              onChange={(e) => setForm({ ...form, evaluation_notes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Points forts</label>
            <textarea
              rows="2"
              value={form.strengths}
              onChange={(e) => setForm({ ...form, strengths: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Points à améliorer</label>
            <textarea
              rows="2"
              value={form.weaknesses}
              onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Prochaines étapes</label>
            <textarea
              rows="2"
              value={form.next_steps}
              onChange={(e) => setForm({ ...form, next_steps: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={readOnly}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-700 hover:bg-gray-50 transition">Fermer</button>
            {!readOnly && (
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 transition disabled:opacity-70">
                {loading ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}