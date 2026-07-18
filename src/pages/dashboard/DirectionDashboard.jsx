// src/pages/dashboard/DirectionDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '../../components/Layout/AppLayout'
import { Download, RefreshCw, Check, X } from 'lucide-react'
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts'
import axios from '../../api/axiosConfig'

// ============================================================
// CONSTANTES
// ============================================================
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

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================
const safeNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val))

const normalizeDirectionPayload = (payload) => ({
  monthlyTrend: Array.isArray(payload?.monthlyTrend)
    ? payload.monthlyTrend.map((item) => ({
        month_name: item.month_name || item.month || '',
        applications: safeNumber(item.applications ?? item.count ?? 0),
        recruitments: safeNumber(item.recruitments ?? item.hires ?? 0),
      }))
    : [],
  applicationsByDepartment: Array.isArray(payload?.applicationsByDepartment)
    ? payload.applicationsByDepartment.map((item) => ({
        name: item.department ?? item.name ?? '',
        value: safeNumber(item.count ?? item.value ?? 0),
      }))
    : [],
  applicationsBySource: Array.isArray(payload?.applicationsBySource)
    ? payload.applicationsBySource.map((item) => ({
        name: item.source ?? item.name ?? '',
        value: safeNumber(item.count ?? item.value ?? 0),
      }))
    : [],
  pendingValidations: Array.isArray(payload?.pendingValidations) ? payload.pendingValidations : [],
  recentRecruitments: Array.isArray(payload?.recentRecruitments) ? payload.recentRecruitments : [],
})

