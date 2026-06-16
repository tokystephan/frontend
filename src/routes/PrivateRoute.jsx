import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { checkAuth } from '../store/slices/authSlice'

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, initialized, role } = useAppSelector(
    (state) => state.auth
  )

  //  VÉRIFIER L'AUTHENTIFICATION AU CHARGEMENT
  useEffect(() => {
    //  SI DÉJÀ INITIALISÉ, NE PAS REFAIRE LA VÉRIFICATION
    if (initialized) {
      console.log(' Déjà initialisé, pas besoin de vérifier')
      return
    }

    //  VÉRIFIER LA SESSION
    console.log('🔍 Vérification de la session...')
    dispatch(checkAuth())
  }, [dispatch, initialized])

  //  SI EN COURS DE CHARGEMENT OU NON INITIALISÉ
  if (loading || !initialized) {
    console.log('⏳ Chargement... (loading:', loading, ', initialized:', initialized, ')')
    return <LoadingSpinner label="Vérification de session..." />
  }

  // ✅ SI PAS AUTHENTIFIÉ, REDIRIGER VERS LOGIN
  if (!isAuthenticated) {
    console.log('🚫 Non authentifié, redirection vers login')
    return <Navigate to="/login" replace />
  }

  // ✅ SI RÔLES SPÉCIFIÉS, VÉRIFIER QUE L'UTILISATEUR A LE BON RÔLE
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log('🚫 Rôle non autorisé:', role, 'Rôles autorisés:', allowedRoles)
    return <Navigate to="/dashboard/" replace />
  }

  // ✅ SINON, AFFICHER LE CONTENU
  console.log('✅ Accès autorisé')
  return children || <Outlet />
}

export default PrivateRoute