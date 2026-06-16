import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Calendar, Clock, MapPin, FileText, Users, Edit, CheckCircle, XCircle } from 'lucide-react';
import entretienService from '../../services/entretienService';
import { formatDate, getDuration, getTypeLabel, getLocationLabel, getStatusBadge } from '../../utils/dateHelpers';
import usePermissions from '../../hooks/usePermissions';
import InterviewParticipants from '../../components/events/InterviewParticipants';
import InterviewReportModal from '../../components/events/InterviewReportModal';
import InterviewResponseModal from '../../components/events/InterviewResponseModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const InfoRow = ({ icon: IconComponent, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
      {IconComponent && <IconComponent className="w-3 h-3" />}
      <span className="uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-gray-900 font-medium">{value || '-'}</p>
  </div>
);

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    roleName,
    canAddInterviewReport,
    canEditInterviewReport,
    canEditAnyInterviewReport,
    canViewInterviewReport,
    canDeleteInterviewReport,
    canExportInterviewReport,
    canValidateInterviewReport,
    canValidateOfferAfterReport,
  } = usePermissions();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCR, setShowCR] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [managerParticipation, setManagerParticipation] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await entretienService.getById(id);
        setInterview(response.data);
        
        // Check manager's participation status
        if (response.data.participants && user?.id) {
          const managerParticipant = response.data.participants.find(p => p.user_id === user.id);
          if (managerParticipant) {
            setManagerParticipation(managerParticipant.status || 'pending');
          }
        }
        setError(null);
      } catch (err) {
        console.error('Erreur chargement:', err);
        setError('Impossible de charger les détails de l\'entretien');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, user?.id]);

  const handleSaveCR = (cr) => {
    setInterview(prev => ({ ...prev, report: cr, compte_rendu: cr }));
    setShowCR(false);
    toast.success('Compte rendu enregistré');
  };

  const handleResponseSuccess = async () => {
    // Refresh the interview to get updated participation status
    try {
      const response = await entretienService.getById(id);
      setInterview(response.data);
      if (response.data.participants && user?.id) {
        const managerParticipant = response.data.participants.find(p => p.user_id === user.id);
        if (managerParticipant) {
          setManagerParticipation(managerParticipant.status || 'pending');
        }
      }
    } catch (err) {
      console.error('Erreur refresh:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Entretien introuvable</h2>
          <p className="text-gray-500 mb-4">{error || 'L\'entretien demandé n\'existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => navigate('/interviews')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statut = interview.statut ?? interview.status;
  const eventType = interview.type_entretien ?? interview.event_type;
  const candidatData = interview.candidat || interview.candidate;
  const candidatureData = interview.candidature || interview.application;
  const report = interview.compte_rendu || interview.report;
  const statusBadge = getStatusBadge(statut);
  const reportAuthor = report?.author || report?.created_by;
  const isReportOwner = report?.created_by && user?.id && Number(report.created_by) === Number(user.id);
  const canWriteReportForStatus = ['confirme', 'termine', 'realise'].includes(statut);
  const canAddCR = canAddInterviewReport && canWriteReportForStatus && !report && !['direction'].includes(roleName);
  const canEditCR = report && (canEditAnyInterviewReport || (canEditInterviewReport && isReportOwner));
  const canDeleteCR = canDeleteInterviewReport && report;
  const canValidateCR = canValidateInterviewReport && report && !report.validated_at;
  const canValidateOffer = canValidateOfferAfterReport && report && eventType === 'final';
  const hasReportAccess = canViewInterviewReport && report;

  const handleExportReport = async () => {
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
      toast.success('Téléchargement du compte rendu lancé');
    } catch (err) {
      console.error('Erreur export CR:', err);
      toast.error('Impossible d\'exporter le compte rendu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Détail entretien</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidatData?.first_name || candidatData?.name} {candidatData?.last_name || ''}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{candidatureData?.post?.title || candidatureData?.poste?.title}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/interviews')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Retour aux entretiens
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* ==================== INFORMATIONS PRINCIPALES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Informations générales</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoRow icon={Calendar} label="Type" value={getTypeLabel(eventType)} />
              <InfoRow icon={Calendar} label="Date" value={formatDate(interview.start_datetime)} />
              <InfoRow icon={Clock} label="Durée" value={getDuration(interview.start_datetime, interview.end_datetime)} />
              <InfoRow icon={MapPin} label="Lieu" value={getLocationLabel(interview.location_type, interview.location, interview.meeting_link, interview.phone_number)} />
            </div>
            {interview.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-600">{interview.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== PARTICIPANTS ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Participants
            </h2>
          </div>
          <div className="p-6">
            <InterviewParticipants participants={interview.participants} />
          </div>
        </div>

        {/* ==================== MES ACTIONS (Manager) ==================== */}
        {(roleName === 'consultant' || roleName === 'manager') && statut === 'planifie' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="font-semibold text-gray-800">🎯 Mes actions</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {managerParticipation !== 'accepted' && (
                  <button
                    onClick={() => setShowResponseModal(true)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accepter/Refuser l'invitation
                  </button>
                )}
                {interview.meeting_link && (
                  <a
                    href={interview.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-center"
                  >
                    🔗 Rejoindre la réunion
                  </a>
                )}
                {managerParticipation === 'accepted' && (
                  <div className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Vous avez accepté cet entretien
                  </div>
                )}
                {managerParticipation === 'refused' && (
                  <div className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Vous avez refusé cet entretien
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== COMPTE RENDU ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-800">Compte rendu</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasReportAccess && canExportInterviewReport && report && (
                <button
                  onClick={handleExportReport}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  📄 Télécharger
                </button>
              )}
              {canValidateCR && (
                <button
                  onClick={async () => {
                    try {
                      await entretienService.validateReport(id);
                      const response = await entretienService.getById(id);
                      setInterview(response.data);
                      toast.success('Compte rendu validé');
                    } catch {
                      toast.error('Impossible de valider le compte rendu');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  ✔️ Valider
                </button>
              )}
              {canValidateOffer && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        await entretienService.validateOffer(id, { action: 'approve' });
                        toast.success('Offre validée');
                      } catch {
                        toast.error('Impossible de valider l\'offre');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                  >
                    Valider l'offre
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await entretienService.validateOffer(id, { action: 'reject' });
                        toast.success('Offre refusée');
                      } catch {
                        toast.error('Impossible de refuser l\'offre');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
                  >
                    Refuser l'offre
                  </button>
                </>
              )}
              {(canEditCR || canAddCR) && (
                <button
                  onClick={() => setShowCR(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                >
                  <Edit className="w-3 h-3" />
                  {report ? 'Modifier le CR' : 'Ajouter le CR'}
                </button>
              )}
              {canDeleteCR && (
                <button
                  onClick={async () => {
                    try {
                      await entretienService.deleteReport(id);
                      setInterview(prev => ({ ...prev, report: null, compte_rendu: null }));
                      toast.success('Compte rendu supprimé');
                    } catch {
                      toast.error('Impossible de supprimer le compte rendu');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {report ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Date</p>
                    <p className="text-sm text-gray-900">{formatDate(interview.start_datetime)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Durée</p>
                    <p className="text-sm text-gray-900">{getDuration(interview.start_datetime, interview.end_datetime)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Lieu</p>
                    <p className="text-sm text-gray-900">{getLocationLabel(interview.location_type, interview.location, interview.meeting_link, interview.phone_number)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">⭐ Évaluation technique</h3>
                    <p className="text-gray-600 whitespace-pre-line">{report.evaluation_notes || 'Non renseigné'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">📝 Recommandation</h3>
                    <p className="text-gray-600">{report.recommendation || 'Favorable / À préciser'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <h3 className="text-sm font-semibold text-green-700 mb-2">💪 Points forts</h3>
                    <p className="text-gray-600 whitespace-pre-line">{report.strengths || 'Pas de points forts renseignés.'}</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <h3 className="text-sm font-semibold text-orange-700 mb-2">📉 Points d'amélioration</h3>
                    <p className="text-gray-600 whitespace-pre-line">{report.weaknesses || 'Pas de points d’amélioration renseignés.'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">💬 Commentaire</h3>
                  <p className="text-gray-600 whitespace-pre-line">{report.next_steps || 'Aucun commentaire supplémentaire.'}</p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <p>👤 Rédigé par : {reportAuthor?.first_name ? `${reportAuthor.first_name} ${reportAuthor.last_name}` : reportAuthor?.name || 'Utilisateur inconnu'}</p>
                  {report.validated_at && <p>✔️ Validé le : {new Date(report.validated_at).toLocaleString('fr-FR')}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun compte rendu n'a encore été rédigé pour ce entretien.</p>
                {canAddCR && (
                  <button
                    onClick={() => setShowCR(true)}
                    className="mt-4 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    📝 Rédiger le compte rendu
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>

      {/* ==================== MODALE COMPTE RENDU ==================== */}
      {showCR && (
        <InterviewReportModal
          entretien={interview}
          onClose={() => setShowCR(false)}
          onSave={handleSaveCR}
        />
      )}

      {/* ==================== MODALE RÉPONSE INVITATION ==================== */}
      {showResponseModal && (
        <InterviewResponseModal
          interview={interview}
          onClose={() => setShowResponseModal(false)}
          onSuccess={handleResponseSuccess}
        />
      )}
    </div>
  );
}
