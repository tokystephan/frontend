import api from './api';

const notificationService = {
    // Récupérer les notifications
    getAll: (page = 1, limit = 50, unreadOnly = false) => 
        api.get('/notifications', { params: { page, limit, unread_only: unreadOnly } }),
    
    // Récupérer le nombre de non lues
    getUnreadCount: () => 
        api.get('/notifications/unread/count'),
    
    // Marquer comme lue
    markAsRead: (id) => 
        api.patch(`/notifications/${id}/read`),
    
    // Marquer toutes comme lues
    markAllAsRead: () => 
        api.patch('/notifications/mark-all-read'),
    
    // Supprimer une notification
    delete: (id) => 
        api.delete(`/notifications/${id}`),
    
    // Supprimer toutes
    deleteAll: () => 
        api.delete('/notifications'),
};

export default notificationService;