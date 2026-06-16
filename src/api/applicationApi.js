import axios from './axiosConfig'

/**
 * GET ALL APPLICATIONS
 */
export const getApplications = async (page = 1) => {
  try {
    console.log('📋 getApplications - Récupération des candidatures...')
    const response = await axios.get(`/applications?page=${page}`)
    console.log('✅ getApplications - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getApplications - Erreur:', error)
    throw error
  }
}

/**
 * GET APPLICATION BY ID
 */
export const getApplicationById = async (id) => {
  try {
    console.log('📋 getApplicationById - Récupération de la candidature:', id)
    const response = await axios.get(`/applications/${id}`)
    console.log('✅ getApplicationById - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getApplicationById - Erreur:', error)
    throw error
  }
}

/**
 * CREATE APPLICATION
 */
export const createApplication = async (applicationData) => {
  try {
    console.log('📋 createApplication - Création d\'une candidature:', applicationData)
    const response = await axios.post('/applications', applicationData)
    console.log('✅ createApplication - Succès')
    return response.data
  } catch (error) {
    console.error('❌ createApplication - Erreur:', error)
    throw error
  }
}

/**
 * UPDATE APPLICATION
 */
export const updateApplication = async (id, applicationData) => {
  try {
    console.log('📋 updateApplication - Mise à jour de la candidature:', id)
    const response = await axios.put(`/applications/${id}`, applicationData)
    console.log('✅ updateApplication - Succès')
    return response.data
  } catch (error) {
    console.error('❌ updateApplication - Erreur:', error)
    throw error
  }
}

/**
 * DELETE APPLICATION
 */
export const deleteApplication = async (id) => {
  try {
    console.log('🗑️ deleteApplication - Suppression de la candidature:', id)
    const response = await axios.delete(`/applications/${id}`)
    console.log('✅ deleteApplication - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteApplication - Erreur:', error)
    throw error
  }
}

/**
 * CHANGE APPLICATION STATUS
 */
export const changeStatus = async (id, statusData) => {
  try {
    console.log('🔄 changeStatus - Changement du statut:', id, statusData)
    const response = await axios.put(`/applications/${id}/status`, statusData)
    console.log('✅ changeStatus - Succès')
    return response.data
  } catch (error) {
    console.error('❌ changeStatus - Erreur:', error)
    throw error
  }
}

/**
 * ADD APPLICATION COMMENT
 */
export const addApplicationCommentApi = async (applicationId, commentData) => {
  try {
    console.log('💬 addApplicationCommentApi - Ajout d\'un commentaire:', applicationId)
    const response = await axios.post(`/applications/${applicationId}/comments`, commentData)
    console.log('✅ addApplicationCommentApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ addApplicationCommentApi - Erreur:', error)
    throw error
  }
}

/**
 * GET APPLICATION COMMENTS
 */
export const getApplicationCommentsApi = async (applicationId) => {
  try {
    console.log('💬 getApplicationCommentsApi - Récupération des commentaires:', applicationId)
    const response = await axios.get(`/applications/${applicationId}/comments`)
    console.log('✅ getApplicationCommentsApi - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getApplicationCommentsApi - Erreur:', error)
    throw error
  }
}

/**
 * DELETE APPLICATION COMMENT
 */
export const deleteApplicationCommentApi = async (applicationId, commentId) => {
  try {
    console.log('🗑️ deleteApplicationCommentApi - Suppression du commentaire:', commentId)
    const response = await axios.delete(`/applications/${applicationId}/comments/${commentId}`)
    console.log('✅ deleteApplicationCommentApi - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteApplicationCommentApi - Erreur:', error)
    throw error
  }
}