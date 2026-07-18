import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import InputField from '../../components/Forms/InputField';
import SelectField from '../../components/Forms/SelectField';
import DashboardLink from '../../components/Common/DashboardLink';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPost, updatePost, fetchPostById } from '../../store/slices/postSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { fetchContractTypes } from '../../store/slices/contractTypeSlice';

const postSchema = z.object({
  title: z.string().min(1, 'Titre du poste requis').max(255, 'Maximum 255 caractères'),
  department_id: z.preprocess(
    (value) => (typeof value === 'string' ? Number(value) : value),
    z.number().int().positive('Département requis')
  ),
  contract_type_id: z.preprocess(
    (value) => (typeof value === 'string' ? Number(value) : value),
    z.number().int().positive('Type de contrat requis')
  ),
  status: z.enum(['ouvert', 'ferme', 'en_attente']),
  description: z.string().optional(),
  requirements: z.string().optional(),
});


const PostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const editing = Boolean(id);
  
  // Récupérer les données depuis Redux
  const { current, loading: postLoading } = useAppSelector((state) => state.posts);
  const departments = useAppSelector((state) => state.departments?.list || []);
  const departmentsLoading = useAppSelector((state) => state.departments?.loading);
  const departmentsError = useAppSelector((state) => state.departments?.error);
  const contractTypes = useAppSelector((state) => state.contractTypes?.list || []);
  const contractTypesLoading = useAppSelector((state) => state.contractTypes?.loading);
  const contractTypesError = useAppSelector((state) => state.contractTypes?.error);
  const [formErrors, setFormErrors] = useState({});
  
  const [form, setForm] = useState({
    title: '',
    department_id: '',      // ✅ Changé: department → department_id (nombre)
    contract_type_id: '',   // ✅ Changé: contract_type → contract_type_id (nombre)
    status: 'ouvert',
    description: '',
    requirements: '',
  });

  // Charger les départements et types de contrat au montage
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchContractTypes());
  }, [dispatch]);

  // Charger les données du poste si édition
  useEffect(() => {
    if (!editing) return;

    let active = true;

    dispatch(fetchPostById(id))
      .unwrap()
      .then((data) => {
        if (!active) return;
        setForm({
          title: data.title || '',
          department_id: data.department_id ? String(data.department_id) : '',
          contract_type_id: data.contract_type_id ? String(data.contract_type_id) : '',
          status: data.status || 'ouvert',
          description: data.description || '',
          requirements: data.requirements || '',
        });
      })
      .catch(() => {
        toast.error('Erreur lors du chargement du poste');
      });

    return () => {
      active = false;
    };
  }, [dispatch, editing, id]);

  const departmentOptions = departments.map((item) => ({
    value: item.id,           // ✅ valeur = ID (nombre)
    label: item.name,
  }));

  const contractTypeOptions = contractTypes.map((item) => ({
    value: item.id,           // ✅ valeur = ID (nombre)
    label: item.name,
  }));

  const statusOptions = [
    { value: 'ouvert', label: 'Ouvert' },
    { value: 'ferme', label: 'Fermé' },
    { value: 'en_attente', label: 'En attente' },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setFormErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = postSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFormErrors(errors);
      toast.error(result.error.issues[0]?.message || 'Formulaire invalide');
      return;
    }

    const submitData = {
      title: result.data.title,
      department_id: result.data.department_id,
      contract_type_id: result.data.contract_type_id,
      status: result.data.status,
      description: result.data.description || '',
      requirements: result.data.requirements || '',
    };

    try {
      if (editing) {
        await dispatch(updatePost({ id, data: submitData })).unwrap();
        toast.success('Poste mis à jour');
      } else {
        await dispatch(createPost(submitData)).unwrap();
        toast.success('Poste créé');
      }
      navigate('/posts');
    } catch (saveError) {
      console.error('Erreur:', saveError);
      const errorMessage = typeof saveError === 'string'
        ? saveError
        : Array.isArray(saveError?.message)
        ? saveError.message[0]
        : saveError?.message || 'Erreur enregistrement';
      toast.error(errorMessage);
    }
  };

  const loading = departmentsLoading || contractTypesLoading || (editing && postLoading && !current);
  const error = departmentsError || contractTypesError;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--app-bg-soft) p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-(--app-surface) p-8 shadow-xl shadow-slate-200/60 border border-(--app-border)">
          <h1 className="text-2xl font-semibold text-(--app-text) mb-4">Impossible de charger le formulaire</h1>
          <p className="text-sm text-(--app-text-soft) mb-6">{error || 'Une erreur est survenue pendant le chargement des données.'}</p>
          <button
            type="button"
            onClick={() => {
              dispatch(fetchDepartments());
              dispatch(fetchContractTypes());
            }}
            className="rounded-lg bg-(--app-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--app-primary-hover)"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (departments.length === 0 || contractTypes.length === 0) {
    return (
      <div className="min-h-screen bg-(--app-bg-soft) p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-4xl bg-(--app-surface) p-8 shadow-[0_28px_60px_rgba(45,65,85,0.08)] border border-(--app-border)">
          <h1 className="text-2xl font-semibold text-(--app-text) mb-4">Aucune donnée disponible</h1>
          <p className="text-sm text-(--app-text-soft) mb-6">Vérifiez que les départements et les types de contrat existent dans le backend.</p>
          <button
            type="button"
            onClick={() => {
              dispatch(fetchDepartments());
              dispatch(fetchContractTypes());
            }}
            className="rounded-xl bg-(--app-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--app-primary-hover)"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--app-bg-soft) p-4 sm:p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="rounded-4xl border border-(--app-border) bg-(--app-surface) p-8 shadow-[0_28px_60px_rgba(45,65,85,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-(--app-text-soft)">Gestion des postes</p>
              <h1 className="mt-3 text-3xl font-semibold text-(--app-text)">
                {editing ? 'Modifier un poste' : 'Créer un nouveau poste'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-(--app-text-soft)">
                Complétez les informations du poste avant de l’enregistrer. Les champs obligatoires sont indiqués par un astérisque.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DashboardLink />
              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="inline-flex items-center justify-center rounded-full border border-(--app-border) bg-(--app-bg) px-4 py-2 text-sm font-semibold text-(--app-text) transition hover:bg-(--app-bg-soft)"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-(--app-border) bg-(--app-surface) p-8 shadow-[0_28px_60px_rgba(45,65,85,0.08)]">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Intitulé"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              error={formErrors.title?.[0]}
            />

            <SelectField
              label="Département"
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              options={departmentOptions}
              placeholder="Sélectionner un département"
              required
              error={formErrors.department_id?.[0]}
            />

            <SelectField
              label="Type de contrat"
              name="contract_type_id"
              value={form.contract_type_id}
              onChange={handleChange}
              options={contractTypeOptions}
              placeholder="Sélectionner un type de contrat"
              required
              error={formErrors.contract_type_id?.[0]}
            />

            <SelectField
              label="Statut"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={statusOptions}
              required
              error={formErrors.status?.[0]}
            />

            <label className="md:col-span-2 block space-y-2">
              <span className="text-sm font-medium text-(--app-text)">Description</span>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-text) outline-none transition focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/20"
              />
            </label>

            <label className="md:col-span-2 block space-y-2">
              <span className="text-sm font-medium text-(--app-text)">Prérequis</span>
              <textarea
                name="requirements"
                rows={4}
                value={form.requirements}
                onChange={handleChange}
                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-text) outline-none transition focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/20"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-(--app-primary) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--app-primary-hover)"
              >
                {editing ? 'Enregistrer le poste' : 'Créer le poste'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="inline-flex items-center justify-center rounded-2xl border border-(--app-border) bg-(--app-bg) px-6 py-3 text-sm font-semibold text-(--app-text) transition hover:bg-(--app-bg-soft)"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
