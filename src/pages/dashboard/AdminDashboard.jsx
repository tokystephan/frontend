import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Search,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import toast from 'react-hot-toast'
import axios from '../../api/axiosConfig'
import AppLayout from '../../components/Layout/AppLayout'

const COLORS = ['#2A5C8E', '#4A7FAF', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6']

const DEFAULT_STATS = {
  totalApplications: 0,
  received: 0,
  inProgress: 0,
  accepted: 0,
  rejected: 0,
  openPosts: 0,
  totalCandidates: 0,
  activeUsers: 0,
  averageDelay: 0,
  successRate: 0,
}

const DEFAULT_DASHBOARD = {
  stats: DEFAULT_STATS,
  recentApplications: [],
  recentPosts: [],
  applicationsByStatus: [],
  applicationsByDepartment: [],
  monthlyTrend: [],
  applicationsBySource: [],
  users: [],
}

const normalizeRole = (roleValue) => {
  if (typeof roleValue === 'string') return roleValue.toLowerCase()
  if (roleValue && typeof roleValue === 'object' && typeof roleValue.name === 'string') {
    return roleValue.name.toLowerCase()
  }
  return 'direction'
}

const normalizeListPayload = (payload) => {
  const candidates = [payload?.users, payload?.data?.data, payload?.data, payload]
  return candidates.find((item) => Array.isArray(item)) || []
}

const normalizeDashboardPayload = (payload) => {
  const source = payload?.stats || payload || {}
  const normalizeStatusName = (name) => {
    const map = {
      Reçues: 'Reçue',
      Reçue: 'Reçue',
      'En cours': 'En cours',
      'Entretien RH': 'Entretien RH',
      'Entretien technique': 'Entretien technique',
      Accepté: 'Acceptée',
      Acceptée: 'Acceptée',
      Acceptées: 'Acceptée',
      Refusé: 'Refusée',
      Refusée: 'Refusée',
      Refusées: 'Refusée',
    }
    return map[name] || name
  }

  return {
    stats: {
      ...DEFAULT_STATS,
      totalApplications: source.totalApplications ?? DEFAULT_STATS.totalApplications,
      received: source.received ?? DEFAULT_STATS.received,
      inProgress: source.inProgress ?? DEFAULT_STATS.inProgress,
      accepted: source.accepted ?? DEFAULT_STATS.accepted,
      rejected: source.rejected ?? DEFAULT_STATS.rejected,
      openPosts: source.openPosts ?? source.totalPosts ?? DEFAULT_STATS.openPosts,
      totalCandidates: source.totalCandidates ?? DEFAULT_STATS.totalCandidates,
      activeUsers: source.activeUsers ?? DEFAULT_STATS.activeUsers,
      averageDelay: source.averageDelay ?? DEFAULT_STATS.averageDelay,
      successRate: source.successRate ?? DEFAULT_STATS.successRate,
    },
    applications: normalizeListPayload(payload?.recentApplications || payload?.applications),
    posts: normalizeListPayload(payload?.recentPosts || payload?.posts),
    statusChartData: normalizeListPayload(payload?.applicationsByStatus).map((entry) => ({
      ...entry,
      name: normalizeStatusName(entry?.name),
    })),
    departmentChartData: normalizeListPayload(payload?.applicationsByDepartment),
    monthlyTrendData: normalizeListPayload(payload?.monthlyTrend),
    sourceChartData: normalizeListPayload(payload?.applicationsBySource),
  }
}

const normalizeStatusLabel = (status) => {
  const map = {
    Reçues: 'Reçue',
    Reçue: 'Reçue',
    'En cours': 'En cours',
    'Entretien RH': 'Entretien RH',
    'Entretien technique': 'Entretien technique',
    Accepté: 'Acceptée',
    Acceptée: 'Acceptée',
    Acceptées: 'Acceptée',
    Refusé: 'Refusée',
    Refusée: 'Refusée',
    Refusées: 'Refusée',
  }
  return map[status] || status
}

const getStatusColor = (status) => {
  const normalized = normalizeStatusLabel(status)
  const map = {
    Reçue: 'bg-[var(--app-success)]/15 text-[var(--app-success)]',
    'En cours': 'bg-[var(--app-muted)]/15 text-[var(--app-muted)]',
    'Entretien RH': 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]',
    'Entretien technique': 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]',
    Acceptée: 'bg-[var(--app-success)]/15 text-[var(--app-success)]',
    Refusée: 'bg-[var(--app-danger)]/15 text-[var(--app-danger)]',
  }
  return map[normalized] || 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'assistant':
      return 'Assistant'
    case 'consultant':
      return 'Manager'
    case 'manager':
      return 'Manager'
    default:
      return 'Direction'
  }
}

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
    case 'assistant':
      return 'bg-[var(--app-bg-soft)] text-[var(--app-text-soft)]'
    case 'consultant':
      return 'bg-[var(--app-success)]/15 text-[var(--app-success)]'
    case 'manager':
      return 'bg-[var(--app-success)]/15 text-[var(--app-success)]'
    default:
      return 'bg-[var(--app-muted)]/15 text-[var(--app-muted)]'
  }
}

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [applications, setApplications] = useState([])
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [statusChartData, setStatusChartData] = useState([])
  const [departmentChartData, setDepartmentChartData] = useState([])
  const [monthlyTrendData, setMonthlyTrendData] = useState([])
  const [sourceChartData, setSourceChartData] = useState([])

  const applyDashboardData = useCallback((payload) => {
    const data = normalizeDashboardPayload(payload)
    setStats(data.stats)
    setApplications(data.applications)
    setPosts(data.posts)
    setStatusChartData(data.statusChartData)
    setDepartmentChartData(data.departmentChartData)
    setMonthlyTrendData(data.monthlyTrendData)
    setSourceChartData(data.sourceChartData)
  }, [])

  const fetchDashboardData = useCallback(async () => {
    const response = await axios.get('/admin/dashboard', { params: { period } })
    applyDashboardData(response.data)
  }, [applyDashboardData, period])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('/admin/users')
      const list = normalizeListPayload(response.data).map((item) => ({
        ...item,
        role: normalizeRole(item.role),
      }))
      setUsers(list)
    } catch {
      const fallback = await axios.get('/users')
      const list = normalizeListPayload(fallback.data).map((item) => ({
        ...item,
        role: normalizeRole(item.role),
      }))
      setUsers(list)
    }
  }, [])

  const handleExportReport = useCallback(async () => {
    try {
      const response = await axios.post('/admin/export', { type: 'applications' }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_recrutement_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export téléchargé')
    } catch {
      toast.error("Erreur lors de l'export")
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchDashboardData(), fetchUsers()])
    } catch {
      applyDashboardData(DEFAULT_DASHBOARD)
      setUsers(DEFAULT_DASHBOARD.users)
      toast.error('Données partielles: mode de secours activé')
    } finally {
      setLoading(false)
    }
  }, [applyDashboardData, fetchDashboardData, fetchUsers])

  useEffect(() => {
    load()
  }, [load])

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      if (filterStatus && normalizeStatusLabel(item.status) !== normalizeStatusLabel(filterStatus)) return false
      if (!searchTerm) return true
      const query = searchTerm.toLowerCase()
      return (
        item.candidate_name?.toLowerCase().includes(query) ||
        item.position?.toLowerCase().includes(query)
      )
    })
  }, [applications, filterStatus, searchTerm])

  const handleToggleUserStatus = useCallback(
    async (userId, currentStatus) => {
      try {
        await axios.patch(`/users/${userId}/status`, { is_active: !currentStatus })
        toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'}`)
        await fetchUsers()
      } catch {
        toast.error('Erreur lors du changement de statut')
      }
    },
    [fetchUsers],
  )

  const handleExportData = useCallback(async () => {
    try {
      const response = await axios.post('/admin/export', { type: 'applications' }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_recrutement_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export téléchargé')
    } catch {
      toast.error("Erreur lors de l'export")
    }
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-text-soft)] border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-0 space-y-3">
       

        <div className="flex flex-wrap gap-3 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <Link to="/applications/new" className="flex items-center gap-2 px-4 py-2 bg-[#8ca5c2] text-white rounded-lg hover:bg-[#4A7FAF] transition-all">
            <Plus className="h-4 w-4" /> Nouvelle candidature
          </Link>
          <Link to="/posts/new" className="flex items-center gap-2 px-4 py-2 bg-[#8ca5c2] text-white rounded-lg hover:bg-[#2E7D32]/80 transition-all">
            <Plus className="h-4 w-4" /> Nouveau poste
          </Link>
          <Link to="/interviews/create" className="flex items-center gap-2 px-4 py-2 bg-[#8ca5c2] text-white rounded-lg hover:bg-[#F59E0B]/80 transition-all">
            <Briefcase className="h-4 w-4" /> Planifier entretien
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-[#8ca5c2] text-white rounded-lg hover:bg-[#4A7FAF]/80 transition-all">
            <UserPlus className="h-4 w-4" /> Gérer utilisateurs
          </Link>
          <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
            <Download className="h-4 w-4" /> Exporter rapport
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <button type="button" onClick={() => setFilterStatus('')} className="rounded-xl border-l-4 border-[var(--app-text)] bg-[var(--app-bg-soft)] p-5 text-left shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Total candidatures</p><p className="text-2xl font-bold text-[var(--app-text)]">{stats.totalApplications}</p></button>
          <button type="button" onClick={() => setFilterStatus('Reçue')} className="rounded-xl border-l-4 border-[var(--app-success)] bg-[var(--app-bg-soft)] p-5 text-left shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Candidatures reçues</p><p className="text-2xl font-bold text-[var(--app-text)]">{stats.received}</p></button>
          <button type="button" onClick={() => setFilterStatus('En cours')} className="rounded-xl border-l-4 border-[var(--app-muted)] bg-[var(--app-bg-soft)] p-5 text-left shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">En cours</p><p className="text-2xl font-bold text-[var(--app-text)]">{stats.inProgress}</p></button>
          <button type="button" onClick={() => setFilterStatus('Acceptée')} className="rounded-xl border-l-4 border-[var(--app-success)] bg-[var(--app-bg-soft)] p-5 text-left shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Acceptées</p><p className="text-2xl font-bold text-[var(--app-text)]">{stats.accepted}</p></button>
          <button type="button" onClick={() => setFilterStatus('Refusée')} className="rounded-xl border-l-4 border-[var(--app-danger)] bg-[var(--app-bg-soft)] p-5 text-left shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Refusées</p><p className="text-2xl font-bold text-[var(--app-text)]">{stats.rejected}</p></button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-[var(--app-surface)] p-5 shadow-sm border border-[var(--app-border)]">
            <h3 className="mb-4 text-lg font-semibold text-[var(--app-text)]">Répartition par statut</h3>
            <div className="mb-4 flex flex-wrap gap-3">
              {statusChartData.map((entry, index) => (
                <div key={`legend-status-${index}`} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-[var(--app-text-soft)]">{entry.name}</span>
                  <span className="text-xs font-semibold text-[var(--app-text)]">{entry.value}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis dataKey="name" stroke="var(--app-text-soft)" />
                <YAxis stroke="var(--app-text-soft)" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-[var(--app-surface)] p-5 shadow-sm border border-[var(--app-border)]">
            <h3 className="mb-4 text-lg font-semibold text-[var(--app-text)]">Répartition par département</h3>
            <div className="mb-4 flex flex-wrap gap-3">
              {departmentChartData.map((entry, index) => (
                <div key={`legend-dept-${index}`} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-[var(--app-text-soft)]">{entry.name}</span>
                  <span className="text-xs font-semibold text-[var(--app-text)]">{entry.value}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={departmentChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false}>
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`dept-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION ÉVOLUTION DES RECRUTEMENTS */}
        <div className="rounded-xl bg-[var(--app-surface)] p-5 shadow-sm border border-[var(--app-border)]">
          <h3 className="mb-4 text-lg font-semibold text-[var(--app-text)]">Évolution des recrutements</h3>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded-md text-sm transition ${period === 'month' ? 'bg-[var(--app-text)] text-white shadow-sm' : 'text-[var(--app-text-soft)]'}`}
              >
                Mois
              </button>
              <button
                onClick={() => setPeriod('quarter')}
                className={`px-3 py-1 rounded-md text-sm transition ${period === 'quarter' ? 'bg-[var(--app-text)] text-white shadow-sm' : 'text-[var(--app-text-soft)]'}`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1 rounded-md text-sm transition ${period === 'year' ? 'bg-[var(--app-text)] text-white shadow-sm' : 'text-[var(--app-text-soft)]'}`}
              >
                Année
              </button>
            </div>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--app-border)] text-[var(--app-text)] rounded-lg hover:bg-[var(--app-bg-soft)] transition text-sm"
            >
              <Download className="h-4 w-4" /> Exporter
            </button>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-4 rounded-sm bg-[var(--app-text)]" />
              <span className="text-xs text-[var(--app-text-soft)]">Recrutements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4" style={{ backgroundColor: '#22C55E' }} />
              <span className="text-xs text-[var(--app-text-soft)]">Candidatures</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="month" stroke="var(--app-text-soft)" />
              <YAxis yAxisId="left" stroke="var(--app-text-soft)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--app-text-soft)" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="recruitments" fill="var(--app-text)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="applications" stroke="#22C55E" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] px-6 py-4">
            <h3 className="text-lg font-semibold text-[var(--app-text)]">Dernières candidatures</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-soft)]" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher..." className="w-64 rounded-lg border border-[var(--app-border)]/70 bg-[var(--app-surface)] py-2 pl-10 pr-4 text-[var(--app-text)] focus:border-[var(--app-text)] focus:outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--app-bg-soft)] text-left text-sm text-[var(--app-text-soft)]">
                <tr><th className="px-6 py-3">Candidat</th><th className="px-6 py-3">Poste</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]/60">
                {filteredApplications.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--app-bg-soft)]">
                    <td className="px-6 py-3 font-medium text-[var(--app-text)]">{item.candidate_name}</td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{item.position}</td>
                    <td className="px-6 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span></td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
            <h3 className="text-lg font-semibold text-[var(--app-text)]">Postes récents</h3>
            <Link to="/posts/new" className="text-sm text-[var(--app-text-soft)] hover:text-[var(--app-text)]">Nouveau poste</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--app-bg-soft)] text-left text-sm text-[var(--app-text-soft)]">
                <tr><th className="px-6 py-3">Poste</th><th className="px-6 py-3">Département</th><th className="px-6 py-3">Contrat</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3">Candidatures</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]/60">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--app-bg-soft)]">
                    <td className="px-6 py-3 font-medium text-[var(--app-text)]">{post.title}</td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{post.department}</td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{post.contract}</td>
                    <td className="px-6 py-3">{post.status === 'ouvert' ? <span className="text-[var(--app-success)]">Ouvert</span> : <span className="text-[var(--app-danger)]">Fermé</span>}</td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{post.candidates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
            <h3 className="text-lg font-semibold text-[var(--app-text)]">Utilisateurs</h3>
            <Link to="/admin/users" className="text-sm text-[var(--app-text-soft)] hover:text-[var(--app-text)]">Voir tout</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--app-bg-soft)] text-left text-sm text-[var(--app-text-soft)]">
                <tr><th className="px-6 py-3">Utilisateur</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Rôle</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]/60">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--app-bg-soft)]">
                    <td className="px-6 py-3 font-medium text-[var(--app-text)]">{item.first_name} {item.last_name}</td>
                    <td className="px-6 py-3 text-[var(--app-text-soft)]">{item.email}</td>
                    <td className="px-6 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeClass(item.role)}`}>{getRoleLabel(item.role)}</span></td>
                    <td className="px-6 py-3">{item.is_active ? <span className="text-[var(--app-success)]">Actif</span> : <span className="text-[var(--app-danger)]">Inactif</span>}</td>
                    <td className="px-6 py-3">
                      <button type="button" onClick={() => handleToggleUserStatus(item.id, item.is_active)} disabled={item.id === user?.id} className="rounded-md p-1 text-[var(--app-text-soft)] hover:bg-[var(--app-bg-soft)] disabled:cursor-not-allowed disabled:opacity-50">
                        {item.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[var(--app-bg-soft)] p-4 shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Refusées</p><p className="text-xl font-bold text-[var(--app-text)]">{stats.rejected}</p></div>
          <div className="rounded-xl bg-[var(--app-bg-soft)] p-4 shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Postes ouverts</p><p className="text-xl font-bold text-[var(--app-text)]">{stats.openPosts}</p></div>
          <div className="rounded-xl bg-[var(--app-bg-soft)] p-4 shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Total candidats</p><p className="text-xl font-bold text-[var(--app-text)]">{stats.totalCandidates}</p></div>
          <div className="rounded-xl bg-[var(--app-bg-soft)] p-4 shadow-sm"><p className="text-sm text-[var(--app-text-soft)]">Utilisateurs actifs</p><p className="text-xl font-bold text-[var(--app-text)]">{stats.activeUsers}</p></div>
        </div>

        {sourceChartData.length > 0 && (
          <div className="rounded-xl bg-[var(--app-surface)] p-5 shadow-sm border border-[var(--app-border)]">
            <h3 className="mb-4 text-lg font-semibold text-[var(--app-text)]">Sources de candidature</h3>
            <div className="mb-4 flex flex-wrap gap-3">
              {sourceChartData.map((source, index) => (
                <div key={`legend-source-${index}`} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-[var(--app-text-soft)]">{source.name}</span>
                  <span className="text-xs font-semibold text-[var(--app-text)]">{source.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {sourceChartData.map((source, index) => (
                <div key={source.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[var(--app-text-soft)]">{source.name}</span>
                    <span className="font-medium text-[var(--app-text)]">{source.percentage ?? 0}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--app-bg-soft)]">
                    <div className="h-full rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length], width: `${source.percentage ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default AdminDashboard
