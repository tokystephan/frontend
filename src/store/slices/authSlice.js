// src/store/slices/authSlice.js

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  loginApi,
  registerApi,
  logoutApi,
  getCurrentUserApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../../api/authApi'

// ============================================
// ✅ INITIALISATION
// ============================================
const storedToken = sessionStorage.getItem('token')
const storedUser = sessionStorage.getItem('user')

let initialUser = null
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
  }
}

// ============================================
// ✅ FONCTIONS UTILITAIRES
// ============================================

const extractRoleName = (roleData) => {
  const roleAliases = {
    'responsable rh': 'admin',
    'assistant rh': 'assistant',
    'directeur rh': 'direction',
    directeur: 'direction',
  }
  const normalizeRole = (value) => {
    const normalized = value.toLowerCase()
    return roleAliases[normalized] || normalized
  }

  if (!roleData) return 'user'
  if (typeof roleData === 'string') return normalizeRole(roleData)
  if (typeof roleData === 'object' && roleData !== null) {
    if (roleData.name && typeof roleData.name === 'string') return normalizeRole(roleData.name)
    if (roleData.display_name && typeof roleData.display_name === 'string') return normalizeRole(roleData.display_name)
  }
  return 'user'
}

const normalizeUser = (userData) => {
  if (!userData) return null
  const roleIdMapping = {
    1: 'admin',
    2: 'assistant',
    3: 'consultant',
    4: 'manager',
    5: 'direction',
  }
  const roleName = roleIdMapping[userData.role_id] || extractRoleName(userData.role_name || userData.role)
  return {
    ...userData,
    role: roleName,
    roleName: roleName,
    isAdmin: roleName === 'admin',
    isAssistant: roleName === 'assistant',
    isConsultant: roleName === 'consultant',
    isManager: roleName === 'manager',
    isDirection: roleName === 'direction',
  }
}

const normalizeError = (error, fallback) => {
  // ✅ Vérifier si c'est une erreur réseau
  if (error?.message === 'Network Error' || error?.message?.includes('network')) {
    return 'Erreur réseau - Le serveur n\'est pas accessible. Vérifiez que le backend est démarré.'
  }
  
  // ✅ Vérifier si c'est une erreur d'objet (objet d'erreurs de validation)
  if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
    const errors = error.response.data.errors
    const messages = Object.values(errors)
      .flat()
      .filter(msg => typeof msg === 'string')
    return messages.length > 0 ? messages.join(', ') : fallback
  }
  
  // ✅ Message d'erreur du serveur
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  // ✅ Message d'erreur générique
  return error?.message || fallback
}

// ============================================
// ✅ ASYNC THUNKS (UN SEUL EXPORT PAR FONCTION)
// ============================================

const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials)
      const normalizedUser = normalizeUser(response.user)
      return {
        token: response.token,
        user: normalizedUser,
        role: normalizedUser.role,
      }
    } catch (error) {
      return rejectWithValue(normalizeError(error, 'Connexion impossible'))
    }
  }
)

const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerApi(payload)
      const normalizedUser = response.user ? normalizeUser(response.user) : null
      return {
        token: response.token || null,
        user: normalizedUser,
        role: normalizedUser?.role || null,
        message: response.message || 'Inscription réussie',
      }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.errors || normalizeError(error, 'Inscription impossible')
      )
    }
  }
)

const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await logoutApi()
    } catch {
      // Ignorer les erreurs
    }
    // Nettoyer la session de l'onglet courant
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    return null
  }
)

// Alias pour compatibilité (pas d'export direct)
const logout = logoutUser

const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem('token')
        const user = sessionStorage.getItem('user')

      if (!token || !user) return null

      const response = await getCurrentUserApi()
      const normalizedUser = normalizeUser(response.user)
      
      // Vérifier la cohérence utilisateur/token dans l'onglet courant
      const storedUser = user ? JSON.parse(user) : null
      if (storedUser && storedUser.id && response.user.id !== storedUser.id) {
        console.warn('⚠️ Session compromise - L\'utilisateur a changé. Rafraîchissement de la session.')
      }
      
      return {
        token,
        user: normalizedUser,
        role: normalizedUser.role,
      }
    } catch (error) {
      // Nettoyer la session de l'onglet courant
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      return rejectWithValue(normalizeError(error, 'Session invalide'))
    }
  }
)

