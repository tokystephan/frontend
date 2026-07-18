// src/pages/dashboard/Dashboard.jsx

import { useEffect, useState } from 'react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { getStatistics } from '../../services/statisticsService'
import { ROLES } from '../../utils/constants'
import AdminDashboard from './AdminDashboard'
import AssistantDashboard from './AssistantDashboard'
import ConsultantDashboard from './ConsultantDashboard'
import DirectionDashboard from './DirectionDashboard'
import { useAppSelector } from '../../store/hooks'
import { getUserRole } from '../../utils/roleRedirect'

const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user)
  const role = getUserRole(user)
  
  console.log('🎯 Dashboard - Rôle détecté:', role)
  console.log('🎯 Dashboard - User complet:', user)

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    byStatus: [],
    byDepartment: {},
  })

  useEffect(() => {
    const run = async () => {
      try {
        const canLoadGlobalStats = [ROLES.ADMIN, ROLES.ASSISTANT].includes(role)

        if (canLoadGlobalStats) {
          const result = await getStatistics()
          setStats({
            totalApplications: result.totalApplications || 0,
            pending: result.pending || 0,
            byStatus: result.byStatus || [],
            byDepartment: result.byDepartment || {},
          })
        }
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [role])

  if (loading) {
    return <LoadingSpinner label="Chargement du dashboard..." />
  }

  // ✅ Comparaison avec les constantes ROLES
  switch (role) {
    case ROLES.ADMIN:
      console.log('✅ Affichage AdminDashboard')
      return <AdminDashboard stats={stats} />
    case ROLES.ASSISTANT:
      console.log('✅ Affichage AssistantDashboard')
      return <AssistantDashboard stats={stats} />
    case ROLES.MANAGER:
      console.log('✅ Affichage ManagerDashboard')
      return <ConsultantDashboard stats={stats} />
    case ROLES.DIRECTION:
      console.log('✅ Affichage DirectionDashboard')
      return <DirectionDashboard stats={stats} />
    default:
      console.log('⚠️ Rôle non reconnu:', role)
      return (
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-6 text-[var(--app-text)]">
          <h2 className="text-lg font-semibold">Rôle non reconnu</h2>
          <p className="mt-2 text-sm text-[var(--app-text-soft)]">
            Impossible de charger le dashboard car le rôle utilisateur est invalide.
            Reconnectez-vous pour rafraîchir votre session.
          </p>
        </div>
      )
  }
}

export default Dashboard
