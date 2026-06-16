import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home, Eye, Edit, Search, Users } from 'lucide-react';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import { DEFAULT_PAGE_SIZE, SOURCES, SOURCE_LABELS } from '../../utils/constants';

const CandidateList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canManageCandidates } = usePermissions();
  const { items, loading, error } = useAppSelector((state) => state.candidates);

  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    dispatch(
      fetchCandidates({
        search: debouncedSearch || undefined,
        source: source || undefined,
      })
    );
    setPage(1);
  }, [dispatch, debouncedSearch, source]);

  const totalPages = Math.max(1, Math.ceil(items.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return items.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [currentPage, items]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSourceChange = (event) => {
    setSource(event.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Gestion des candidats</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Candidats</h1>
              <p className="mt-1 text-sm text-gray-500">
                Centralisez les profils, les documents et l'historique des candidatures.
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
              {canManageCandidates && (
                <Link
                  to="/candidates/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Nouveau candidat
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ==================== FILTRES ET RECHERCHE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchBar
                  value={search}
                  onChange={handleSearch}
                  placeholder="Rechercher par nom, prénom, email..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={source}
                onChange={handleSourceChange}
                className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les sources</option>
                {SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {SOURCE_LABELS[item] || item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ==================== RÉSUMÉ ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{items.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-xs text-gray-500">Page</span>
              <p className="text-xl font-bold text-gray-900">{currentPage} / {totalPages}</p>
            </div>
          </div>
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer la recherche
            </button>
          )}
        </div>

        {/* ==================== TABLEAU DES CANDIDATS ==================== */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-500">Chargement des candidats...</p>
          </div>
        ) : pagedRows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun candidat trouvé</h3>
            <p className="text-gray-500">
              {search || source
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer un nouveau candidat'}
            </p>
            {canManageCandidates && !search && !source && (
              <Link
                to="/candidates/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                + Créer un candidat
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Prénom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {row.last_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.first_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.email || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.phone || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            {SOURCE_LABELS[row.source] || row.source || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/candidates/${row.id}`)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageCandidates && (
                              <button
                                onClick={() => navigate(`/candidates/${row.id}/edit`)}
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
              <div className="flex justify-center mt-6">
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateList;