import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function InterviewResponseModal({ interview, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const candidate = interview?.candidate || interview?.candidat;
  const location = interview?.location_type === 'visio' 
    ? `Google Meet - ${interview?.meeting_link || 'Lien à venir'}`
    : interview?.location_type === 'telephone' 
    ? `Téléphone - ${interview?.phone_number || ''}`
    : interview?.location;

  const handleSubmit = async () => {
    if (!response) {
      toast.error('Veuillez sélectionner une réponse');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/consultant/interviews/${interview.id}/respond`, { response });
      toast.success(response === 'accept' ? 'Entretien accepté' : 'Entretien refusé');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-md border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Accepter ou Refuser?</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Interview Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-500">Entretien</p>
            <p className="font-semibold text-gray-900">
              {interview?.type_entretien || interview?.event_type} - {candidate?.first_name || candidate?.name} {candidate?.last_name || ''}
            </p>
            <p className="text-sm text-gray-600">
              📅 {new Date(interview?.start_datetime).toLocaleDateString('fr-FR')} à {new Date(interview?.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-600">📍 {location}</p>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Votre réponse</p>
            
            {/* Accept Option */}
            <button
              onClick={() => setResponse('accept')}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                response === 'accept' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 ${response === 'accept' ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">✅ Accepter</p>
                  <p className="text-xs text-gray-500">Je participerai à cet entretien</p>
                </div>
              </div>
            </button>

            {/* Refuse Option */}
            <button
              onClick={() => setResponse('refuse')}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                response === 'refuse' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <XCircle className={`w-5 h-5 ${response === 'refuse' ? 'text-red-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">❌ Refuser</p>
                  <p className="text-xs text-gray-500">Je ne peux pas participer</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!response || loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${
              response === 'accept' 
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                : response === 'refuse'
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Envoi...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
