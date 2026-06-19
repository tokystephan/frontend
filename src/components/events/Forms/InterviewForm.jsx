import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInterviews } from '../../../hooks/useInterviews';
import entretienService from '../../../services/entretienService';
import api from '../../../services/api';
import DashboardLink from '../../Common/DashboardLink';

export default function InterviewForm({ onClose, onCreated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createInterview, updateInterview } = useInterviews();
  const [form, setForm] = useState({
    candidature_id: '', candidat_id: '', type_entretien: 'rh', title: '', description: '',
    start_datetime: '', end_datetime: '', location_type: 'visio', location: '', meeting_link: '', phone_number: '', participants: [],
  });
  const [candidatures, setCandidatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const validationErrors = {};
    const now = new Date();
    const startDate = form.start_datetime ? new Date(form.start_datetime) : null;
    const endDate = form.end_datetime ? new Date(form.end_datetime) : null;

    if (!form.start_datetime) {
      validationErrors.start_datetime = 'La date de début est requise.';
    } else if (startDate <= now) {
      validationErrors.start_datetime = 'La date de début doit être dans le futur.';
    }

    if (!form.end_datetime) {
      validationErrors.end_datetime = 'La date de fin est requise.';
    } else if (startDate && endDate <= startDate) {
      validationErrors.end_datetime = 'La date de fin doit être après la date de début.';
    }

    if (!Array.isArray(form.participants) || form.participants.length === 0) {
      validationErrors.participants = 'Ajoutez au moins un participant.';
    }

    if (form.location_type === 'visio' && !form.meeting_link) {
      validationErrors.meeting_link = 'Le lien Google Meet est requis pour une visio.';
    }

    if (form.location_type === 'telephone' && !form.phone_number) {
      validationErrors.phone_number = 'Le numéro de téléphone est requis pour un entretien téléphonique.';
    }

    return validationErrors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, usersRes] = await Promise.all([
          api.get('/applications'),
          api.get('/users/participants')
        ]);
        const applicationsData = Array.isArray(appRes.data)
          ? appRes.data
          : Array.isArray(appRes.data?.data)
            ? appRes.data.data
            : [];
        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data?.data)
            ? usersRes.data.data
            : [];

        setCandidatures(applicationsData);
        setUsers(usersData);

        if (id) {
          const { data } = await entretienService.getById(id);
          const toDatetimeLocal = (s) => s ? s.slice(0,16).replace(' ', 'T') : '';
          setForm({
            candidature_id: data.application_id,
            candidat_id: data.candidate_id,
            type_entretien: data.event_type,
            title: data.title,
            description: data.description,
            start_datetime: toDatetimeLocal(data.start_datetime),
            end_datetime: toDatetimeLocal(data.end_datetime),
            location_type: data.location_type,
            location: data.location,
            meeting_link: data.meeting_link,
            phone_number: data.phone_number,
            participants: data.participants?.map(p => Number(p.user_id)) || [],
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'candidature_id') {
      const selectedApplication = candidatures.find((item) => String(item.id) === String(value));
      const candidateId = selectedApplication?.candidate_id || selectedApplication?.candidate?.id || '';
      setForm({ ...form, candidature_id: value, candidat_id: candidateId });
      setErrors(prev => ({ ...prev, candidature_id: undefined, candidate_id: undefined }));
      return;
    }

    setForm({ ...form, [name]: value });
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const toggleParticipant = (uid) => {
    setForm(prev => ({
      ...prev,
      participants: prev.participants.includes(uid) ? prev.participants.filter(id => id !== uid) : [...prev.participants, uid]
    }));
    setErrors(prev => ({ ...prev, participants: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Mapper les noms français aux noms anglais pour l'API
      const normalizeDatetimeForApi = (val) => {
        if (!val) return null;
        const withSpace = String(val).replace('T', ' ');
        return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
      };

      const apiData = {
        application_id: form.candidature_id,
        candidate_id: form.candidat_id,
        event_type: form.type_entretien,
        title: form.title,
        description: form.description,
        start_datetime: normalizeDatetimeForApi(form.start_datetime),
        end_datetime: normalizeDatetimeForApi(form.end_datetime),
        location_type: form.location_type,
        location: form.location,
        meeting_link: form.meeting_link,
        phone_number: form.phone_number,
        participants: Array.isArray(form.participants) ? form.participants.map(participantId => Number(participantId)) : [],
      };
      if (import.meta.env.DEV) console.log('API payload events.create', apiData);
      let savedInterview = null;
      if (id) {
        savedInterview = await updateInterview(id, apiData);
      } else {
        savedInterview = await createInterview(apiData);
      }
      if (onCreated && savedInterview) {
        onCreated(savedInterview);
      }
      if (onClose) {
        onClose();
      } else {
        navigate('/interviews');
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const normalized = Object.fromEntries(
          Object.entries(serverErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
        );
        setErrors(normalized);
        setServerError(err.response?.data?.message || 'Erreur de validation du formulaire');
      } else {
        setServerError(err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto p-6">
      <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#38bdf8]/30 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 bottom-10 w-48 h-48 rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
      <div className="relative bg-white border border-slate-200 rounded-[32px] shadow-[0_24px_80px_rgba(15,23,42,0.12)] p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-[#2563eb] font-semibold">Planification</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{id ? 'Modifier' : 'Créer'} un entretien</h1>
          <p className="mt-2 text-slate-600">Utilisez ce formulaire pour organiser un entretien avec le candidat et votre équipe.</p>
        </div>
        <div className="mb-6">
          <DashboardLink />
        </div>

        {serverError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <strong>Erreur :</strong> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Candidature *</label>
            <select
              name="candidature_id"
              value={form.candidature_id}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Sélectionner</option>
              {(Array.isArray(candidatures) ? candidatures : []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.candidate?.first_name || 'N/A'} {c.candidate?.last_name || ''} - {c.post?.title || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
            <select name="type_entretien" value={form.type_entretien} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option value="telephonique">Téléphonique</option>
              <option value="rh">RH</option>
              <option value="technique">Technique</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Début *</label>
              <input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleChange} required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.start_datetime && <p className="mt-2 text-sm text-rose-600">{errors.start_datetime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fin *</label>
              <input type="datetime-local" name="end_datetime" value={form.end_datetime} onChange={handleChange} required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.end_datetime && <p className="mt-2 text-sm text-rose-600">{errors.end_datetime}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lieu *</label>
            <select name="location_type" value={form.location_type} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option value="visio">Visio (Google Meet)</option>
              <option value="presentiel">Présentiel</option>
              <option value="telephone">Téléphone</option>
            </select>
          </div>
          {form.location_type === 'visio' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lien Google Meet *</label>
              <input name="meeting_link" value={form.meeting_link} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.meeting_link && <p className="mt-2 text-sm text-rose-600">{errors.meeting_link}</p>}
            </div>
          )}
          {form.location_type === 'presentiel' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse / Salle</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.location && <p className="mt-2 text-sm text-rose-600">{errors.location}</p>}
            </div>
          )}
          {form.location_type === 'telephone' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Numéro *</label>
              <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.phone_number && <p className="mt-2 text-sm text-rose-600">{errors.phone_number}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description (optionnelle)</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Participants * ({form.participants.length})</label>
            <div className="rounded-[28px] bg-slate-50 border border-slate-200">
              {loadingUsers ? (
                <div className="flex items-center justify-center p-6 text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  <span className="ml-3">Chargement des participants...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-[28px] border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                  Aucun participant interne disponible. Vérifiez que des utilisateurs RH / recruteur / manager / direction existent dans le backend.
                </div>
              ) : (
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-200 rounded-[28px] bg-white">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={form.participants.includes(u.id)}
                        onChange={() => toggleParticipant(u.id)}
                        className="h-4 w-4 text-sky-600 rounded border-slate-300"
                      />
                      <div className="text-sm text-slate-700">
                        <div className="font-medium">{`${u.first_name || ''} ${u.last_name || ''}`.trim()}</div>
                        <div className="text-xs text-slate-500">{u.role || 'Utilisateur interne'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.participants && <p className="mt-2 text-sm text-rose-600">{errors.participants}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={() => (onClose ? onClose() : navigate('/interviews'))} className="w-full sm:w-auto px-5 py-3 rounded-3xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-5 py-3 rounded-3xl bg-gradient-to-r from-[#2563eb] to-[#22d3ee] text-white shadow-[0_18px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_24px_50px_rgba(37,99,235,0.35)] transition">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}