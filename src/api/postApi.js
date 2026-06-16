import axios from './axiosConfig';



/**
 * RÉCUPÉRATION DES POSTES (avec pagination et filtres)
 */
export const getPosts = async (params = {}) => {
    try {
        console.log('📝 getPosts - Récupération des postes...');
        // Si params est un nombre, on traite comme une page, sinon comme un objet de filtres
        const queryParams = typeof params === 'number' ? { page: params } : params;
        const response = await axios.get('/posts', { params: queryParams });
        console.log('✅ getPosts - Réponse:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ getPosts - Erreur:', error);
        throw error;
    }
};

/**
 * RÉCUPÉRATION D'UN POSTE PAR ID
 */
export const getPostById = async (id) => {
    try {
        const safeId = encodeURIComponent(String(id).trim());
        const response = await axios.get(`/posts/${safeId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ getPostById (${id}) - Erreur:`, error);
        throw error;
    }
};

/**
 * CRÉATION D'UN POSTE
 */
export const createPost = async (postData) => {
    try {
        const response = await axios.post('/posts', postData);
        return response.data;
    } catch (error) {
        console.error('❌ createPost - Erreur:', error);
        throw error;
    }
};

/**
 * MISE À JOUR D'UN POSTE
 */
export const updatePost = async (id, postData) => {
    try {
        const response = await axios.put(`/posts/${id}`, postData);
        return response.data;
    } catch (error) {
        console.error(`❌ updatePost (${id}) - Erreur:`, error);
        throw error;
    }
};

/**
 * SUPPRESSION D'UN POSTE
 */
export const deletePost = async (id) => {
    try {
        console.log('🗑️ deletePost - Suppression du poste:', id);
        const response = await axios.delete(`/posts/${id}`);
        console.log('✅ deletePost - Succès');
        return response.data;
    } catch (error) {
        console.error(`❌ deletePost (${id}) - Erreur:`, error);
        throw error;
    }
};

/**
 * ARCHIVAGE / FERMETURE D'UN POSTE
 */
export const archivePostApi = async (id) => {
    try {
        console.log('📦 archivePostApi - ID:', id);
        // On utilise PATCH car c'est une modification partielle du statut
        const response = await axios.patch(`/posts/${id}/archive`);
        console.log('✅ archivePostApi - Succès');
        return response.data;
    } catch (error) {
        console.error(`❌ archivePostApi (${id}) - Erreur:`, error);
        throw error;
    }
};

/**
 * RESTAURATION / RÉOUVERTURE D'UN POSTE
 */
export const restorePostApi = async (id) => {
    try {
        console.log('♻️ restorePostApi - ID:', id);
        const response = await axios.patch(`/posts/${id}/restore`);
        console.log('✅ restorePostApi - Succès');
        return response.data;
    } catch (error) {
        console.error(`❌ restorePostApi (${id}) - Erreur:`, error);
        throw error;
    }
};

/**
 * GESTION DES COMPÉTENCES (SKILLS)
 */
export const addSkill = async (id, skillData) => {
    try {
        const response = await axios.post(`/posts/${id}/skills`, skillData);
        return response.data;
    } catch (error) {
        console.error('❌ addSkill - Erreur:', error);
        throw error;
    }
};

export const removeSkill = async (postId, skillId) => {
    try {
        const response = await axios.delete(`/posts/${postId}/skills/${skillId}`);
        return response.data;
    } catch (error) {
        console.error('❌ removeSkill - Erreur:', error);
        throw error;
    }
};

/**
 * RÉCUPÉRATION DES CANDIDATURES LIÉES AU POSTE
 */
export const getPostApplications = async (id, params = {}) => {
    try {
        const response = await axios.get(`/posts/${id}/applications`, { params });
        return response.data;
    } catch (error) {
        console.error(`❌ getPostApplications (${id}) - Erreur:`, error);
        throw error;
    }
};