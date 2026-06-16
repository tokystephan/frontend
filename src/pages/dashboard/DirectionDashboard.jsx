import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '../../components/Layout/AppLayout'
import { Download, RefreshCw } from 'lucide-react'
import { 
  ResponsiveContainer, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, 
  ComposedChart, Line, Legend 
} from 'recharts'
import axios from '../../api/axiosConfig'

// ✅ Constantes
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16']

const STATS_DEFAULTS = {
  totalApplications: 0,
  pending: 0,
  totalRecruitments: 0,
  averageDelay: 0,
  averageCost: 0,
  successRate: 0,
  recruitmentsChange: 0,
  applicationsChange: 0,
  delayChange: 0,
  costChange: 0,
  successChange: 0,
  monthlyTrend: [],
  applicationsByDepartment: [],
  applicationsBySource: [],
  averageTimeByStep: [],
  topPerformingSources: [],
  pendingValidations: [],
  recentRecruitments: [],
  openPosts: 0,
  totalApplicationsPeriod: 0,
  yearlyComparison: {
    recruitment: { current: 0, previous: 0, variation: 0 },
    cost: { current: 0, previous: 0, variation: 0 },
    delay: { current: 0, previous: 0, variation: 0 },
  },
}

const normalizeDirectionPayload = (payload) => ({
  monthlyTrend: Array.isArray(payload?.monthlyTrend)
    ? payload.monthlyTrend.map((item) => ({
        ...item,
        month_name: item.month_name || item.month || '',
        applications: Number(item.applications ?? item.count ?? 0),
        recruitments: Number(item.recruitments ?? item.count ?? 0),
      }))
    : [],
  applicationsByDepartment: Array.isArray(payload?.applicationsByDepartment)
    ? payload.applicationsByDepartment.map((item) => ({
        ...item,
        name: item.department ?? item.name ?? '',
        value: Number(item.count ?? item.value ?? 0),
      }))
    : [],
  applicationsBySource: Array.isArray(payload?.applicationsBySource)
    ? payload.applicationsBySource.map((item) => ({
        ...item,
        name: item.source ?? item.name ?? '',
        value: Number(item.count ?? item.value ?? 0),
      }))
    : [],
  pendingValidations: Array.isArray(payload?.pendingValidations) ? payload.pendingValidations : [],
  recentRecruitments: Array.isArray(payload?.recentRecruitments) ? payload.recentRecruitments : [],
})

const DirectionDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState(STATS_DEFAULTS)
  const [lastUpdate, setLastUpdate] = useState(null)

  // ✅ Fonction de chargement
  const fetchDirectionStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/statistics/direction', { 
        params: { period } 
      })
      
      if (response.data) {
        const payload = response.data
        const normalized = normalizeDirectionPayload(payload)

        setStats((prev) => ({
          ...prev,
          totalApplications: payload.totalApplications ?? prev.totalApplications,
          totalRecruitments: payload.totalApplicationsPeriod ?? prev.totalRecruitments,
          pending: payload.pending ?? prev.pending,
          averageDelay: payload.averageDelay ?? prev.averageDelay,
          successRate: payload.successRate ?? prev.successRate,
          openPosts: payload.openPosts ?? prev.openPosts,
          monthlyTrend: normalized.monthlyTrend,
          applicationsByDepartment: normalized.applicationsByDepartment,
          applicationsBySource: normalized.applicationsBySource,
          averageTimeByStep: payload.averageTimeByStep ?? prev.averageTimeByStep,
          topPerformingSources: payload.topPerformingSources ?? prev.topPerformingSources,
          pendingValidations: normalized.pendingValidations,
          recentRecruitments: normalized.recentRecruitments,
        }))
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Erreur chargement dashboard direction:', error)
      setError(error.response?.data?.message || 'Erreur de chargement des données')
    } finally {
      setLoading(false)
    }
  }, [period])

  // ✅ Chargement initial
  useEffect(() => {
    fetchDirectionStats()
  }, [fetchDirectionStats])

  // ✅ Rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchDirectionStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDirectionStats])

  // ✅ Export du rapport
  const handleExportReport = async () => {
    try {
      const response = await axios.post(
        '/statistics/direction/export', 
        { 
          type: 'applications',
          period,
          format: 'csv'
        }, 
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_direction_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur export:', error)
    }
  }

  // ✅ Validations
  const handleApproveValidation = async (id) => {
    try {
      await axios.post(`/statistics/direction/validations/${id}/approve`)
      setStats((prev) => ({
        ...prev,
        pendingValidations: prev.pendingValidations.filter((v) => v.id !== id),
      }))
    } catch (error) {
      console.error('Erreur approbation:', error)
    }
  }

  const handleRejectValidation = async (id) => {
    try {
      await axios.post(`/statistics/direction/validations/${id}/reject`)
      setStats((prev) => ({
        ...prev,
        pendingValidations: prev.pendingValidations.filter((v) => v.id !== id),
      }))
    } catch (error) {
      console.error('Erreur refus:', error)
    }
  }

  // ✅ Composant Carte Statistique
  const StatCard = ({ title, value, change, unit = '', color = 'text-[var(--app-text)]' }) => (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-4">
      <p className="text-xs uppercase text-[var(--app-text-soft)]">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {value}{unit}
      </p>
      {change !== undefined && change !== 0 && (
        <div className={`mt-1 text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs période précédente
        </div>
      )}
    </div>
  )

  // ✅ État de chargement
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--app-text)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-[var(--app-text-soft)]">Chargement du tableau de bord...</p>
        </div>
      </AppLayout>
    )
  }

  // ✅ État d'erreur
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchDirectionStats}
            className="mt-4 px-4 py-2 bg-[var(--app-text)] text-white rounded-lg hover:opacity-80"
          >
            Réessayer
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-text)]">
              Dashboard Direction
            </h2>
            <p className="text-sm text-[var(--app-text-soft)]">
              Vue synthétique globale pour le pilotage des recrutements
              {lastUpdate && (
                <span className="ml-2 text-xs">
                  (mis à jour à {lastUpdate.toLocaleTimeString()})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Boutons période */}
            <div className="flex bg-[var(--app-bg-soft)] rounded-lg p-1">
              {['month', 'quarter', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-sm transition capitalize ${
                    period === p 
                      ? 'bg-[var(--app-text)] text-white shadow-sm' 
                      : 'text-[var(--app-text-soft)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
                </button>
              ))}
            </div>

            {/* Bouton rafraîchir */}
            <button
              onClick={fetchDirectionStats}
              className="p-2 text-[var(--app-text-soft)] hover:text-[var(--app-text)] transition rounded-lg hover:bg-[var(--app-bg-soft)]"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Bouton export */}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--app-border)] text-[var(--app-text)] rounded-lg hover:bg-[var(--app-bg-soft)] transition text-sm"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Candidatures globales" 
            value={stats.totalApplications} 
            change={stats.applicationsChange} 
          />
          <StatCard 
            title="Dossiers en attente" 
            value={stats.pending} 
            color="text-yellow-600"
          />
          <StatCard 
            title="Postes ouverts" 
            value={stats.openPosts} 
          />
          <StatCard 
            title="Taux de succès" 
            value={stats.successRate} 
            unit="%" 
            change={stats.successChange}
            color={stats.successRate >= 70 ? 'text-green-600' : stats.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}
          />
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Évolution */}
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <h3 className="text-sm font-medium text-[var(--app-text)] mb-4">
              📈 Évolution des recrutements
            </h3>
            {stats.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                    <XAxis dataKey="month_name" stroke="var(--app-text-soft)" fontSize={12} />
                  <YAxis yAxisId="left" stroke="var(--app-text-soft)" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--app-text-soft)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: '8px',
                      color: 'var(--app-text)',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="applications" name="Candidatures" fill="var(--app-text)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="applications" name="Tendance" stroke="var(--app-success)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--app-text-soft)] py-8">
                Aucune donnée disponible
              </p>
            )}
          </div>

          {/* Répartition par département */}
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <h3 className="text-sm font-medium text-[var(--app-text)] mb-4">
              🏢 Répartition par département
            </h3>
            {stats.applicationsByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.applicationsByDepartment}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.applicationsByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--app-text-soft)] py-8">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>

        {/* Validations en attente */}
        {stats.pendingValidations.length > 0 && (
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-4">
            <h3 className="text-sm font-medium text-[var(--app-text)] mb-3">
              ⚠️ Validations en attente ({stats.pendingValidations.length})
            </h3>
            <div className="space-y-2">
              {stats.pendingValidations.map((validation) => (
                <div 
                  key={validation.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--app-surface)] rounded-lg gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">
                      {validation.title}
                    </p>
                    <p className="text-xs text-[var(--app-text-soft)]">
                      Montant: {validation.amount}€ | Demandé par: {validation.requested_by}
                      {validation.date && ` | ${new Date(validation.date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveValidation(validation.id)}
                      className="px-3 py-1 bg-[var(--app-success)] text-white rounded-md text-sm hover:bg-[var(--app-success)]/90 transition"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectValidation(validation.id)}
                      className="px-3 py-1 bg-[var(--app-danger)] text-white rounded-md text-sm hover:bg-[var(--app-danger)]/90 transition"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-[var(--app-text-soft)] text-center pt-4 border-t border-[var(--app-border)]/70">
          Les statistiques détaillées sont accessibles dans l'onglet Statistiques.
        </p>
      </div>
    </AppLayout>
  )
}

export default DirectionDashboard