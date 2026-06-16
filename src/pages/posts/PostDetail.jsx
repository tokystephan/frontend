import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Clock3,
  Edit,
  FileText,
  Home,
  Layers3,
  ListChecks,
  Tag,
  Users,
} from 'lucide-react';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPostById, clearCurrent } from '../../store/slices/postSlice';
import { POST_STATUS_LABELS } from '../../utils/constants';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getName = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return value.name || value.title || value.label || '-';
};

const getDepartment = (post) => {
  return getName(post.department || post.departement || post.department_name || post.departmentName);
};

const getContract = (post) => {
  return getName(post.contractType || post.contract_type || post.contract || post.contract_type_name);
};

const normalizeSkills = (post) => {
  const rawSkills = post.skills || post.competences || post.required_skills || [];
  if (!Array.isArray(rawSkills)) return [];
  return rawSkills
    .map((skill) => (typeof skill === 'string' ? skill : skill.name || skill.label || skill.title))
    .filter(Boolean);
};

const InfoCard = ({ icon, label, value, children }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
          {children || <p className="mt-1 font-semibold text-gray-900">{value || '-'}</p>}
        </div>
      </div>
    </div>
  )
};

const Section = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  )
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canManagePosts } = usePermissions();
  const { current, loading, error } = useAppSelector((state) => state.posts);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPostById(id));
  }, [dispatch, id]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch]);

  const post = useMemo(() => current || {}, [current]);
  const skills = useMemo(() => normalizeSkills(post), [post]);
  const applicationCount = post.applications_count ?? post.applicationsCount ?? post.candidatures_count;

  if (loading && !current) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-500">Erreur</p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">Impossible de charger ce poste</h1>
          <p className="mt-3 text-sm text-gray-600">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchPostById(id))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
            <Link to="/posts" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-500">Introuvable</p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">Poste introuvable</h1>
          <p className="mt-3 text-sm text-gray-600">
            Le poste demandé n'a pas pu être chargé. Vérifiez qu'il existe bien et que vous êtes autorisé à le consulter.
          </p>
          <Link to="/posts" className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Retour à la liste des postes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ==================== BOUTONS NAVIGATION ==================== */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux postes
          </button>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            {canManagePosts && (
              <Link
                to={`/posts/${post.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              >
                <Edit className="h-4 w-4" />
                Modifier le poste
              </Link>
            )}
          </div>
        </div>

        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Briefcase className="h-4 w-4" />
                <span>Détail du poste</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{post.title || 'Poste sans titre'}</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                {post.summary || post.short_description || 'Vue complète du poste, de son statut et des informations utiles au suivi du recrutement.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Statut actuel</p>
                <div className="mt-2">
                  <StatusBadge value={post.status} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CARTES INFORMATIONS ==================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={Building2} label="Département" value={getDepartment(post)} />
          <InfoCard icon={Layers3} label="Type de contrat" value={getContract(post)} />
          <InfoCard icon={Users} label="Candidatures" value={applicationCount != null ? String(applicationCount) : '-'} />
          <InfoCard icon={Tag} label="Référence" value={`#${post.id}`} />
        </div>

        {/* ==================== DESCRIPTION + COMPÉTENCES + SUIVI ==================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Description */}
          <Section icon={FileText} title="Description du poste">
            <div className="bg-gray-50 rounded-lg p-4 min-h-[150px]">
              <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {post.description || 'Aucune description renseignée pour ce poste.'}
              </p>
            </div>
          </Section>

          {/* Compétences et Suivi */}
          <div className="space-y-6">
            {/* Compétences */}
            <Section icon={ListChecks} title="Compétences requises">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune compétence renseignée.</p>
              )}
            </Section>

            {/* Suivi */}
            <Section icon={CalendarDays} title="Suivi">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock3 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Créé le</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(post.created_at || post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Dernière mise à jour</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(post.updated_at || post.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Section>
          </div>
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

export default PostDetail;