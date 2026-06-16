import { 
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
} from '../api/candidateApi'

/**
 * Liste des candidats avec pagination et filtres
 * @param {Object} params - Paramètres de filtrage (page, search, source, etc.)
 * @returns {Promise<Object>} - Données des candidats
 */
export const listCandidates = async (params = {}) => {
  try {
    console.log('👥 listCandidates - Paramètres:', params)
    const response = await getCandidates(params)
    console.log('✅ listCandidates - Succès')
    return response
  } catch (error) {
    console.error('❌ listCandidates - Erreur:', error)
    throw error.response?.data || error
  }
}

/**
 * Récupérer un candidat par son ID
 * @param {number|string} id - ID du candidat
 * @returns {Promise<Object>} - Données du candidat
 */
export const getCandidate = async (id) => {
  try {
    console.log('👥 getCandidate - ID:', id)
    const response = await getCandidateById(id)
    console.log('✅ getCandidate - Succès')
    return response
  } catch (error) {
    console.error('❌ getCandidate - Erreur:', error)
    throw error.response?.data || error
  }
}

/**
 * Créer un nouveau candidat
 * @param {Object} candidateData - Données du candidat
 * @returns {Promise<Object>} - Candidat créé
 */
export const createCandidateService = async (candidateData) => {
  try {
    // ✅ Nettoyer les données avant envoi
    const cleanedData = {
      first_name: candidateData.first_name?.trim() || '',
      last_name: candidateData.last_name?.trim() || '',
      email: candidateData.email?.trim() || '',
      phone: candidateData.phone?.trim() || '',      // ← chaîne vide au lieu de null
      source: candidateData.source || null,
      notes: candidateData.notes?.trim() || '',
      documents: candidateData.documents || [],
    }

    console.log('👥 createCandidateService - Données nettoyées:', cleanedData)
    const response = await createCandidate(cleanedData)
    console.log('✅ createCandidateService - Succès')
    return response
  } catch (error) {
    console.error('❌ createCandidateService - Erreur:', error)
    throw error.response?.data || error
  }
}

/**
 * Mettre à jour un candidat existant
 * @param {number|string} id - ID du candidat
 * @param {Object} candidateData - Nouvelles données
 * @returns {Promise<Object>} - Candidat mis à jour
 */
export const updateCandidateService = async (id, candidateData) => {
  try {
    // ✅ Nettoyer les données avant envoi
    const cleanedData = {
      first_name: candidateData.first_name?.trim() || '',
      last_name: candidateData.last_name?.trim() || '',
      email: candidateData.email?.trim() || '',
      phone: candidateData.phone?.trim() || '',      // ← chaîne vide au lieu de null
      source: candidateData.source || null,
      notes: candidateData.notes?.trim() || '',
      documents: candidateData.documents || [],
    }

    console.log('👥 updateCandidateService - ID:', id, 'Données:', cleanedData)
    const response = await updateCandidate(id, cleanedData)
    console.log('✅ updateCandidateService - Succès')
    return response
  } catch (error) {
    console.error('❌ updateCandidateService - Erreur:', error)
    throw error.response?.data || error
  }
}

/**
 * Supprimer un candidat
 * @param {number|string} id - ID du candidat
 * @returns {Promise<Object>} - Message de confirmation
 */
export const deleteCandidateService = async (id) => {
  try {
    console.log('🗑️ deleteCandidateService - ID:', id)
    const response = await deleteCandidate(id)
    console.log('✅ deleteCandidateService - Succès')
    return response
  } catch (error) {
    console.error('❌ deleteCandidateService - Erreur:', error)
    throw error.response?.data || error
  }
}