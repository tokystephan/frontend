import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home } from 'lucide-react';
import FileUpload from '../../components/Forms/FileUpload';
import InputField from '../../components/Forms/InputField';
import SelectField from '../../components/Forms/SelectField';
import { useAppDispatch } from '../../store/hooks';
import { createCandidateAction, fetchCandidateById, updateCandidateAction } from '../../store/slices/candidateSlice';
import { SOURCES, SOURCE_LABELS } from '../../utils/constants';
import api from '../../services/api';
import { candidateSchema } from '../../utils/validations';

const CandidateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const editing = Boolean(id);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    documents: [],
  });
  const [sources, setSources] = useState([]);

  // Load candidate data when editing
  useEffect(() => {
    if (!editing) return;
    let active = true;
    dispatch(fetchCandidateById(id))
      .unwrap()
      .then((data) => {
        if (!active) return;
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          source: data.source || '',
          documents: Array.isArray(data.documents) ? data.documents : [],
        });
      })
      .catch(() => {
        toast.error('Impossible de charger le candidat');
      });
    return () => {
      active = false;
    };
  }, [dispatch, editing, id]);

  // Fetch available sources for the select field
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await api.get('/sources');
        setSources(response.data);
        if (!editing) {
          if (response.data && response.data.length > 0) {
            setForm((prev) => ({ ...prev, source: response.data[0].name }));
          } else if (SOURCES && SOURCES.length > 0) {
            setForm((prev) => ({ ...prev, source: SOURCES[0] }));
          }
        }
      } catch (error) {
        console.error('Erreur chargement sources:', error);
      }
    };
    fetchSources();
  }, [editing]);

  const sourceOptions = useMemo(
    () =>
      (Array.isArray(sources) && sources.length > 0
        ? sources.map((item) => ({ value: item.name, label: item.name }))
        : SOURCES.map((src) => ({ value: src, label: SOURCE_LABELS[src] || src }))),
    [sources]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const removeDocument = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      documents: previous.documents.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedForm = {
      first_name: form.first_name?.trim() || '',
      last_name: form.last_name?.trim() || '',
      email: form.email?.trim() || '',
      phone: form.phone?.trim() || '',
      source: form.source || '',
      documents: Array.from(new Set(form.documents.filter(Boolean))),
    };

    const payload = {
      first_name: cleanedForm.first_name,
      last_name: cleanedForm.last_name,
      email: cleanedForm.email,
      phone: cleanedForm.phone,
      source: cleanedForm.source || '',
      documents: cleanedForm.documents,
    };

    const parsed = candidateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Formulaire invalide');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await dispatch(updateCandidateAction({ id, payload: parsed.data })).unwrap();
        toast.success('Candidat modifié avec succès');
      } else {
        await dispatch(createCandidateAction(parsed.data)).unwrap();
        toast.success('Candidat créé avec succès');
      }
      navigate('/candidates');
    } catch (saveError) {
      toast.error(typeof saveError === 'string' ? saveError : 'Erreur enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Formulaire candidat</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editing ? 'Modifier un candidat' : 'Nouveau candidat'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Renseignez les informations personnelles et les documents du profil.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/candidates')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* ==================== FORMULAIRE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField 
                label="Prénom" 
                name="first_name" 
                value={form.first_name} 
                onChange={handleChange} 
                required 
              />
              <InputField 
                label="Nom" 
                name="last_name" 
                value={form.last_name} 
                onChange={handleChange} 
                required 
              />
              <InputField 
                label="Email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
              />
              <InputField 
                label="Téléphone" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
              />
              <SelectField
                label="Source"
                name="source"
                value={form.source}
                onChange={handleChange}
                options={sourceOptions}
                required
              />
            </div>

            {/* Upload de documents */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <FileUpload
                label="Upload de documents"
                onFilesSelected={(documents) =>
                  setForm((previous) => ({
                    ...previous,
                    documents: Array.from(new Set([...(previous.documents || []), ...documents])),
                  }))
                }
              />

              {form.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.documents.map((doc, index) => (
                    <div
                      key={`${doc}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <p className="text-sm text-gray-700 truncate flex-1">{doc}</p>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le candidat'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/candidates')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Annuler
              </button>
            </div>
          </form>
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

export default CandidateForm;