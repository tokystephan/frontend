import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { getUserRole } from '../utils/roleRedirect'

const RoleGuard = ({ allowedRoles = [], children }) => {
  // ✅ RÉCUPÉRER LE RÔLE DE L'UTILISATEUR CONNECTÉ
  const roleName = useAppSelector((state) => getUserRole(state.auth.user))
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  // ✅ SI PAS AUTHENTIFIÉ, REDIRIGER VERS LOGIN
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ✅ SI AUCUN RÔLE, REDIRIGER VERS DASHBOARD
  if (!roleName) {
    return <Navigate to="/dashboard" replace />
  }

  // ✅ SI LE RÔLE N'EST PAS DANS LES RÔLES AUTORISÉS
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase())
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(roleName)) {
    return <Navigate to="/dashboard" replace />
  }

  // ✅ SINON, AFFICHER LE CONTENU
  return children || <Outlet />
}

export default RoleGuard
