import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home, Eye, Download, Plus, Trash2, User, Mail, Phone, Calendar, Tag } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import usePermissions from '../../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, updateCandidateAction } from '../../store/slices/candidateSlice';
import { APPLICATION_STATUS_LABELS, SOURCE_LABELS } from '../../utils/constants';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatShortDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getPostLabel = (application) => {
  return application.post?.title || application.post_title || application.position || `Poste #${application.post_id || '-'}`;
};

const getApplicationStatus = (application) => {
  return APPLICATION_STATUS_LABELS[application.status] || application.status || '-';
};

const resolveDocumentName = (documentItem, index) => {
  if (typeof documentItem === 'string') return documentItem;
  if (documentItem?.name) return documentItem.name;
  return `Document_${index + 1}`;
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="border-b border-gray-100 pb-3">
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
      <Icon className="w-3 h-3" />
      <span className="uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-gray-900 font-medium">{value || '-'}</p>
  </div>
);

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const uploadRef = useRef(null);
  const { canManageCandidates } = usePermissions();

  const { current, loading, error } = useAppSelector((state) => state.candidates);
  const applicationState = useAppSelector((state) => state.applications);
  const [savingDocs, setSavingDocs] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setFetchError(null);
        await dispatch(fetchCandidateById(id)).unwrap();
      } catch (err) {
        console.error('Erreur chargement:', err);
        setFetchError(typeof err === 'string' ? err : err?.message || 'Candidat non trouvé');
        toast.error('Candidat introuvable');
      }
    };
    if (id) {
      loadCandidate();
    } else {
      setFetchError('ID du candidat manquant');
    }
  }, [dispatch, id]);

  const fallbackApplications = useMemo(() => {
    const items = Array.isArray(applicationState.applications)
      ? applicationState.applications
      : Array.isArray(applicationState.items)
      ? applicationState.items
      : [];
    return items.filter((item) => Number(item.candidate_id) === Number(id));
  }, [applicationState.applications, applicationState.items, id]);

  const candidateApplications = useMemo(() => {
    const embedded = Array.isArray(current?.applications) ? current.applications : [];
    const all = [...embedded, ...fallbackApplications];
    const unique = new Map();
    all.forEach((item) => {
      if (item?.id != null) unique.set(item.id, item);
    });
    return Array.from(unique.values())
      .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
  }, [current?.applications, fallbackApplications]);

  const documentItems = useMemo(() => {
    const items = [];

    if (current?.cv_url) {
      items.push({
        id: 'cv',
        type: 'cv',
        name: 'CV',
        download_url: current.cv_url,
      });
    }

    if (current?.motivation_letter_url) {
      items.push({
        id: 'motivation_letter',
        type: 'motivation_letter',
        name: 'Lettre de motivation',
        download_url: current.motivation_letter_url,
      });
    }

    if (Array.isArray(current?.document_records)) {
      current.document_records.forEach((doc) => {
        items.push({
          id: `record-${doc.id}`,
          type: doc.type || 'document',
          name: doc.name || doc.file_name || `Document_${doc.id}`,
          download_url: doc.download_url || doc.url || null,
          mime_type: doc.mime_type,
        });
      });
    }

    if (Array.isArray(current?.documents)) {
      current.documents.forEach((doc, index) => {
        items.push({
          id: `legacy-${index}`,
          type: typeof doc === 'object' ? doc.type || 'document' : 'legacy',
          name: resolveDocumentName(doc, index),
          download_url: typeof doc === 'object' ? doc?.download_url || doc?.url : null,
          raw: typeof doc === 'string' ? doc : null,
        });
      });
    }

    return items;
  }, [current?.cv_url, current?.motivation_letter_url, current?.document_records, current?.documents]);

  const handleDownload = (documentItem, index) => {
    const filename = resolveDocumentName(documentItem, index);
    const url = documentItem?.download_url || documentItem?.url || null;
    if (url) {
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    const blob = new Blob([`Document: ${filename}`], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleAddDocuments = async (event) => {
    const fileNames = Array.from(event.target.files || []).map((file) => file.name).filter(Boolean);
    if (!fileNames.length || !current) return;
    const merged = Array.from(new Set([...(current.documents || []), ...fileNames]));
    setSavingDocs(true);
    try {
      await dispatch(
        updateCandidateAction({
          id: current.id,
          payload: {
            first_name: current.first_name,
            last_name: current.last_name,
            email: current.email,
            phone: current.phone || '',
            source: current.source,
            documents: merged,
          },
        })
      ).unwrap();
      toast.success('Documents ajoutés');
      await dispatch(fetchCandidateById(id)).unwrap();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Erreur lors de l’ajout des documents');
    } finally {
      setSavingDocs(false);
      event.target.value = '';
    }
  };

  if (loading && !current && !fetchError) {
    return <LoadingSpinner />;
  }

  if (fetchError || (!loading && !current)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidat introuvable</h2>
          <p className="text-gray-500 mb-4">{fetchError || error || 'Le candidat demandé n’existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => navigate('/candidates')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-gray-500">Aucune information disponible pour ce candidat.</p>
          <button onClick={() => navigate('/candidates')} className="mt-4 text-blue-600 hover:underline">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Fiche candidat</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {current.first_name} {current.last_name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">ID: #{current.id}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              {canManageCandidates && (
                <Link
                  to={`/candidates/${current.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Modifier
                </Link>
              )}
              <button
                onClick={() => navigate('/candidates')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* ==================== INFORMATIONS PERSONNELLES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={User} label="Nom complet" value={`${current.first_name} ${current.last_name}`} />
            <InfoRow icon={Mail} label="Email" value={current.email} />
            <InfoRow icon={Phone} label="Téléphone" value={current.phone || 'Non renseigné'} />
            <InfoRow icon={Tag} label="Source" value={SOURCE_LABELS[current.source] || current.source || '-'} />
            <InfoRow icon={Calendar} label="Date d'ajout" value={formatShortDate(current.created_at)} />
            <InfoRow icon={Tag} label="ID" value={`#${current.id}`} />
          </div>
        </div>

        {/* ==================== DOCUMENTS ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Documents
            </h2>
            {canManageCandidates && (
              <>
                <input
                  ref={uploadRef}
                  type="file"
                  multiple
                  onChange={handleAddDocuments}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={savingDocs}
                  onClick={() => uploadRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {savingDocs ? 'Ajout...' : 'Ajouter un document'}
                </button>
              </>
            )}
          </div>
          {documentItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucun document enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documentItems.map((doc, index) => (
                <div key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 truncate flex-1">{doc.name || `Document ${index + 1}`}</span>
                  <button
                    onClick={() => handleDownload(doc, index)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== HISTORIQUE DES CANDIDATURES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Historique des candidatures
          </h2>
          {candidateApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucune candidature liée à ce candidat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Poste</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidateApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{getPostLabel(app)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {getApplicationStatus(app)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {formatShortDate(app.created_at || app.createdAt || app.application_date)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;