// src/api/authApi.js

import axiosInstance from './axiosConfig'

/**
 * ✅ FONCTION UTILITAIRE - Normaliser le rôle EN TOUTE SÉCURITÉ
 */
const normalizeRole = (roleData) => {
  console.log('🔄 normalizeRole - Input:', roleData, 'Type:', typeof roleData)
  const roleAliases = {
    'responsable rh': 'admin',
    'assistant rh': 'assistant',
    'directeur rh': 'direction',
    directeur: 'direction',
  }
  
  // ✅ Si c'est déjà une string
  if (typeof roleData === 'string') {
    const normalized = roleData.toLowerCase().trim()
    const mappedRole = roleAliases[normalized] || normalized
    console.log('✅ normalizeRole - String:', normalized)
    return mappedRole
  }
  
  // ✅ Si c'est un objet avec name ou value
  if (roleData && typeof roleData === 'object') {
    const role = roleData.name || roleData.value || roleData.role || 'user'
    const normalized = String(role).toLowerCase().trim()
    const mappedRole = roleAliases[normalized] || normalized
    console.log('✅ normalizeRole - Objet:', normalized)
    return mappedRole
  }
  
  // ✅ Si null, undefined, ou autre
  console.log('✅ normalizeRole - Défaut: user')
  return 'user'
}

/**
 * ✅ VALIDATION COMPLÈTE
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

/**
 * LOGIN - Connexion ✅ CORRIGÉ
 */
export const loginApi = async (credentials) => {
  try {
    // ✅ VALIDATION CÔTÉ FRONTEND
    const errors = {}

    // Vérifier email
    if (!credentials.email || !credentials.email.trim()) {
      errors.email = ['Email requis']
    } else if (!validateEmail(credentials.email)) {
      errors.email = ['Format email invalide']
    }

    // Vérifier mot de passe
    if (!credentials.password) {
      errors.password = ['Mot de passe requis']
    } else if (!validatePassword(credentials.password)) {
      errors.password = ['Mot de passe minimum 6 caractères']
    }

    // ❌ Si erreurs, les retourner
    if (Object.keys(errors).length > 0) {
      console.error('❌ Erreurs de validation:', errors)
      const error = new Error('Erreur de validation')
      error.response = {
        status: 422,
        data: { errors }
      }
      throw error
    }

    console.log('📝 loginApi - Email:', credentials.email.trim())

    // ✅ Envoyer les données NETTOYÉES
    const response = await axiosInstance.post('/login', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password.trim()
    })

    console.log('✅ loginApi - Réponse brute:', response.data)
    console.log('✅ loginApi - user:', response.data.user)
    console.log('✅ loginApi - role brut:', response.data.user?.role, 'Type:', typeof response.data.user?.role)

    // ✅ NORMALISER LE RÔLE EN TOUTE SÉCURITÉ
    const roleFromResponse = response.data.user?.role_name || response.data.user?.role || response.data.role || 'user'
    const normalizedRole = normalizeRole(roleFromResponse)

    // ✅ CONSTRUIRE LA RÉPONSE NORMALISÉE
    const normalizedResponse = {
      token: response.data.token,
      user: {
        id: response.data.user?.id,
        email: response.data.user?.email,
        first_name: response.data.user?.first_name,
        last_name: response.data.user?.last_name,
        username: response.data.user?.username,
        profile_image: response.data.user?.profile_image, // ✅ Chemin de l'image
        profile_image_url: response.data.user?.profile_image_url, // ✅ URL complète de l'image
        role_id: response.data.user?.role_id,
        department_id: response.data.user?.department_id,
        department_name: response.data.user?.department_name,
        role: normalizedRole, // ✅ Rôle normalisé en string minuscule
        role_name: normalizedRole, // ✅ Aussi disponible sous role_name
      },
      role: normalizedRole, // ✅ Rôle normalisé au top level
    }

    console.log('✅ loginApi - Réponse normalisée:', normalizedResponse)

    // ✅ STOCKER LE TOKEN (persistant)
    if (normalizedResponse.token) {
      localStorage.setItem('token', normalizedResponse.token)
      console.log('🔑 Token stocké (localStorage)')
    }

    // ✅ STOCKER L'UTILISATEUR (persistant)
    if (normalizedResponse.user) {
      localStorage.setItem('user', JSON.stringify(normalizedResponse.user))
      console.log('👤 Utilisateur stocké:', normalizedResponse.user)
    }

    return normalizedResponse
  } catch (error) {
    console.error('❌ loginApi - Erreur:', error.response?.data || error.message)
    throw error
  }
}

/**
 * REGISTER - Inscription
 */
