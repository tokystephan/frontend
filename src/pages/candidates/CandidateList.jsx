import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home, Eye, Edit, Search, Users, Trash2, AlertTriangle, Loader } from 'lucide-react';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import { DEFAULT_PAGE_SIZE, SOURCES, SOURCE_LABELS } from '../../utils/constants';
import axios from '../../api/axiosConfig';

const CandidateList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canManageCandidates } = usePermissions();
  const { items, loading, error } = useAppSelector((state) => state.candidates);

  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 250);

  // ✅ AJOUT : État pour la modale de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    candidate: null,
    loading: false,
    forceDelete: false,
    dependencies: []
  });

  useEffect(() => {
    dispatch(
      fetchCandidates({
        search: debouncedSearch || undefined,
        source: source || undefined,
      })
    );
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

  // ✅ AJOUT : Ouvrir la modale de suppression
  const openDeleteModal = (candidate) => {
    setDeleteModal({
      isOpen: true,
      candidate: candidate,
      loading: false,
      forceDelete: false,
      dependencies: []
    });
  };

  // ✅ AJOUT : Fermer la modale
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      candidate: null,
      loading: false,
      forceDelete: false,
      dependencies: []
    });
  };

  // ✅ AJOUT : Supprimer un candidat
  const handleDelete = async () => {
    const { candidate, forceDelete } = deleteModal;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      // La même ressource API gère la suppression et les contraintes de base.
      // Les anciennes URL /admin/candidates n'étaient accessibles qu'à
      // l'admin, alors que l'assistant RH peut aussi gérer les candidats.
      const url = `/candidates/${candidate.id}`;
      
      await axios.delete(url);
      
      toast.success(
        `Candidat ${candidate.first_name} ${candidate.last_name} supprimé avec succès`
      );
      
      closeDeleteModal();
      
      // Recharger la liste
      dispatch(
        fetchCandidates({
          search: debouncedSearch || undefined,
          source: source || undefined,
        })
      );
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      
      // Si erreur 422 = dépendances existantes
      if (error.response?.status === 422) {
        const deps = error.response?.data?.dependencies || [];
        setDeleteModal(prev => ({
          ...prev,
          loading: false,
          forceDelete: true,
          dependencies: deps
        }));
        toast.error(
          `⚠️ Ce candidat a des données associées: ${deps.join(', ')}. Utilisez la suppression forcée.`,
          { duration: 5000 }
        );
      } else {
        setDeleteModal(prev => ({ ...prev, loading: false }));
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
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
            <div className="space-y-4 md:hidden">
              {pagedRows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{row.last_name || '-'} {row.first_name || ''}</p>
                      <p className="text-sm text-gray-500">{row.email || 'Email non renseigné'}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {SOURCE_LABELS[row.source] || row.source || '-'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-900">Téléphone :</span> {row.phone || '-'}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/candidates/${row.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye className="w-4 h-4" /> Voir
                    </button>
                    {canManageCandidates && (
                      <button
                        onClick={() => navigate(`/candidates/${row.id}/edit`)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                    )}
                    {canManageCandidates && (
                      <button
                        onClick={() => openDeleteModal(row)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Prénom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3 text-right">Actions</th>
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
                          <div className="flex items-center justify-end gap-2">
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

                            {canManageCandidates && (
                              <button
                                onClick={() => openDeleteModal(row)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
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

      {/* ==================== MODALE DE SUPPRESSION ==================== */}
      {deleteModal.isOpen && deleteModal.candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            
            {/* En-tête */}
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold">Confirmer la suppression</h2>
            </div>
            
            {/* Message */}
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir supprimer le candidat ?
            </p>
            <p className="font-medium text-gray-900 text-lg mb-4">
              {deleteModal.candidate.first_name} {deleteModal.candidate.last_name}
            </p>
            
            {/* Informations du candidat */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> {deleteModal.candidate.email || 'Non renseigné'}</p>
              <p><span className="font-medium">Téléphone:</span> {deleteModal.candidate.phone || 'Non renseigné'}</p>
              <p><span className="font-medium">Source:</span> {SOURCE_LABELS[deleteModal.candidate.source] || deleteModal.candidate.source || 'N/A'}</p>
            </div>
            
            {/* ⚠️ Avertissement dépendances */}
            {deleteModal.forceDelete && deleteModal.dependencies.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                  <span>
                    <strong>⚠️ Attention :</strong> Ce candidat a des données associées :
                    <ul className="list-disc list-inside mt-1 text-yellow-700">
                      {deleteModal.dependencies.map((dep, index) => (
                        <li key={index}>{dep}</li>
                      ))}
                    </ul>
                    La <strong>suppression forcée</strong> supprimera également ces données.
                  </span>
                </p>
              </div>
            )}
            
            {/* Boutons */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeDeleteModal}
                disabled={deleteModal.loading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Annuler
              </button>
              
              {deleteModal.forceDelete && deleteModal.dependencies.length > 0 && (
                <button
                  onClick={handleDelete}
                  disabled={deleteModal.loading}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteModal.loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    '🗑️ Supprimer tout'
                  )}
                </button>
              )}
              
              <button
                onClick={handleDelete}
                disabled={deleteModal.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleteModal.loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  '🗑️ Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
