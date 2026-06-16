import axios from './axiosConfig'

/**
 * GET ALL EVENTS
 */
export const getEvents = async (page = 1) => {
  try {
    console.log('📅 getEvents - Récupération des événements...')
    const response = await axios.get(`/events?page=${page}`)
    console.log('✅ getEvents - Réponse:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ getEvents - Erreur:', error)
    throw error
  }
}

/**
 * GET EVENT BY ID
 */
export const getEventById = async (id) => {
  try {
    const response = await axios.get(`/events/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ getEventById - Erreur:', error)
    throw error
  }
}

/**
 * CREATE EVENT
 */
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post('/events', eventData)
    return response.data
  } catch (error) {
    console.error('❌ createEvent - Erreur:', error)
    throw error
  }
}

/**
 * UPDATE EVENT
 */
export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`/events/${id}`, eventData)
    return response.data
  } catch (error) {
    console.error('❌ updateEvent - Erreur:', error)
    throw error
  }
}

/**
 * DELETE EVENT
 */
export const deleteEvent = async (id) => {
  try {
    console.log('🗑️ deleteEvent - Suppression de l\'événement:', id)
    const response = await axios.delete(`/events/${id}`)
    console.log('✅ deleteEvent - Succès')
    return response.data
  } catch (error) {
    console.error('❌ deleteEvent - Erreur:', error)
    throw error
  }
}