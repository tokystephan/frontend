import { 
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  changeStatus,
  addApplicationCommentApi,
  getApplicationCommentsApi,
  deleteApplicationCommentApi
} from '../api/applicationApi'

/**
 * GET ALL APPLICATIONS
 */
export const getAllApplications = async (page = 1) => {
  try {
    console.log('📋 getAllApplications - Page:', page)
    const response = await getApplications(page)
    console.log('✅ getAllApplications - Succès')
    return response
  } catch (error) {
    console.error('❌ getAllApplications - Erreur:', error)
    throw error
  }
}

/**
 * GET APPLICATION BY ID
 */
export const getApplication = async (id) => {
  try {
    console.log('📋 getApplication - ID:', id)
    const response = await getApplicationById(id)
    console.log('✅ getApplication - Succès')
    return response
  } catch (error) {
    console.error('❌ getApplication - Erreur:', error)
    throw error
  }
}

/**
 * CREATE APPLICATION
 */
export const createNewApplication = async (applicationData) => {
  try {
    console.log('📋 createNewApplication - Données:', applicationData)
    const response = await createApplication(applicationData)
    console.log('✅ createNewApplication - Succès')
    return response
  } catch (error) {
    console.error('❌ createNewApplication - Erreur:', error)
    throw error
  }
}

/**
 * UPDATE APPLICATION
 */
export const editApplication = async (id, applicationData) => {
  try {
    console.log('📋 editApplication - ID:', id)
    const response = await updateApplication(id, applicationData)
    console.log('✅ editApplication - Succès')
    return response
  } catch (error) {
    console.error('❌ editApplication - Erreur:', error)
    throw error
  }
}

/**
 * DELETE APPLICATION
 */
export const removeApplication = async (id) => {
  try {
    console.log('🗑️ removeApplication - ID:', id)
    const response = await deleteApplication(id)
    console.log('✅ removeApplication - Succès')
    return response
  } catch (error) {
    console.error('❌ removeApplication - Erreur:', error)
    throw error
  }
}

/**
 * CHANGE APPLICATION STATUS
 */
export const updateApplicationStatus = async (id, statusData) => {
  try {
    console.log('🔄 updateApplicationStatus - ID:', id)
    const response = await changeStatus(id, statusData)
    console.log('✅ updateApplicationStatus - Succès')
    return response
  } catch (error) {
    console.error('❌ updateApplicationStatus - Erreur:', error)
    throw error
  }
}

/**
 * ADD COMMENT
 */
export const addComment = async (applicationId, commentData) => {
  try {
    console.log('💬 addComment - Application ID:', applicationId)
    const response = await addApplicationCommentApi(applicationId, commentData)
    console.log('✅ addComment - Succès')
    return response
  } catch (error) {
    console.error('❌ addComment - Erreur:', error)
    throw error
  }
}

/**
 * GET COMMENTS
 */
export const getComments = async (applicationId) => {
  try {
    console.log('💬 getComments - Application ID:', applicationId)
    const response = await getApplicationCommentsApi(applicationId)
    console.log('✅ getComments - Succès')
    return response
  } catch (error) {
    console.error('❌ getComments - Erreur:', error)
    throw error
  }
}

/**
 * DELETE COMMENT
 */
export const removeComment = async (applicationId, commentId) => {
  try {
    console.log('🗑️ removeComment - Comment ID:', commentId)
    const response = await deleteApplicationCommentApi(applicationId, commentId)
    console.log('✅ removeComment - Succès')
    return response
  } catch (error) {
    console.error('❌ removeComment - Erreur:', error)
    throw error
  }
}