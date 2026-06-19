/**
 * Récupère le rôle de l'utilisateur (gère les objets et les strings)
 * ✅ CORRECTION: Ajout du mapping pour role_id
 */

const ROLE_ALIASES = {
  'responsable rh': 'admin',
  'assistant rh': 'assistant',
  'directeur rh': 'direction',
  directeur: 'direction',
  consultant: 'manager',
  'consultant technique': 'manager',
  'recruteur': 'assistant',
  'administrateur': 'admin',
}

// ✅ AJOUT: Mapping des role_id vers les noms de rôles
const ROLE_ID_MAPPING = {
  1: 'admin',
  2: 'assistant',
  3: 'manager',
  4: 'manager',
  5: 'direction',
}

// ✅ AJOUT: Mapping des noms de rôles vers les routes
const roleRoutes = {
  admin: '/dashboard/admin',
  direction: '/dashboard/direction',
  manager: '/dashboard/manager',
  assistant: '/dashboard/assistant'
}

// ✅ AJOUT: Routes par défaut pour fallback
const DEFAULT_ROUTES = {
  admin: '/admin/dashboard',
  assistant: '/assistant/dashboard',
  direction: '/direction/dashboard',
}

const normalizeRoleName = (roleValue) => {
  if (!roleValue) return null
  const normalized = String(roleValue).toLowerCase().trim()
  
  // Vérifier les alias
  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized]
  }
  
  // Vérifier si le nom correspond directement à un rôle valide
  const validRoles = ['admin', 'assistant', 'manager', 'direction']
  if (validRoles.includes(normalized)) {
    return normalized
  }
  
  return normalized
}

export const getUserRole = (user) => {
  if (!user) return null

  // Debug: affiche ce qu'on reçoit
  console.log('🔍 User object reçu:', JSON.stringify(user, null, 2))
  console.log('🔍 user.role_id:', user.role_id)
  console.log('🔍 user.role_name:', user.role_name)
  console.log('🔍 user.role:', user.role)

  // ✅ PRIORITÉ 1: Utiliser role_id (le plus fiable)
  if (user.role_id && ROLE_ID_MAPPING[user.role_id]) {
    const role = ROLE_ID_MAPPING[user.role_id]
    console.log(`✅ Rôle extrait de role_id=${user.role_id} → ${role}`)
    return role
  }

  // ✅ PRIORITÉ 2: Utiliser role_name (backend normalisé)
  if (typeof user.role_name === 'string' && user.role_name.trim()) {
    console.log('✅ Rôle extrait de user.role_name:', user.role_name)
    const normalized = normalizeRoleName(user.role_name)
    if (normalized) return normalized
  }

  // ✅ PRIORITÉ 3: Utiliser user.role (objet ou string)
  if (user.role) {
    // Si le rôle est un objet
    if (typeof user.role === 'object' && user.role !== null) {
      const roleName = user.role.name || user.role.slug || user.role._id || user.role.role || user.role.value || user.role.display_name
      if (roleName) {
        console.log('✅ Rôle extrait de l\'objet user.role:', roleName)
        const normalized = normalizeRoleName(roleName)
        if (normalized) return normalized
      }
    }
    
    // Si c'est une chaîne de caractères
    if (typeof user.role === 'string') {
      console.log('✅ Rôle extrait de user.role (string):', user.role)
      const normalized = normalizeRoleName(user.role)
      if (normalized) return normalized
    }
  }

  // ✅ PRIORITÉ 4: Fallback - Vérifier les propriétés alternatives
  if (user.is_admin === true || user.isAdmin === true) {
    console.log('✅ Rôle déduit de is_admin → admin')
    return 'admin'
  }

  // ⚠️ Dernier recours
  console.warn('⚠️ Rôle non trouvé ou format invalide')
  console.log('📊 User complet:', user)
  return null
}

/**
 * Redirige selon le rôle de l'utilisateur
 * ✅ CORRECTION: Gère aussi les strings et ajoute des fallbacks
 */
export const getRedirectPath = (user) => {
  // ✅ Cas 1: On passe directement un nom de rôle en string
  if (typeof user === 'string') {
    const normalized = normalizeRoleName(user)
    const path = roleRoutes[normalized] || DEFAULT_ROUTES[normalized] || `/dashboard/${normalized}`
    console.log(`✅ Redirection (string): ${user} → ${path}`)
    return path
  }

  // ✅ Cas 2: Pas d'utilisateur
  if (!user) {
    console.warn('⚠️ Pas d\'utilisateur fourni - Redirection vers /login')
    return '/login'
  }

  // ✅ Cas 3: Récupère le rôle
  const role = getUserRole(user)

  if (!role) {
    console.warn('⚠️ Rôle non trouvé - Redirection vers /dashboard par défaut')
    return '/dashboard'
  }

  // ✅ Cas 4: Chercher la route dans roleRoutes
  let path = roleRoutes[role]
  
  // Fallback sur DEFAULT_ROUTES
  if (!path && DEFAULT_ROUTES[role]) {
    path = DEFAULT_ROUTES[role]
  }
  
  // Fallback générique
  if (!path) {
    path = `/dashboard/${role}`
  }

  console.log(`✅ Redirection: rôle=${role} → ${path}`)
  return path
}

/**
 * Alias pour compatibilité
 */
export const getDashboardByRole = (roleName) => {
  const normalized = normalizeRoleName(roleName)
  return roleRoutes[normalized] || DEFAULT_ROUTES[normalized] || '/dashboard'
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (user, requiredRole) => {
  if (!user) return false
  const userRole = getUserRole(user)
  const normalizedRequired = normalizeRoleName(requiredRole)
  return userRole === normalizedRequired
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 */
export const hasAnyRole = (user, requiredRoles = []) => {
  if (!user) return false
  const userRole = getUserRole(user)
  return requiredRoles.some(role => normalizeRoleName(role) === userRole)
}

/**
 * ✅ AJOUT: Obtenir le nom formaté du rôle pour affichage
 */
export const getFormattedRole = (user) => {
  const role = getUserRole(user)
  
  const displayNames = {
    admin: 'Administrateur',
    assistant: 'Assistant RH',
    manager: 'Manager',
    direction: 'Direction',
  }
  
  return displayNames[role] || role || 'Utilisateur'
}

/**
 * ✅ AJOUT: Vérifier si l'utilisateur peut accéder à une route
 */
export const canAccessRoute = (user, path) => {
  if (!user) return false
  
  const role = getUserRole(user)
  
  // Admin peut tout voir
  if (role === 'admin') return true
  
  // Vérifier si le chemin correspond au rôle
  const expectedPath = getRedirectPath(user)
  return path.startsWith(expectedPath) || path === '/dashboard'
}

// Export par défaut
export default {
  getUserRole,
  getRedirectPath,
  getDashboardByRole,
  hasRole,
  hasAnyRole,
  getFormattedRole,
  canAccessRoute,
}
