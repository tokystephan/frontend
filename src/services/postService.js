import { 
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  archivePostApi,
  restorePostApi
} from '../api/postApi'

export const listPosts = async (params = {}) => {
  try {
    const response = await getPosts(params.page || 1)
    return response
  } catch (error) {
    console.error('❌ listPosts - Erreur:', error)
    throw error
  }
}

export const getPost = async (id) => {
  try {
    const response = await getPostById(id)
    return response
  } catch (error) {
    console.error('❌ getPost - Erreur:', error)
    throw error
  }
}

export const createPostService = async (postData) => {
  try {
    const response = await createPost(postData)
    return response
  } catch (error) {
    console.error('❌ createPostService - Erreur:', error)
    throw error
  }
}

export const updatePostService = async (id, postData) => {
  try {
    const response = await updatePost(id, postData)
    return response
  } catch (error) {
    console.error('❌ updatePostService - Erreur:', error)
    throw error
  }
}

export const deletePostService = async (id) => {
  try {
    const response = await deletePost(id)
    return response
  } catch (error) {
    console.error('❌ deletePostService - Erreur:', error)
    throw error
  }
}

export const archivePost = async (id) => {
  try {
    const response = await archivePostApi(id)
    return response
  } catch (error) {
    console.error('❌ archivePost - Erreur:', error)
    throw error
  }
}

export const restorePost = async (id) => {
  try {
    const response = await restorePostApi(id)
    return response
  } catch (error) {
    console.error('❌ restorePost - Erreur:', error)
    throw error
  }
}