// ============================================================
// COMPOSANT TOAST
// ============================================================
const Toast = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500'
  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2`}
    >
      {type === 'success' ? <Check className="w-4 h-4" /> : type === 'error' ? <X className="w-4 h-4" /> : null}
      {message}
    </div>
  )
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const DirectionDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState(STATS_DEFAULTS)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [toast, setToast] = useState(null)

  // ============================================================
  // CHARGEMENT DES DONNÉES (API RÉELLE UNIQUEMENT)
  // ============================================================
  const fetchDirectionStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/statistics/direction', {
        params: { period },
      })

      if (response.data) {
        const payload = response.data
        const normalized = normalizeDirectionPayload(payload)

        setStats((prev) => ({
          ...prev,
          totalApplications: safeNumber(payload.totalApplications ?? prev.totalApplications),
          totalRecruitments: safeNumber(
            payload.totalRecruitments ?? payload.totalApplicationsPeriod ?? prev.totalRecruitments
          ),
          pending: safeNumber(payload.pending ?? prev.pending),
          averageDelay: safeNumber(payload.averageDelay ?? prev.averageDelay),
          successRate: safeNumber(payload.successRate ?? prev.successRate),
          openPosts: safeNumber(payload.openPosts ?? prev.openPosts),
          monthlyTrend: normalized.monthlyTrend,
          applicationsByDepartment: normalized.applicationsByDepartment,
          applicationsBySource: normalized.applicationsBySource,
          averageTimeByStep: payload.averageTimeByStep ?? prev.averageTimeByStep,
          topPerformingSources: payload.topPerformingSources ?? prev.topPerformingSources,
          pendingValidations: normalized.pendingValidations,
          recentRecruitments: normalized.recentRecruitments,
          yearlyComparison: payload.yearlyComparison ?? prev.yearlyComparison,
          recruitmentsChange: safeNumber(payload.recruitmentsChange ?? 0),
          applicationsChange: safeNumber(payload.applicationsChange ?? 0),
          delayChange: safeNumber(payload.delayChange ?? 0),
          costChange: safeNumber(payload.costChange ?? 0),
          successChange: safeNumber(payload.successChange ?? 0),
        }))
        setLastUpdate(new Date())
        showToast('Données mises à jour', 'success')
      }
    } catch (error) {
      console.error('Erreur chargement dashboard direction:', error)
      setError(error.response?.data?.message || 'Erreur de chargement des données')
      showToast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [period])

  // Helper pour les toasts
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  // Chargement initial
  useEffect(() => {
    fetchDirectionStats()
  }, [fetchDirectionStats])

  // Rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchDirectionStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDirectionStats])

  // ============================================================
  // EXPORT (avec vérification du blob)
  // ============================================================
  const handleExportReport = async () => {
    try {
      const response = await axios.post(
        '/statistics/direction/export',
        {
          type: 'applications',
          period,
          format: 'csv',
        },
        { responseType: 'blob' }
      )

      // Vérifier que la réponse est un blob valide
      if (!response.data || response.data.size === 0) {
        throw new Error('Le fichier exporté est vide')
      }

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_direction_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('Export réussi', 'success')
    } catch (error) {
      console.error('Erreur export:', error)
      // Récupérer le message d'erreur du backend si disponible
      let errorMsg = "Erreur lors de l'export"
      if (error.response?.data) {
        // Si c'est un blob d'erreur, on le lit en texte
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text()
            const json = JSON.parse(text)
            errorMsg = json.message || errorMsg
          } catch {
            // si ce n'est pas du JSON, on garde le message par défaut
          }
        } else {
          errorMsg = error.response.data?.message || errorMsg
        }
      } else if (error.message) {
        errorMsg = error.message
      }
      showToast('Erreur: ' + errorMsg, 'error')
    }
  }

  // ============================================================
  // VALIDATIONS
  // ============================================================
  const handleApproveValidation = async (id) => {
    try {
      await axios.post(`/statistics/direction/validations/${id}/approve`)
      setStats((prev) => ({
        ...prev,
        pendingValidations: prev.pendingValidations.filter((v) => v.id !== id),
      }))
      showToast('Validation approuvée', 'success')
    } catch (error) {
      console.error('Erreur approbation:', error)
      showToast('Erreur lors de l\'approbation', 'error')
    }
  }

  const handleRejectValidation = async (id) => {
    try {
      await axios.post(`/statistics/direction/validations/${id}/reject`)
      setStats((prev) => ({
        ...prev,
        pendingValidations: prev.pendingValidations.filter((v) => v.id !== id),
      }))
      showToast('Validation rejetée', 'success')
    } catch (error) {
      console.error('Erreur refus:', error)
      showToast('Erreur lors du rejet', 'error')
    }
  }

  // ============================================================
  // COMPOSANT CARTE STATISTIQUE
  // ============================================================
  const StatCard = ({ title, value, change, unit = '', color = 'text-[var(--app-text)]' }) => (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-4">
      <p className="text-xs uppercase text-[var(--app-text-soft)]">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {value}
        {unit}
      </p>
      {change !== undefined && change !== 0 && (
        <div className={`mt-1 text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs période précédente
        </div>
      )}
    </div>
  )

  // ============================================================
  // RENDU
  // ============================================================
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

  const chartData = stats.monthlyTrend

  return (
    <AppLayout>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="space-y-6">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-text)]">Dashboard Direction</h2>
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
            {/* Filtres période */}
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

            {/* Rafraîchir */}
            <button
              onClick={fetchDirectionStats}
              className="p-2 text-[var(--app-text-soft)] hover:text-[var(--app-text)] transition rounded-lg hover:bg-[var(--app-bg-soft)]"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Exporter */}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--app-border)] text-[var(--app-text)] rounded-lg hover:bg-[var(--app-bg-soft)] transition text-sm"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        {/* ==================== KPIs ==================== */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Candidatures globales" value={stats.totalApplications} change={stats.applicationsChange} />
          <StatCard title="Dossiers en attente" value={stats.pending} color="text-yellow-600" />
          <StatCard title="Postes ouverts" value={stats.openPosts} />
          <StatCard
            title="Taux de succès"
            value={stats.successRate}
            unit="%"
            change={stats.successChange}
            color={
              stats.successRate >= 70
                ? 'text-green-600'
                : stats.successRate >= 50
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          />
        </div>

        {/* ==================== GRAPHIQUES ==================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Évolution des recrutements */}
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <h3 className="text-sm font-medium text-[var(--app-text)] mb-4">
              📈 Évolution des recrutements
            </h3>
            {chartData.length > 0 ? (
              <>
                <div className="mb-3 flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-4 rounded-sm bg-[var(--app-text)]" />
                    <span className="text-xs text-[var(--app-text-soft)]">Recrutements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded-sm bg-[#22C55E]" />
                    <span className="text-xs text-[var(--app-text-soft)]">Candidatures</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                    <XAxis dataKey="month_name" stroke="var(--app-text-soft)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--app-text-soft)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--app-text-soft)" fontSize={12} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--app-surface)',
                        border: '1px solid var(--app-border)',
                        borderRadius: '8px',
                        color: 'var(--app-text)',
                      }}
                    />
                    <Bar yAxisId="left" dataKey="recruitments" fill="var(--app-text)" radius={[4, 4, 0, 0]} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="applications"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-center text-[var(--app-text-soft)] py-8">Aucune donnée disponible</p>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: '8px',
                      color: 'var(--app-text)',
                    }}
                  />
                </PieChart>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {stats.applicationsByDepartment.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2 text-xs text-[var(--app-text-soft)]">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--app-text-soft)] py-8">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* ==================== VALIDATIONS EN ATTENTE ==================== */}
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
                    <p className="text-sm font-medium text-[var(--app-text)]">{validation.title}</p>
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

        {/* ==================== FOOTER ==================== */}
        <p className="text-sm text-[var(--app-text-soft)] text-center pt-4 border-t border-[var(--app-border)]/70">
          Les statistiques détaillées sont accessibles dans l'onglet Statistiques.
        </p>
      </div>
    </AppLayout>
  )
}

export default DirectionDashboard
