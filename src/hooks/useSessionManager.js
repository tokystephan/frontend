import { useEffect } from 'react'

/**
 * Hook conservé pour compatibilité.
 * L'authentification est désormais stockée uniquement en sessionStorage
 * (isolée par onglet), donc aucune synchronisation cross-onglets n'est requise.
 */
export const useSessionManager = () => {
  useEffect(() => {
    return undefined
  }, [])
}
