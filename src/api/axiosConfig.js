// src/api/axiosConfig.js
import axios from 'axios'

// ✅ Utiliser variable d'environnement pour la baseURL
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Normaliser l'URL fournie par l'environnement au cas où elle serait incomplète
// Exemples corrigés automatiquement:
//  - ":8000/api" -> "http://localhost:8000/api"
//  - "localhost:8000/api" -> "http://localhost:8000/api"
//  - "//example.com/api" -> "http://example.com/api" (préserve le host, ajoute protocole)
let API_URL = rawApiUrl;
try {
  if (typeof API_URL === 'string') {
    API_URL = API_URL.trim();
    if (API_URL.startsWith(':')) {
      API_URL = `http://localhost${API_URL}`;
    } else if (API_URL.startsWith('//')) {
      API_URL = `${window.location.protocol}${API_URL}`;
    } else if (!/^https?:\/\//i.test(API_URL) && /^[^\/]+:\d+/.test(API_URL)) {
      // cas "host:port/path" ou "host:port"
      API_URL = `http://${API_URL}`;
    }
  }
} catch {
  // En cas d'environnement non-browser (build), fallback silencieux
  API_URL = rawApiUrl;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
})

// ✅ Instance axios pour les uploads de fichiers (sans Content-Type par défaut)
export const axiosFileInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
})

// ✅ INTERCEPTEUR DE REQUÊTE : Ajouter le token (axiosInstance)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // ✅ Optionnel : Log pour debug (à retirer en production)
      if (import.meta.env.DEV) {
        console.log(`🔑 Requête ${config.method?.toUpperCase()} ${config.url} - Token ajouté`)
      }
    }
    return config
  },
  (error) => {
    console.error('❌ Erreur de requête:', error)
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTEUR DE REQUÊTE : Ajouter le token (axiosFileInstance)
axiosFileInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      if (import.meta.env.DEV) {
        console.log(`📸 Requête fichier ${config.method?.toUpperCase()} ${config.url} - Token ajouté`)
      }
    }
    return config
  },
  (error) => {
    console.error('❌ Erreur de requête:', error)
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTEUR DE RÉPONSE : Gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Gérer les erreurs réseau
    if (!error.response) {
      console.error('❌ Erreur réseau - Vérifiez que Laravel est démarré sur http://localhost:8000')
      console.error('❌ Détails:', error.message)
      const networkError = new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.')
      networkError.response = { 
        status: 0, 
        data: { message: 'Erreur réseau - Serveur inaccessible' } 
      }
      return Promise.reject(networkError)
    }
    
    // ✅ Gérer les erreurs 401 (non authentifié)
    if (error.response?.status === 401) {
      console.log('🔴 401 Non autorisé - Redirection vers login')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // ✅ Gérer les erreurs 403 (accès interdit)
    if (error.response?.status === 403) {
      console.log('🔴 403 Accès interdit')
      // Optionnel: rediriger vers une page d'erreur
    }
    
    // ✅ Gérer les erreurs 422 (validation)
    if (error.response?.status === 422) {
      console.log('🔴 422 Erreur de validation:', error.response?.data?.errors)
    }
    
    // ✅ Gérer les erreurs 500 (serveur)
    if (error.response?.status === 500) {
      console.error('🔴 500 Erreur serveur:', error.response?.data?.message)
    }
    
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTEUR DE RÉPONSE : Gérer les erreurs (axiosFileInstance)
axiosFileInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Gérer les erreurs réseau
    if (!error.response) {
      console.error('❌ Erreur réseau fichier - Vérifiez que Laravel est démarré')
      const networkError = new Error('Impossible de se connecter au serveur.')
      networkError.response = { 
        status: 0, 
        data: { message: 'Erreur réseau - Serveur inaccessible' } 
      }
      return Promise.reject(networkError)
    }
    
    // ✅ Gérer les erreurs 401 (non authentifié)
    if (error.response?.status === 401) {
      console.log('🔴 401 Non autorisé')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
