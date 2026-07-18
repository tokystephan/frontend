import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import axios from '../../api/axiosConfig';
import AppLayout from '../../components/Layout/AppLayout';

const COLORS = ['var(--app-text)', 'var(--app-success)', 'var(--app-muted)', 'var(--app-danger)', 'var(--app-text-soft)'];

const DEFAULT_STATS = {
  totalApplications: 0,
  received: 0,
  inProgress: 0,
  interviews: 0,
  openPosts: 0,
  todayEvents: 0,
};

const normalizeListPayload = (payload) => {
  const candidates = [
    payload?.data?.data,
    payload?.data?.applications,
    payload?.data?.events,
    payload?.data?.activities,
    payload?.applications,
    payload?.events,
    payload?.activities,
    payload?.data,
    payload,
  ];
  return candidates.find((item) => Array.isArray(item)) || [];
};

const AssistantDashboard = ({ stats: initialStats }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const [stats, setStats] = useState({
    ...DEFAULT_STATS,
    totalApplications: initialStats?.totalApplications ?? DEFAULT_STATS.totalApplications,
    received: initialStats?.pending ?? DEFAULT_STATS.received,
  });
  const [pendingApplications, setPendingApplications] = useState([]);
  const [todayAgenda, setTodayAgenda] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [processingApplicationId, setProcessingApplicationId] = useState(null);

  // Mocks supprimés : dashboard en mode vide
  const applyMockData = useCallback(() => {
    setStats({ ...DEFAULT_STATS })
    setStatusChartData([])
    setPendingApplications([])
    setTodayAgenda([])
    setRecentActivities([])
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, pendingResponse, agendaResponse, activitiesResponse] = await Promise.all([
        axios.get('/assistant/dashboard'),
        axios.get('/assistant/applications/pending'),
        axios.get('/assistant/agenda/today'),
        axios.get('/assistant/activities'),
      ]);

      const dashboardPayload = dashboardResponse.data?.stats || dashboardResponse.data || {};
      setStats({
        ...DEFAULT_STATS,
        totalApplications: dashboardPayload.totalApplications ?? DEFAULT_STATS.totalApplications,
        received: dashboardPayload.received ?? dashboardPayload.pending ?? DEFAULT_STATS.received,
        inProgress: dashboardPayload.inProgress ?? DEFAULT_STATS.inProgress,
        interviews: dashboardPayload.interviews ?? DEFAULT_STATS.interviews,
        openPosts: dashboardPayload.openPosts ?? dashboardPayload.totalPosts ?? DEFAULT_STATS.openPosts,
        todayEvents: dashboardPayload.todayEvents ?? DEFAULT_STATS.todayEvents,
      });

      setStatusChartData(normalizeListPayload(dashboardResponse.data?.statusChart || dashboardResponse.data?.applicationsByStatus));
      setPendingApplications(normalizeListPayload(pendingResponse.data));
      setTodayAgenda(normalizeListPayload(agendaResponse.data));
      setRecentActivities(normalizeListPayload(activitiesResponse.data));
    } catch (error) {
      console.error('Erreur chargement données assistant:', error)
      applyMockData()
      toast.error('Données indisponibles')
    } finally {
      setLoading(false);
    }
  }, [applyMockData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleClearFilter = () => {
    setActiveFilter(null);
    setFilterValue(null);
    setSearchTerm('');
  };

  const handleCardClick = (status) => {
    if (!status) {
      handleClearFilter();
      return;
    }
    setActiveFilter('status');
    setFilterValue(status);
  };

  const handleProcessApplication = async (id) => {
    if (!id || processingApplicationId) return;

    setProcessingApplicationId(id);

    try {
      await axios.post(`/assistant/applications/${id}/process`);
      setPendingApplications((previous) => previous.filter((item) => item.id !== id));
      toast.success('Candidature prise en compte');
    } catch (error) {
      console.error('Erreur traitement candidature:', error);
      toast.error(error?.response?.data?.message || 'Impossible de traiter cette candidature');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Reçue': 'bg-[var(--app-success)]/15 text-[var(--app-success)]',
      'En cours': 'bg-[var(--app-muted)]/15 text-[var(--app-muted)]',
      'Entretien': 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]',
      'Accepté': 'bg-[var(--app-success)]/15 text-[var(--app-success)]',
      'Refusé': 'bg-[var(--app-danger)]/15 text-[var(--app-danger)]',
    };
    return colors[status] || 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-[var(--app-danger)] bg-[var(--app-danger)]/10';
      case 'medium':
        return 'text-[var(--app-muted)] bg-[var(--app-muted)]/10';
      case 'low':
        return 'text-[var(--app-success)] bg-[var(--app-success)]/10';
      default:
        return 'text-[var(--app-text-soft)] bg-[var(--app-bg-soft)]';
    }
  };

  const normalizePriority = (priority) => {
    const value = String(priority || '').toLowerCase();
    if (['high', 'haute', 'urgent', 'critical'].includes(value)) return 'high';
    if (['medium', 'moyenne', 'moyen', 'normal'].includes(value)) return 'medium';
    if (['low', 'basse', 'faible'].includes(value)) return 'low';
    return 'medium';
  };

  const getSourceLabel = (value) => {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return `Source ${value}`;
    if (typeof value === 'object') {
      if (typeof value.name === 'string' && value.name.trim()) return value.name;
      if (typeof value.label === 'string' && value.label.trim()) return value.label;
      if (typeof value.title === 'string' && value.title.trim()) return value.title;
      if (typeof value.source === 'string' && value.source.trim()) return value.source;
      if (typeof value.source_name === 'string' && value.source_name.trim()) return value.source_name;
      if (typeof value.value === 'string' && value.value.trim()) return value.value;
      return '-';
    }
    return String(value);
  };

  const getAgendaLabel = (value) => {
    if (!value) return 'Sans détail';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value.title || value.name || value.label || value.candidate || value.position || 'Sans détail';
    }
    return String(value);
  };

  const getActivityText = (activity) => {
    const action = activity?.action || 'Activité';
    const candidate = activity?.candidate || activity?.name || activity?.title || 'élément';
    return `${action} - ${candidate}`;
  };

  const filteredApplications = useMemo(() => {
    return pendingApplications.filter((app) => {
      if (activeFilter === 'status' && filterValue && app.status !== filterValue) return false;
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return app.candidate_name?.toLowerCase().includes(query) || app.position?.toLowerCase().includes(query);
    });
  }, [activeFilter, filterValue, pendingApplications, searchTerm]);

  // ✅ CORRECTION 1 : Ajouter la parenthèse fermante manquante
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-text)] border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
       
        {/* Barre d'actions */}
        <div className="flex flex-wrap gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
          <Link to="/applications/new" className="flex items-center gap-2 rounded-lg bg-[#8ca5c2] px-4 py-2 text-white hover:bg-[var(--app-text)]/90">
            <Plus className="h-4 w-4" /> Nouvelle candidature
          </Link>
          <Link to="/posts/new" className="flex items-center gap-2 rounded-lg bg-[#8ca5c2] px-4 py-2 text-white hover:bg-[var(--app-success)]/90">
            <Plus className="h-4 w-4" /> Nouveau poste
          </Link>
          <Link to="/interviews/create" className="flex items-center gap-2 rounded-lg bg-[#8ca5c2] px-4 py-2 text-white hover:bg-[var(--app-text)]/90">
            <Calendar className="h-4 w-4" /> Planifier entretien
          </Link>
          <Link to="/candidates" className="flex items-center gap-2 rounded-lg bg-[var(--app-border)] px-4 py-2 text-[var(--app-text)] hover:bg-[var(--app-bg-soft)]">
            <Users className="h-4 w-4" /> Voir candidats
          </Link>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => handleCardClick(null)}
            className="rounded-xl border-l-4 border-[var(--app-text)] bg-[var(--app-bg-soft)] p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--app-text-soft)]">Total candidatures</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{stats.totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-[var(--app-text)]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleCardClick('Reçue')}
            className="rounded-xl border-l-4 border-[var(--app-success)] bg-[var(--app-bg-soft)] p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--app-text-soft)]">À traiter</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{stats.received}</p>
              </div>
              <Clock className="h-8 w-8 text-[var(--app-success)]" />
            </div>
            <p className="mt-2 text-xs text-[var(--app-success)]">Nouvelles candidatures</p>
          </button>

          <div className="rounded-xl border-l-4 border-[var(--app-muted)] bg-[var(--app-bg-soft)] p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--app-text-soft)]">En cours</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[var(--app-muted)]" />
            </div>
          </div>

          <div className="rounded-xl border-l-4 border-[var(--app-text)] bg-[var(--app-bg-soft)] p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--app-text-soft)]">Entretiens</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{stats.interviews}</p>
              </div>
              <Calendar className="h-8 w-8 text-[var(--app-success)]" />
            </div>
            <p className="mt-2 text-xs text-[var(--app-text-soft)]">{stats.todayEvents} aujourd'hui</p>
          </div>

          <div className="rounded-xl border-l-4 border-[var(--app-muted)] bg-[var(--app-bg-soft)] p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--app-text-soft)]">Postes ouverts</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{stats.openPosts}</p>
              </div>
              <Briefcase className="h-8 w-8 text-[var(--app-muted)]" />
            </div>
          </div>
        </div>

        {/* Tableau des candidatures à traiter */}
        <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--app-border)] px-6 py-4">
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Candidatures à traiter</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-soft)]" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-64 rounded-lg border border-[var(--app-border)] py-2 pl-10 pr-4 text-[var(--app-text)] bg-[var(--app-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--app-text)]"
                />
              </div>
              {activeFilter && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="rounded-full bg-[var(--app-text)]/15 px-3 py-1 text-sm text-[var(--app-text)]"
                >
                  Filtre: {filterValue} x
                </button>
              )}
              <Link to="/applications" className="text-sm text-[var(--app-text-soft)] hover:text-[var(--app-text)]">
                Voir toutes
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--app-bg-soft)]">
                <tr className="text-left text-sm text-[var(--app-text-soft)]">
                  <th className="px-6 py-3">Candidat</th>
                  <th className="px-6 py-3">Poste</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Priorité</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]/60">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[var(--app-bg-soft)]">
                      <td className="px-6 py-3 font-medium text-[var(--app-text)]">{app.candidate_name}</td>
                      <td className="px-6 py-3 text-[var(--app-text-soft)]">{app.position}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[var(--app-text-soft)]">{app.date}</td>
                      <td className="px-6 py-3 text-sm text-[var(--app-text-soft)]">{getSourceLabel(app.source)}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(normalizePriority(app.priority))}`}>
                          {normalizePriority(app.priority) === 'high' ? 'Haute' : normalizePriority(app.priority) === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="p-1 text-[var(--app-text-soft)] hover:text-[var(--app-text)]"
                            title="Voir candidature"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProcessApplication(app.id)}
                            disabled={processingApplicationId === app.id}
                            className={`p-1 ${processingApplicationId === app.id ? 'cursor-not-allowed text-[var(--app-success)]/60' : 'text-[var(--app-text-soft)] hover:text-[var(--app-success)]'}`}
                            title="Traiter"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <Link
                            to={{
                              pathname: '/interviews/create',
                              search: `?application_id=${app.id}`,
                            }}
                            state={{ applicationId: app.id }}
                            className="p-1 text-[var(--app-text-soft)] hover:text-[var(--app-text)]"
                            title="Planifier entretien"
                          >
                            <Calendar className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-sm text-[var(--app-text-soft)]">
                      Aucune candidature ne correspond au filtre actuel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agenda et Activités récentes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Agenda du jour */}
          <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
            <div className="border-b border-[var(--app-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Agenda du jour</h2>
            </div>
            <div className="divide-y divide-[var(--app-border)]/60">
              {todayAgenda.length > 0 ? (
                todayAgenda.map((event) => (
                  <div key={event.id} className="p-4 hover:bg-[var(--app-bg-soft)]">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                          event.type === 'Entretien téléphonique'
                            ? 'bg-[var(--app-success)]/15 text-[var(--app-success)]'
                            : event.type === 'Entretien RH'
                              ? 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
                              : event.type === 'Entretien technique'
                                ? 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
                                : 'bg-[var(--app-muted)]/15 text-[var(--app-muted)]'
                        }`}
                      >
                        <Calendar className="h-5 w-5 text-[var(--app-text)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-[var(--app-text)]">{event.type}</p>
                          <span className="text-sm text-[var(--app-text-soft)]">{event.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--app-text-soft)]">
                          {getAgendaLabel(event.candidate)} - {getAgendaLabel(event.position)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--app-text-soft)]">{getAgendaLabel(event.location)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-[var(--app-text-soft)]">Aucun événement aujourd'hui.</p>
              )}
            </div>
            <div className="border-t border-[var(--app-border)]/70 bg-[var(--app-bg-soft)] px-6 py-3">
              <Link
                to="/interviews"
                className="flex items-center justify-center gap-1 text-sm text-[var(--app-text-soft)] hover:text-[var(--app-text)]"
              >
                Voir tout les entretiens
              </Link>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
            <div className="border-b border-[var(--app-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Activités récentes</h2>
            </div>
            <div className="divide-y divide-[var(--app-border)]/60">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-[var(--app-bg-soft)]">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          activity.icon === 'plus'
                            ? 'bg-[var(--app-success)]/15 text-[var(--app-success)]'
                            : activity.icon === 'edit'
                              ? 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
                              : 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
                        }`}
                      >
                        {activity.icon === 'plus' ? (
                          <Plus className="h-4 w-4 text-[var(--app-text)]" />
                        ) : activity.icon === 'edit' ? (
                          <FileText className="h-4 w-4 text-[var(--app-text)]" />
                        ) : (
                          <Calendar className="h-4 w-4 text-[var(--app-text)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--app-text)]">
                          <span className="font-medium">{activity.action || 'Activité'}</span> - {getActivityText(activity)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--app-text-soft)]">
                          par {activity.user || 'Système'} • {activity.time || 'à l’instant'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-[var(--app-text-soft)]">Aucune activité récente.</p>
              )}
            </div>
          </div>
        </div>

        {/* Graphique de répartition */}
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--app-text)]">Répartition des candidatures</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="name" stroke="var(--app-text-soft)" />
              <YAxis stroke="var(--app-text-soft)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--app-surface)',
                  borderRadius: '8px',
                  color: 'var(--app-text)',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssistantDashboard;