import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../store/slices/authSlice'

const useCheckAuth = () => {
  const dispatch = useDispatch()
  const { initialized, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    // ✅ SI DÉJÀ INITIALISÉ, NE PAS REFAIRE LA VÉRIFICATION
    if (initialized) {
      return
    }

    // ✅ VÉRIFIER L'AUTHENTIFICATION AU CHARGEMENT
    const checkAuthStatus = async () => {
      console.log('🔍 Vérification de session...')
      await dispatch(checkAuth())
      console.log('✅ Vérification terminée')
    }

    checkAuthStatus()
  }, [dispatch, initialized])

  return { initialized, isAuthenticated }
}

export default useCheckAuth