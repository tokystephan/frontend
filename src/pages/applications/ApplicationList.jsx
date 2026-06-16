import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home, Eye, Edit, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import StatusBadge from '../../components/Common/StatusBadge';
import DataTable from '../../components/Tables/DataTable';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchApplications } from '../../store/slices/applicationSlice';
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, DEFAULT_PAGE_SIZE } from '../../utils/constants';

const ApplicationList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roleName, canManageApplications } = usePermissions();

  const { applications: items = [], loading = false, error = null } = useAppSelector(
    (state) => state.applications || {}
  );

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const formatEntityLabel = (entity, fallback = '-') => {
    if (entity == null) return fallback;
    if (typeof entity === 'string' || typeof entity === 'number') return String(entity);
    if (typeof entity === 'object') {
      return (
        entity.title ||
        entity.name ||
        `${entity.first_name || ''} ${entity.last_name || ''}`.trim() ||
        entity.description ||
        entity.email ||
        entity.label ||
        fallback
      );
    }
    return fallback;
  };

  const getCandidateName = useCallback((row) => {
    if (row?.candidate) {
      return formatEntityLabel(row.candidate, `#${row.candidate_id || '?'}`);
    }
    return row?.candidate_id ? `#${row.candidate_id}` : '-';
  }, []);

  const getPostTitle = useCallback((row) => {
    if (row?.post) {
      return formatEntityLabel(row.post, `#${row.post_id || '?'}`);
    }
    return row?.post_id ? `#${row.post_id}` : '-';
  }, []);

  const getAssignedTo = (row) => {
    if (row?.assigned_to) {
      return formatEntityLabel(row.assigned_to, '-');
    }
    return row?.created_by || '-';
  };

  const getSourceLabel = (row) => {
    if (row?.source?.name) return row.source.name;
    if (row?.source) return row.source;
    return '-';
  };

  const getApplicationDate = (row) => {
    if (row?.application_date) {
      return new Date(row.application_date).toLocaleDateString('fr-FR');
    }
    if (row?.created_at) {
      return new Date(row.created_at).toLocaleDateString('fr-FR');
    }
    return '-';
  };

  const validItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const normalizedSearch = debouncedSearch.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return validItems.filter((row) => {
      const matchesStatus = !status || row.status === status;
      const searchTerm = `${getCandidateName(row)} ${getPostTitle(row)}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchTerm.includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [validItems, status, normalizedSearch, getCandidateName, getPostTitle]);

  useEffect(() => {
    dispatch(fetchApplications(1));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return filteredItems.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const columns = [
    {
      key: 'candidate',
      title: 'Candidat',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">
              {getCandidateName(row).charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{getCandidateName(row)}</p>
            <p className="text-xs text-gray-500">{row.candidate?.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'post',
      title: 'Poste',
      render: (row) => (
        <div>
          <p className="text-gray-900">{getPostTitle(row)}</p>
          <p className="text-xs text-gray-500">{row.post?.department?.name || '-'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'date',
      title: 'Date',
      render: (row) => <span className="text-gray-600">{getApplicationDate(row)}</span>,
    },
    {
      key: 'source',
      title: 'Source',
      render: (row) => <span className="text-gray-600">{getSourceLabel(row)}</span>,
    },
    {
      key: 'assigned_to',
      title: 'Assigné à',
      render: (row) => <span className="text-gray-600">{getAssignedTo(row)}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/applications/${row.id}`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManageApplications && roleName !== 'consultant' && (
            <button
              onClick={() => navigate(`/applications/${row.id}/edit`)}
              className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Gestion des candidatures</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
              <p className="mt-1 text-sm text-gray-500">
                Suivi des statuts, commentaires et historique de traitement.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              {canManageApplications && roleName !== 'consultant' && (
                <Link
                  to="/applications/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Nouvelle candidature
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ==================== FILTRES ET RECHERCHE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher par candidat ou poste..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {status && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    1
                  </span>
                )}
              </button>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {APPLICATION_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {APPLICATION_STATUS_LABELS[item] || item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtres avancés (optionnel) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Toutes</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                    <option value="cooptation">Cooptation</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== RÉSUMÉ ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{filteredItems.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-xs text-gray-500">Page</span>
              <p className="text-xl font-bold text-gray-900">{currentPage} / {totalPages}</p>
            </div>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer la recherche
            </button>
          )}
        </div>

        {/* ==================== TABLEAU DES CANDIDATURES ==================== */}
        {loading && validItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-500">Chargement des candidatures...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune candidature trouvée</h3>
            <p className="text-gray-500">
              {search || status
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer une nouvelle candidature'}
            </p>
            {canManageApplications && !search && !status && (
              <Link
                to="/applications/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                + Créer une candidature
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Candidat</th>
                      <th className="px-6 py-3">Poste</th>
                      <th className="px-6 py-3">Statut</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3">Assigné à</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">
                                {getCandidateName(row).charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{getCandidateName(row)}</p>
                              <p className="text-xs text-gray-500">{row.candidate?.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{getPostTitle(row)}</p>
                          <p className="text-xs text-gray-500">{row.post?.department?.name || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge value={row.status} />
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {getApplicationDate(row)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {getSourceLabel(row)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {getAssignedTo(row)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/applications/${row.id}`)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageApplications && roleName !== 'consultant' && (
                              <button
                                onClick={() => navigate(`/applications/${row.id}/edit`)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==================== PAGINATION ==================== */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationList;