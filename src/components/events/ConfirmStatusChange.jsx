export default function ConfirmStatusChange({ isOpen, onConfirm, onCancel, newStatus, interviewTitle }) {
  if (!isOpen) return null;
  const statusLabel = newStatus === 'realise' ? 'Réalisé' : newStatus === 'annule' ? 'Annulé' : 'Reporté';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirmation</h2>
        <p>Passer l'entretien "{interviewTitle}" au statut <strong>{statusLabel}</strong> ?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border rounded">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">Confirmer</button>
        </div>
      </div>
    </div>
  );
}