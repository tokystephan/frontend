import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import usePermissions from '../../hooks/usePermissions';
import entretienService from '../../services/entretienService';
import { formatDate, getDuration, getTypeLabel, getLocationLabel, getStatusBadge } from '../../utils/dateHelpers';
import ConfirmStatusChange from './ConfirmStatusChange';
import InterviewReportModal from './InterviewReportModal';
import InterviewResponseModal from './InterviewResponseModal';

const typeBadgeClass = {
  telephonique: 'bg-gray-100',
  rh: 'bg-blue-100',
  technique: 'bg-yellow-100',
  final: 'bg-green-100',
};

export default function InterviewCard({ entretien, onStatutChange, onSupprimer, onCompteRenduSave, onRefresh }) {
  const [showCR, setShowCR] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, newStatus: null });
  
  // Normaliser les noms de champs du backend
  const {
    id,
    candidate, candidat, // backend utilise "candidate", frontend utilise "candidat"
    application, candidature, // backend utilise "application", frontend utilise "candidature"
    event_type, type_entretien, // backend utilise "event_type", frontend utilise "type_entretien"
    status,
    start_datetime,
    end_datetime,
    location_type,
    location,
    meeting_link,
    phone_number,
    participants,
    report,
    title
  } = entretien;

  const candidatData = candidat || candidate;

  const candidatureData = candidature || application;
  const eventType = type_entretien || event_type;
  const statut = entretien.statut ?? status;
  const { user } = useSelector((state) => state.auth);
  const {
    roleName,
    canCancelInterview,
    canDeleteInterview,
    canAddInterviewReport,
    canEditInterviewReport,
    canEditAnyInterviewReport,
    canViewInterviewReport,
    canExportInterviewReport,
  } = usePermissions();
  const isDirection = roleName === 'direction';
  const isReportOwner = report?.created_by && user?.id && Number(report.created_by) === Number(user.id);
  const canOpenReportModal = report ? canViewInterviewReport : canAddInterviewReport && !isDirection;
  const canEditReport = report
    ? canEditAnyInterviewReport || (canEditInterviewReport && isReportOwner)
    : canAddInterviewReport;

  const handleStatut = (newStatus) => setConfirm({ open: true, newStatus });

  const handleExport = async () => {
    if (!report) return;

    try {
      const response = await entretienService.exportReport(id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/plain;charset=utf-8' });
      const fileUrl = window.URL.createObjectURL(blob);
      const filenameMatch = response.headers['content-disposition']?.match(/filename="?(?<name>[^";]+)"?/);
      const filename = filenameMatch?.groups?.name || `compte-rendu-entretien-${id}.txt`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error('Erreur export CR:', err);
      alert('Impossible d\'exporter le compte rendu.');
    }
  };
  const confirmChange = () => { onStatutChange(id, confirm.newStatus); setConfirm({ open: false }); };
  const statusBadge = getStatusBadge(statut);

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md">
      {/* En-tête */}
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="font-semibold">{candidatData?.full_name || candidatData?.name} — {candidatureData?.post?.title}</h3>
          <p className="text-xs text-gray-500">{title}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${typeBadgeClass[eventType]}`}>{getTypeLabel(eventType)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>{statusBadge.label}</span>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span>📅 {formatDate(start_datetime)}</span>
        <span>⏱️ {getDuration(start_datetime, end_datetime)}</span>
        <span>📍 {getLocationLabel(location_type, location, meeting_link, phone_number)}</span>
        {meeting_link && <a href={meeting_link} target="_blank" className="text-blue-500 underline">Rejoindre</a>}
      </div>

      {/* Participants */}
      {participants?.length > 0 && (
        <div className="flex gap-1 mb-3">
          {participants.slice(0,5).map(p => (
            <div key={p.id} className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
              {(p.user?.full_name || p.user?.name || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`)?.substring(0,2).toUpperCase()}
            </div>
          ))}
          {participants.length > 5 && <span className="text-xs text-gray-400">+{participants.length-5}</span>}
        </div>
      )}

      {/* Aperçu CR */}
      {report && (
        <div className="bg-gray-50 p-2 text-xs rounded mb-3">
          <span className="font-semibold">CR :</span> {report.evaluation_notes?.substring(0,100)}
        </div>
      )}

      {/* Actions dynamiques */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        {/* Manager Actions - Accept/Refuse */}
        {(roleName === 'consultant' || roleName === 'manager') && statut === 'planifie' && (
          <div className="flex gap-2">
            <button onClick={() => setShowResponse(true)} className="flex-1 text-xs bg-blue-100 text-blue-600 rounded px-3 py-2 hover:bg-blue-200 transition font-medium">
              ✅ Accepter/Refuser
            </button>
            {meeting_link && (
              <a href={meeting_link} target="_blank" rel="noreferrer" className="flex-1 text-xs bg-green-100 text-green-600 rounded px-3 py-2 hover:bg-green-200 transition text-center font-medium">
                🔗 Rejoindre
              </a>
            )}
            <Link to={`/interviews/${id}`} className="flex-1 text-xs bg-gray-100 text-gray-600 rounded px-3 py-2 hover:bg-gray-200 transition text-center font-medium">
              👁️ Voir
            </Link>
          </div>
        )}

        {/* Admin/Assistant actions (consultant cannot modify/cancel/reporter) */}
        {canCancelInterview && statut === 'planifie' && (
          <div className="flex gap-2">
            <button onClick={()=>handleStatut('termine')} className="text-xs border-green-200 text-green-700 rounded px-3 py-1">✅ Réalisé</button>
            <button onClick={()=>handleStatut('annule')} className="text-xs border-red-200 text-red-500 rounded px-3 py-1">❌ Annuler</button>
            <button onClick={()=>handleStatut('reporte')} className="text-xs border-orange-200 text-orange-600 rounded px-3 py-1">⏰ Reporter</button>
          </div>
        )}

        {/* Report Actions */}
        {['confirme', 'termine', 'realise'].includes(statut) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setShowCR(true)}
              className="text-xs bg-purple-100 text-purple-600 rounded px-3 py-2 hover:bg-purple-200 transition text-center"
              disabled={!canOpenReportModal}
            >
              {report ? (canEditReport ? '📝 Modifier CR' : '👁️ Voir CR') : isDirection ? 'Aucun CR disponible' : '📝 Rédiger CR'}
            </button>
            {report && canExportInterviewReport && (
              <button
                onClick={handleExport}
                className="text-xs bg-gray-100 text-gray-700 rounded px-3 py-2 hover:bg-gray-200 transition text-center"
              >
                📄 Exporter
              </button>
            )}
          </div>
        )}

        {/* Delete Actions */}
        {(statut === 'annule' || statut === 'reporte') && canDeleteInterview && (
          <button onClick={()=>onSupprimer(id)} className="text-xs border-red-200 text-red-500 rounded px-3 py-1">Supprimer</button>
        )}
      </div>

      {/* Modales */}
      {showCR && <InterviewReportModal entretien={entretien} onClose={()=>setShowCR(false)} onSave={(cr)=>{onCompteRenduSave(id, cr); setShowCR(false);}} readOnly={!canEditReport} />}
      {showResponse && <InterviewResponseModal interview={entretien} onClose={() => setShowResponse(false)} onSuccess={() => { setShowResponse(false); if (onRefresh) onRefresh(); }} />}
      <ConfirmStatusChange isOpen={confirm.open} onConfirm={confirmChange} onCancel={()=>setConfirm({open:false})} newStatus={confirm.newStatus} interviewTitle={candidatData?.name} />
    </div>
  );
}
