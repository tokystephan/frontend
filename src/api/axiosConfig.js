// src/api/axiosConfig.js
import axios from 'axios'

// ✅ Utiliser variable d'environnement pour la baseURL
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ✅ Normalisation simple et robuste de l'URL
let API_URL = rawApiUrl.trim();

// Si l'URL n'a pas de protocole, ajouter http://
// Utiliser RegExp construit pour éviter les échappements inutiles dans les littéraux
if (API_URL && !new RegExp('^https?://', 'i').test(API_URL)) {
    if (API_URL.startsWith(':')) {
        API_URL = `http://localhost${API_URL}`;
    } 
    else if (API_URL.startsWith('//')) {
        API_URL = `${window.location.protocol}${API_URL}`;
    } 
    else if (/^[^\/]+:\d+/.test(API_URL)) {
        API_URL = `http://${API_URL}`;
    }
    else {
        API_URL = `http://${API_URL}`;
    }
}

// 🔧 Supprimer le slash final si présent
if (API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1);
}

// ✅ Log pour débogage (uniquement en développement)
if (import.meta.env.DEV) {
    console.log(`🌐 API_URL configurée : ${API_URL}`);
}

// ============================================================
// ✅ INSTANCE PRINCIPALE - withCredentials: false (pour éviter CORS)
// ============================================================
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: false,  
});

// ============================================================
// ✅ INSTANCE POUR UPLOADS - withCredentials: false
// ============================================================
export const axiosFileInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: false, 
});

// ============================================================
// INTERCEPTEUR REQUÊTE : Ajouter le token (axiosInstance)
// ============================================================
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (import.meta.env.DEV) {
                console.log(`🔑 Requête ${config.method?.toUpperCase()} ${config.url} - Token ajouté`);
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ Erreur de requête:', error);
        return Promise.reject(error);
    }
);

// ============================================================
// INTERCEPTEUR REQUÊTE : Ajouter le token (axiosFileInstance)
// ============================================================
axiosFileInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (import.meta.env.DEV) {
                console.log(`📸 Requête fichier ${config.method?.toUpperCase()} ${config.url} - Token ajouté`);
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ Erreur de requête:', error);
        return Promise.reject(error);
    }
);

// ============================================================
// INTERCEPTEUR RÉPONSE : Gérer les erreurs (axiosInstance)
// ============================================================
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // ✅ Gérer les erreurs réseau
        if (!error.response) {
            console.error('❌ Erreur réseau - Vérifiez que le backend est accessible');
            console.error(`   URL configurée : ${API_URL}`);
            console.error('❌ Détails:', error.message);
            const networkError = new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
            networkError.response = { 
                status: 0, 
                data: { message: 'Erreur réseau - Serveur inaccessible' } 
            };
            return Promise.reject(networkError);
        }

        // ✅ Gérer les erreurs 401 (non authentifié)
        if (error.response?.status === 401) {
            console.log('🔴 401 Non autorisé - Redirection vers login');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // ✅ Gérer les erreurs 403 (accès interdit)
        if (error.response?.status === 403) {
            console.log('🔴 403 Accès interdit');
        }

        // ✅ Gérer les erreurs 422 (validation)
        if (error.response?.status === 422) {
            console.log('🔴 422 Erreur de validation:', error.response?.data?.errors);
        }

        // ✅ Gérer les erreurs 429 (trop de requêtes)
        if (error.response?.status === 429) {
            console.warn('🔴 429 Trop de requêtes - attendez avant de réessayer');
        }

        // ✅ Gérer les erreurs 500 (serveur)
        if (error.response?.status === 500) {
            console.error('🔴 500 Erreur serveur:', error.response?.data?.message || 'Erreur interne');
        }

        // ✅ Afficher l'erreur complète pour le debug
        if (import.meta.env.DEV) {
            console.error('🔴 Erreur complète:', error.response?.data || error.message);
        }

        return Promise.reject(error);
    }
);

// ============================================================
// INTERCEPTEUR RÉPONSE : Gérer les erreurs (axiosFileInstance)
// ============================================================
axiosFileInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error('❌ Erreur réseau fichier - Vérifiez que le backend est accessible');
            const networkError = new Error('Impossible de se connecter au serveur.');
            networkError.response = { 
                status: 0, 
                data: { message: 'Erreur réseau - Serveur inaccessible' } 
            };
            return Promise.reject(networkError);
        }

        if (error.response?.status === 401) {
            console.log('🔴 401 Non autorisé');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
