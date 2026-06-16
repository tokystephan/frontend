import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviews } from '../../hooks/useInterviews';
import usePermissions from '../../hooks/usePermissions';
import StatCard from '../../components/events/StatCard';
import FiltersBar from '../../components/events/FiltersBar';
import InterviewCard from '../../components/events/InterviewCard';
import { Home, Calendar, Plus } from 'lucide-react';

export default function InterviewsDashboard() {
  const navigate = useNavigate();
  const { interviews, loading, error, filters, setFilters, changerStatut, supprimerEntretien, ajouterEntretien, majCompteRendu } = useInterviews();
  const { canCreateInterview } = usePermissions();

  const stats = useMemo(() => ({
    total: interviews.length,
    planifie: interviews.filter(e => (e.statut ?? e.status) === 'planifie').length,
    realise: interviews.filter(e => {
      const s = e.statut ?? e.status;
      return s === 'confirme' || s === 'termine' || s === 'realise';
    }).length,
    annule: interviews.filter(e => (e.statut ?? e.status) === 'annule').length,
    reporte: interviews.filter(e => (e.statut ?? e.status) === 'reporte').length,
  }), [interviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Entretiens</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Planification des entretiens</h1>
              <p className="mt-1 text-sm text-gray-500">
                Planifiez, filtrez et suivez tous vos entretiens.
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
              {canCreateInterview && (
                <button
                  onClick={() => navigate('/interviews/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Planifier un entretien
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================== CARTES STATISTIQUES ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total entretiens" value={stats.total} color="blue" />
          <StatCard label="Planifiés" value={stats.planifie} color="green" />
          <StatCard label="Réalisés" value={stats.realise} color="purple" />
          <StatCard label="Annulés" value={stats.annule} color="red" />
        </div>

        {/* ==================== BARRE DE FILTRES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <FiltersBar filters={filters} onChange={setFilters} />
        </div>

        {/* ==================== RÉSUMÉ ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-xs text-gray-500">Planifiés</span>
              <p className="text-xl font-bold text-green-600">{stats.planifie}</p>
            </div>
          </div>
        </div>

        {/* ==================== LISTE DES ENTRETIENS ==================== */}
        {interviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun entretien trouvé</h3>
            <p className="text-gray-500">
              Consultez la liste de vos entretiens à venir.
            </p>
            {canCreateInterview && (
              <button
                onClick={() => navigate('/interviews/create')}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Planifier un entretien
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map(e => (
              <InterviewCard
                key={e.id}
                entretien={e}
                onStatutChange={changerStatut}
                onSupprimer={supprimerEntretien}
                onCompteRenduSave={majCompteRendu}
              />
            ))}
          </div>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>

      {/* ==================== MODAL DE PLANIFICATION ==================== */}

    </div>
  );
}
