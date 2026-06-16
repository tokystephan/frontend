import axios from './axiosConfig'

/**
 * GET ALL CANDIDATES
 */
export const getCandidates = async (params = {}) => {
  try {
    console.log('👥 getCandidates - Récupération des candidats...', params)
    const response = await axios.get('/candidates', { params })
    console.log('✅ getCandidates - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getCandidates - Erreur:', error)
    throw error
  }
}

/**
 * GET CANDIDATE BY ID
 */
export const getCandidateById = async (id) => {
  try {
    const response = await axios.get(`/candidates/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ getCandidateById - Erreur:', error)
    throw error
  }
}

/**
 * CREATE CANDIDATE
 */
export const createCandidate = async (candidateData) => {
  try {
    const response = await axios.post('/candidates', candidateData)
    return response.data
  } catch (error) {
    console.error('❌ createCandidate - Erreur:', error)
    throw error
  }
}

/**
 * UPDATE CANDIDATE
 */
export const updateCandidate = async (id, candidateData) => {
  try {
    const response = await axios.put(`/candidates/${id}`, candidateData)
    return response.data
  } catch (error) {
    console.error('❌ updateCandidate - Erreur:', error)
    throw error
  }
}

/**
 * DELETE CANDIDATE
 */
export const deleteCandidate = async (id) => {
  try {
    console.log(' deleteCandidate - Suppression du candidat:', id)
    const response = await axios.delete(`/candidates/${id}`)
    console.log(' deleteCandidate - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteCandidate - Erreur:', error)
    throw error
  }
}