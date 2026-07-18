import React, { useEffect, useState, useRef } from 'react';
import { Plus, LayoutDashboard, Filter, Search, Briefcase, Building2, Archive, Eye, Edit, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import StatusBadge from '../../components/Common/StatusBadge';
import DataTable from '../../components/Tables/DataTable';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { archivePost, fetchPosts, restorePost } from '../../store/slices/postSlice';
import { POST_STATUSES } from '../../utils/constants';

const PostList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canManagePosts, canArchivePosts } = usePermissions();

  const { list: items, loading, error, lastPage = 1 } = useAppSelector((state) => state.posts);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toArchive, setToArchive] = useState(null);
  const [toRestore, setToRestore] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const prevSearchRef = useRef('');
  const prevStatusRef = useRef('');

  useEffect(() => {
    if (debouncedSearch !== prevSearchRef.current || status !== prevStatusRef.current) {
      setPage(1);
    }
    prevSearchRef.current = debouncedSearch;
    prevStatusRef.current = status;
  }, [debouncedSearch, status]);

  useEffect(() => {
    dispatch(fetchPosts({ search: debouncedSearch, status, page }));
  }, [dispatch, debouncedSearch, status, page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalPages = lastPage;
  const currentPage = Math.min(page, totalPages);

  const columns = [
    { 
      key: 'title', 
      title: 'Poste',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-500">ID: #{row.id}</p>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'Département',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{row.department?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'contractType',
      title: 'Contrat',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {row.contractType?.name || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/posts/${row.id}`)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManagePosts && (
            <button
              onClick={() => navigate(`/posts/${row.id}/edit`)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canArchivePosts && !row.is_archived && (
            <button
              onClick={() => setToArchive(row.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              title="Archiver"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          {canArchivePosts && row.is_archived && (
            <button
              onClick={() => setToRestore(row.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-emerald-50 transition-all duration-200"
              title="Restaurer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderPostMobileRow = (row) => (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">ID: #{row.id}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
          {row.contractType?.name || '-'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{row.department?.name || '-'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-900">Statut :</span> {row.status}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/posts/${row.id}`)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Eye className="w-4 h-4" /> Voir
        </button>
        {canManagePosts && (
          <button
            onClick={() => navigate(`/posts/${row.id}/edit`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
        )}
        {canArchivePosts && !row.is_archived && (
          <button
            onClick={() => setToArchive(row.id)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition"
          >
            <Archive className="w-4 h-4" /> Archiver
          </button>
        )}
        {canArchivePosts && row.is_archived && (
          <button
            onClick={() => setToRestore(row.id)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition"
          >
            <RotateCcw className="w-4 h-4" /> Restaurer
          </button>
        )}
      </div>
    </div>
  );

  const handleArchive = async () => {
    if (!toArchive) return;
    try {
      await dispatch(archivePost(toArchive)).unwrap();
      toast.success('Poste archivé avec succès');
      dispatch(fetchPosts({ search: debouncedSearch, status, page }));
    } catch (archiveError) {
      toast.error(archiveError || 'Erreur lors de l\'archivage');
    } finally {
      setToArchive(null);
    }
  };

  const handleRestore = async () => {
    if (!toRestore) return;
    try {
      await dispatch(restorePost(toRestore)).unwrap();
      toast.success('Poste restauré avec succès');
      dispatch(fetchPosts({ search: debouncedSearch, status, page }));
    } catch (restoreError) {
      toast.error(restoreError || 'Erreur lors de la restauration');
    } finally {
      setToRestore(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Gestion des postes</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Gestion des postes
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Création, modification et archivage des postes internes.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              {canManagePosts && (
                <Link
                  to="/posts/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau poste
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ==================== FILTRES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <SearchBar 
                  value={search} 
                  onChange={setSearch} 
                  placeholder="Rechercher un poste ou département..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isFilterOpen 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              
                <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus('')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    status === ''
                      ? 'bg-gray-900 text-white border border-gray-900'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Tous
                </button>
                {POST_STATUSES.map((item) => {
                  const statusColors = {
                    ouvert: 'bg-green-100 text-green-900 border-green-300 hover:bg-green-200',
                    ferme: 'bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300',
                    archive: 'bg-gray-300 text-gray-900 border-gray-400 hover:bg-gray-400',
                  };
                  const color = statusColors[item] || 'bg-gray-100 text-gray-900 border-gray-300';
                  const label = item === 'ouvert' ? '📢 Ouvert' : item === 'ferme' ? '🔒 Fermé' : item === 'archive' ? '🗄️ Archivé' : item;
                  
                  return (
                    <button
                      key={item}
                      onClick={() => setStatus(item)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        status === item
                          ? `${color} ring-2 ring-offset-2 ring-gray-400`
                          : `${color} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <option>Tous</option>
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <option>Tous</option>
                    <option>Informatique</option>
                    <option>Marketing</option>
                    <option>RH</option>
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
              <p className="text-xl font-bold text-gray-900">{items?.length || 0}</p>
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

        {/* ==================== TABLEAU ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable 
            columns={columns} 
            rows={items || []}    
            loading={loading} 
            emptyLabel="Aucun poste trouvé." 
            renderMobileRow={renderPostMobileRow}
          />
        </div>

        {/* ==================== PAGINATION ==================== */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
              <Pagination 
                page={currentPage} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          </div>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>

      {/* ==================== MODAL DE CONFIRMATION ==================== */}
      <ConfirmDialog
        open={Boolean(toArchive || toRestore)}
        title={toArchive ? 'Archiver le poste' : 'Restaurer le poste'}
        message={
          toArchive
            ? 'Cette action passera le poste en statut archivé. Vous pourrez toujours le consulter dans les archives.'
            : 'Cette action remettra le poste dans la liste active.'
        }
        onCancel={() => {
          setToArchive(null);
          setToRestore(null);
        }}
        onConfirm={toArchive ? handleArchive : handleRestore}
      />
    </div>
  );
};

export default PostList;