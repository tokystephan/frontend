// src/api/userApi.js
import axiosInstance, { axiosFileInstance } from './axiosConfig'

/**
 * ============================================
 * 👥 GESTION DES UTILISATEURS
 * ============================================
 */

// ✅ RÉCUPÉRER TOUS LES UTILISATEURS
export const getAllUsersApi = async (page = 1) => {
  try {
    console.log('👤 getAllUsersApi - Récupération des utilisateurs... Page:', page)
    const response = await axiosInstance.get(`/users?page=${page}`)
    console.log('✅ getAllUsersApi - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getAllUsersApi - Erreur:', error)
    throw error
  }
}

// ✅ RÉCUPÉRER UN UTILISATEUR PAR ID
export const getUserByIdApi = async (id) => {
  try {
    console.log('👤 getUserByIdApi - ID:', id)
    const response = await axiosInstance.get(`/users/${id}`)
    console.log('✅ getUserByIdApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ getUserByIdApi - Erreur:', error)
    throw error
  }
}

// ✅ CRÉER UN NOUVEL UTILISATEUR
export const createUserApi = async (userData) => {
  try {
    console.log('➕ createUserApi - Données:', userData)
    const response = await axiosInstance.post('/users', userData)
    console.log('✅ createUserApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ createUserApi - Erreur:', error)
    throw error
  }
}

// ✅ METTRE À JOUR UN UTILISATEUR
export const updateUserApi = async (id, userData) => {
  try {
    console.log('✏️ updateUserApi - ID:', id, 'Données:', userData)
    const response = await axiosInstance.put(`/users/${id}`, userData)
    console.log('✅ updateUserApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ updateUserApi - Erreur:', error)
    throw error
  }
}

// ✅ CHANGER LE STATUT D'UN UTILISATEUR (IMPORTANT!)
export const changeUserStatusApi = async (id, isActive) => {
  try {
    console.log('🔄 changeUserStatusApi - ID:', id, 'Statut:', isActive)
    const response = await axiosInstance.patch(`/users/${id}/status`, { is_active: isActive })
    console.log('✅ changeUserStatusApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ changeUserStatusApi - Erreur:', error)
    throw error
  }
}

// ✅ SUPPRIMER UN UTILISATEUR
export const deleteUserApi = async (id) => {
  try {
    console.log('🗑️ deleteUserApi - Suppression de l\'utilisateur:', id)
    const response = await axiosInstance.delete(`/users/${id}`)
    console.log('✅ deleteUserApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteUserApi - Erreur:', error)
    throw error
  }
}

// ✅ CHANGER LE RÔLE D'UN UTILISATEUR
export const changeUserRoleApi = async (id, roleId) => {
  try {
    console.log('🎭 changeUserRoleApi - ID:', id, 'Rôle:', roleId)
    const response = await axiosInstance.put(`/users/${id}`, { role_id: roleId })
    console.log('✅ changeUserRoleApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ changeUserRoleApi - Erreur:', error)
    throw error
  }
}

// ✅ TÉLÉCHARGER UN AVATAR UTILISATEUR
export const uploadAvatarApi = async (file) => {
  try {
    console.log('📸 uploadAvatarApi - Fichier:', file.name)
    
    const formData = new FormData()
    formData.append('profile_image', file)
    
    // ✅ Utiliser l'instance pour fichiers (laissent le navigateur définir Content-Type)
    const response = await axiosFileInstance.post('/users/avatar/upload', formData)
    
    console.log('✅ uploadAvatarApi - Succès:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ uploadAvatarApi - Erreur:', error)
    throw error
  }
}

/**
 * ============================================
 * 🎭 GESTION DES RÔLES
 * ============================================
 */

// ✅ RÉCUPÉRER TOUS LES RÔLES
export const getAllRolesApi = async () => {
  try {
    console.log('🎭 getAllRolesApi - Récupération des rôles...')
    const response = await axiosInstance.get('/users/roles/list')
    console.log('✅ getAllRolesApi - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getAllRolesApi - Erreur:', error)
    throw error
  }
}

// ✅ RÉCUPÉRER UN RÔLE PAR ID
export const getRoleByIdApi = async (id) => {
  try {
    console.log('🎭 getRoleByIdApi - ID:', id)
    const response = await axiosInstance.get(`/roles/${id}`)
    console.log('✅ getRoleByIdApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ getRoleByIdApi - Erreur:', error)
    throw error
  }
}

// ✅ CRÉER UN NOUVEAU RÔLE
export const createRoleApi = async (roleData) => {
  try {
    console.log('➕ createRoleApi - Données:', roleData)
    const response = await axiosInstance.post('/roles', roleData)
    console.log('✅ createRoleApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ createRoleApi - Erreur:', error)
    throw error
  }
}

// ✅ METTRE À JOUR UN RÔLE
export const updateRoleApi = async (id, roleData) => {
  try {
    console.log('✏️ updateRoleApi - ID:', id, 'Données:', roleData)
    const response = await axiosInstance.put(`/roles/${id}`, roleData)
    console.log('✅ updateRoleApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ updateRoleApi - Erreur:', error)
    throw error
  }
}

// ✅ SUPPRIMER UN RÔLE
export const deleteRoleApi = async (id) => {
  try {
    console.log('🗑️ deleteRoleApi - Suppression du rôle:', id)
    const response = await axiosInstance.delete(`/roles/${id}`)
    console.log('✅ deleteRoleApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteRoleApi - Erreur:', error)
    throw error
  }
}

/**
 * ============================================
 * 📊 GESTION DES PERMISSIONS
 * ============================================
 */

// ✅ RÉCUPÉRER LES PERMISSIONS D'UN RÔLE
export const getRolePermissionsApi = async (roleId) => {
  try {
    console.log('🔐 getRolePermissionsApi - Rôle ID:', roleId)
    const response = await axiosInstance.get(`/roles/${roleId}/permissions`)
    console.log('✅ getRolePermissionsApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ getRolePermissionsApi - Erreur:', error)
    throw error
  }
}

// ✅ METTRE À JOUR LES PERMISSIONS D'UN RÔLE
export const updateRolePermissionsApi = async (roleId, permissions) => {
  try {
    console.log('✏️ updateRolePermissionsApi - Rôle ID:', roleId, 'Permissions:', permissions)
    const response = await axiosInstance.put(`/roles/${roleId}/permissions`, { permissions })
    console.log('✅ updateRolePermissionsApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ updateRolePermissionsApi - Erreur:', error)
    throw error
  }
}