const forgotPasswordUser = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordApi(email)
      return response
    } catch (error) {
      return rejectWithValue(normalizeError(error, 'Impossible d\'envoyer le lien'))
    }
  }
)

const resetPasswordUser = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await resetPasswordApi(payload)
      return response
    } catch (error) {
      return rejectWithValue(normalizeError(error, 'Réinitialisation impossible'))
    }
  }
)

// ============================================
// ✅ SLICE
// ============================================

const initialState = {
  user: initialUser ? normalizeUser(initialUser) : null,
  token: storedToken,
  role: initialUser?.role ? extractRoleName(initialUser.role) : null,
  isAuthenticated: Boolean(storedToken && initialUser),
  loading: false,
  initialized: false,
  error: null,
  validationErrors: {},
  successMessage: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
      state.validationErrors = {}
    },
    clearError: (state) => {
      state.error = null
      state.validationErrors = {}
    },
    clearAuthMessage: (state) => {
      state.successMessage = ''
    },
    resetAuthState: (state) => {
      state.user = null
      state.token = null
      state.role = null
      state.isAuthenticated = false
      state.error = null
      state.validationErrors = {}
      state.successMessage = ''
      // Nettoyer la session persistante
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    },
    setUser: (state, action) => {
      const normalizedUser = normalizeUser(action.payload.user || action.payload)
      state.user = normalizedUser
      state.token = action.payload.token
      state.role = normalizedUser.role
      state.isAuthenticated = true
      // Stocker dans la session de l'onglet courant
        sessionStorage.setItem('token', action.payload.token)
        sessionStorage.setItem('user', JSON.stringify(normalizedUser))
    },
    updateUserProfile: (state, action) => {
      if (state.user && action.payload) {
        const updatedUser = normalizeUser(action.payload)
        state.user = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.role = action.payload.role
        state.isAuthenticated = true
        state.error = null
        // Stocker dans sessionStorage (par onglet, pas partagé entre onglets)
          sessionStorage.setItem('token', action.payload.token)
          sessionStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.role = null
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.successMessage = action.payload.message || 'Inscription réussie'
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        if (typeof action.payload === 'object' && !Array.isArray(action.payload)) {
          state.validationErrors = action.payload
          state.error = 'Erreur de validation'
        } else {
          state.error = action.payload
        }
      })
      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.role = null
        state.isAuthenticated = false
        state.loading = false
        state.successMessage = 'Déconnexion réussie'
        // ✅ sessionStorage est déjà nettoyé dans le thunk
      })
      // CHECK AUTH
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.role = action.payload.role
          state.isAuthenticated = true
        } else {
          state.user = null
          state.token = null
          state.role = null
          state.isAuthenticated = false
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.error = action.payload
        state.user = null
        state.token = null
        state.role = null
        state.isAuthenticated = false
      })
      // FORGOT PASSWORD
      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.successMessage = action.payload?.message || 'Lien envoyé'
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.error = action.payload
      })
      // RESET PASSWORD
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        state.successMessage = action.payload?.message || 'Mot de passe mis à jour'
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

// ============================================
// ✅ EXPORTS (UNIQUEMENT ICI - PAS DE DOUBLON)
// ============================================

// Actions du slice
export const { 
  clearAuthError,
  clearError,
  clearAuthMessage, 
  resetAuthState, 
  setUser,
  updateUserProfile
} = authSlice.actions

// Thunks (export groupé - UNE SEULE FOIS)
export {
  loginUser,
  registerUser,
  logoutUser,
  logout,          
  checkAuth,
  forgotPasswordUser,
  resetPasswordUser,
}

// Export par défaut du reducer
export default authSlice.reducer
