import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import InputField from '../../components/Forms/InputField';
import SelectField from '../../components/Forms/SelectField';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import api from '../../services/api';
import {
  createNewApp,
  fetchApplicationById,
  editApp,
  clearError,
  clearMessage,
} from '../../store/slices/applicationSlice';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import { fetchPosts } from '../../store/slices/postSlice';
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  SOURCES,
  SOURCE_LABELS,
} from '../../utils/constants';
import { applicationSchema } from '../../utils/validations';
import usePermissions from '../../hooks/usePermissions';
import StatusHistory from './StatusHistory';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const editing = Boolean(id);
  const { canCreateApplication, canEditApplication } = usePermissions();
  const canAccessForm = editing ? canEditApplication : canCreateApplication;

  const candidates = useAppSelector((state) => state.candidates.items || []);
  const posts = useAppSelector((state) => state.posts.list || []);
  const { error, successMessage, loading } = useAppSelector((state) => state.applications);

  const [form, setForm] = useState({
    candidate_id: '',
    post_id: '',
    source_id: '',
    expected_salary: '',
    status: APPLICATION_STATUSES[0],
    assigned_to: '',
    notes: '',
  });
  const [statusHistory, setStatusHistory] = useState([]);
  const [sources, setSources] = useState([]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Gestion des messages de succès
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
      setTimeout(() => navigate('/applications'), 1500);
    }
  }, [successMessage, dispatch, navigate]);

  // Chargement des données
  useEffect(() => {
    if (!canAccessForm) return;

    dispatch(fetchCandidates());
    dispatch(fetchPosts());
    
    const fetchSources = async () => {
      try {
        const response = await api.get('/sources');
        if (response.data && response.data.length > 0) {
          setSources(response.data);
        } else {
          setSources(SOURCES.map((src) => ({ id: src, name: SOURCE_LABELS[src] || src })));
        }
      } catch (error) {
        console.error('Erreur chargement sources:', error);
        setSources(SOURCES.map((src) => ({ id: src, name: SOURCE_LABELS[src] || src })));
      }
    };
    fetchSources();

    if (!editing) return;

    let active = true;
    dispatch(fetchApplicationById(id))
      .unwrap()
      .then((data) => {
        if (!active) return;
        setForm({
          candidate_id: String(data.candidate_id || ''),
          post_id: String(data.post_id || ''),
          source_id: data.source_id ? String(data.source_id) : '',
          expected_salary: data.expected_salary ? String(data.expected_salary) : '',
          status: data.status || APPLICATION_STATUSES[0],
          assigned_to: data.assigned_to || '',
          notes: data.notes || '',
        });
        setStatusHistory(data.statusHistory || []);
      })
      .catch(() => {
        toast.error('Erreur lors du chargement de la candidature');
      });

    return () => {
      active = false;
    };
  }, [canAccessForm, dispatch, editing, id]);

  // Options des sélecteurs
  const candidateOptions = useMemo(
    () =>
      candidates.map((item) => ({
        value: String(item.id),
        label: `${item.first_name} ${item.last_name} – ${item.email}`,
      })),
    [candidates]
  );

  const postOptions = useMemo(
    () =>
      posts.map((item) => ({
        value: String(item.id),
        label: item.title,
      })),
    [posts]
  );

  const statusOptions = useMemo(
    () =>
      APPLICATION_STATUSES.map((item) => ({
        value: item,
        label: APPLICATION_STATUS_LABELS[item] || item,
      })),
    []
  );

  const sourceOptions = useMemo(
    () =>
      sources
        .filter((item) => item.id !== undefined && item.id !== null)
        .map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
    [sources]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.candidate_id) {
      toast.error('Veuillez sélectionner un candidat');
      return;
    }
    if (!form.post_id) {
      toast.error('Veuillez sélectionner un poste');
      return;
    }

    const toNumber = (value) => {
      if (!value) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };
    const toFloat = (value) => {
      if (!value) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const payload = {
      candidate_id: Number(form.candidate_id),
      post_id: Number(form.post_id),
      source_id: toNumber(form.source_id),
      expected_salary: toFloat(form.expected_salary),
      assigned_to: form.assigned_to || null,
      notes: form.notes || null,
      status: form.status || APPLICATION_STATUSES[0],
    };

    const parsed = applicationSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues?.[0]?.message || 'Formulaire invalide');
      return;
    }

    try {
      if (editing) {
        await dispatch(editApp({ id, data: parsed.data })).unwrap();
        toast.success('Candidature mise à jour');
      } else {
        await dispatch(createNewApp(parsed.data)).unwrap();
        toast.success('Candidature créée');
      }
      navigate('/applications');
    } catch (saveError) {
      toast.error(saveError?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading && editing) {
    return <LoadingSpinner />;
  }

  if (!canAccessForm) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-#3473a8"></span>
                <span>Formulaire de candidature</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editing ? 'Modifier une candidature' : 'Nouvelle candidature'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Renseignez les informations relatives à la candidature.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              ← Retour au Dashboard
            </Link>
          </div>
        </div>

        {/* ==================== FORMULAIRE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              {/* Ligne 1 : Candidat + Poste */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidat <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="candidate_id"
                    value={form.candidate_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner un candidat --</option>
                    {candidateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poste <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="post_id"
                    value={form.post_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner un poste --</option>
                    {postOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2 : Source + Salaire attendu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source de candidature
                  </label>
                  <select
                    name="source_id"
                    value={form.source_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Non renseignée --</option>
                    {sourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salaire attendu (€)
                  </label>
                  <input
                    type="number"
                    name="expected_salary"
                    value={form.expected_salary}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="Ex: 45000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Ligne 3 : Statut + Assigné à */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigné à
                  </label>
                  <input
                    type="text"
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={handleChange}
                    placeholder="Responsable du dossier"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Ligne 4 : Notes / Commentaires internes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaires internes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Ajoutez des notes internes sur cette candidature..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* ==================== BOUTONS ==================== */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer la candidature'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/applications')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
              <Link
                to="/applications"
                className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
              >
                ← Retour à la liste des candidatures
              </Link>
            </div>
          </form>
        </div>

        {/* ==================== HISTORIQUE DES STATUTS (si édition) ==================== */}
        {editing && statusHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">📜 Historique des statuts</h3>
              <p className="text-sm text-gray-500">Suivi des changements de statut de cette candidature.</p>
            </div>
            <div className="p-6">
              <StatusHistory history={statusHistory} />
            </div>
          </div>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