export const registerApi = async (userData) => {
  try {
    console.log('📝 registerApi - Inscription en cours...')

    // ✅ NETTOYER LES DONNÉES
    const cleanedData = {
      email: userData.email.trim(),
      username: userData.username.trim(),
      first_name: userData.first_name.trim(),
      last_name: userData.last_name.trim(),
      password: userData.password,
      password_confirmation: userData.password_confirmation,
      role_name: typeof userData.role_name === 'string' ? userData.role_name.trim() : String(userData.role_name || '')
    }

    const response = await axiosInstance.post('/register', cleanedData)
    console.log('✅ registerApi - Réponse brute:', response.data)

    // ✅ NORMALISER LE RÔLE EN TOUTE SÉCURITÉ
    const roleFromResponse = response.data.user?.role || response.data.user?.role_name || response.data.role || userData.role_name || 'user'
    const normalizedRole = normalizeRole(roleFromResponse)

    // ✅ CONSTRUIRE LA RÉPONSE NORMALISÉE
    const normalizedResponse = {
      token: response.data.token || null,
      user: {
        id: response.data.user?.id,
        email: response.data.user?.email,
        first_name: response.data.user?.first_name,
        last_name: response.data.user?.last_name,
        role_id: response.data.user?.role_id,
        department_id: response.data.user?.department_id,
        department_name: response.data.user?.department_name,
        role: normalizedRole, // ✅ Rôle normalisé en string minuscule
        role_name: normalizedRole, // ✅ Aussi disponible sous role_name
      },
      role: normalizedRole, // ✅ Rôle normalisé au top level
      message: response.data.message || 'Inscription réussie',
    }

    console.log('✅ registerApi - Réponse normalisée:', normalizedResponse)

    // ✅ STOCKER (persistant)
    if (normalizedResponse.token) {
      localStorage.setItem('token', normalizedResponse.token)
    }
    if (normalizedResponse.user) {
      localStorage.setItem('user', JSON.stringify(normalizedResponse.user))
    }

    return normalizedResponse
  } catch (error) {
    console.error('❌ registerApi - Erreur:', error.response?.data || error.message)
    throw error
  }
}

/**
 * LOGOUT - Déconnexion
 */
export const logoutApi = async () => {
  try {
    console.log('📝 logoutApi - Déconnexion...')
    const response = await axiosInstance.post('/logout')
    console.log('✅ logoutApi - Réponse reçue:', response.data)

    // ✅ Nettoyer la session courante
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return response.data
  } catch (error) {
    console.error('❌ logoutApi - Erreur:', error.message)
    // ✅ Nettoyer même en cas d'erreur
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    throw error
  }
}

/**
 * GET CURRENT USER
 */
export const getCurrentUserApi = async () => {
  try {
    console.log('📝 getCurrentUserApi - Récupération...')
    const response = await axiosInstance.get('/user')
    console.log('✅ getCurrentUserApi - Réponse brute:', response.data)

    // ✅ NORMALISER LE RÔLE EN TOUTE SÉCURITÉ
    const roleFromResponse = response.data.user?.role_name || response.data.user?.role || 'user'
    const normalizedRole = normalizeRole(roleFromResponse)

    // ✅ CONSTRUIRE LA RÉPONSE NORMALISÉE
    const normalizedResponse = {
      user: {
        id: response.data.user?.id,
        email: response.data.user?.email,
        first_name: response.data.user?.first_name,
        last_name: response.data.user?.last_name,
        username: response.data.user?.username,
        profile_image: response.data.user?.profile_image, // ✅ Chemin de l'image
        profile_image_url: response.data.user?.profile_image_url, // ✅ URL complète de l'image
        role_id: response.data.user?.role_id,
        department_id: response.data.user?.department_id,
        department_name: response.data.user?.department_name,
        role: normalizedRole, // ✅ Rôle normalisé en string minuscule
        role_name: normalizedRole, // ✅ Aussi disponible sous role_name
      },
    }

    console.log('✅ getCurrentUserApi - Réponse normalisée:', normalizedResponse)

    // ✅ Mettre à jour la session persistante
    if (normalizedResponse.user) {
      localStorage.setItem('user', JSON.stringify(normalizedResponse.user))
    }

    return normalizedResponse
  } catch (error) {
    console.error('❌ getCurrentUserApi - Erreur:', error.message)

    if (error.response?.status === 401) {
      // ✅ Nettoyer la session courante
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    throw error
  }
}

export const forgotPasswordApi = async (email) => {
  try {
    const response = await axiosInstance.post('/forgot-password', { 
      email: email.trim() 
    })
    return response.data
  } catch (error) {
    console.error('❌ forgotPasswordApi - Erreur:', error.message)
    throw error
  }
}

export const resetPasswordApi = async (payload) => {
  try {
    const response = await axiosInstance.post('/reset-password', {
      email: payload.email.trim(),
      token: payload.token.trim(),
      password: payload.password,
      password_confirmation: payload.password_confirmation
    })
    return response.data
  } catch (error) {
    console.error('❌ resetPasswordApi - Erreur:', error.message)
    throw error
  }
}

export const updateProfileApi = async (profileData) => {
  try {
    const cleanedData = {}
    Object.keys(profileData).forEach(key => {
      if (typeof profileData[key] === 'string') {
        cleanedData[key] = profileData[key].trim()
      } else {
        cleanedData[key] = profileData[key]
      }
    })

    const response = await axiosInstance.put('/user/profile', cleanedData)
    console.log('✅ updateProfileApi - Réponse reçue:', response.data)

    // ✅ Mettre à jour la session courante
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    console.error('❌ updateProfileApi - Erreur:', error.message)
    throw error
  }
}
