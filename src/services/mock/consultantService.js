import api from './api';

const consultantService = {
    // Dashboard
    getDashboard: () => api.get('/manager/dashboard'),
    
    // Postes
    getPosts: () => api.get('/manager/posts'),
    
    // Candidatures à évaluer
    getCandidatesToEvaluate: () => api.get('/manager/candidates-to-evaluate'),
    
    // Événements (agenda)
    getEvents: () => api.get('/manager/events'),
    
    // Entretiens (invitations)
    getInterviews: () => api.get('/manager/interviews'),
    
    // Performance
    getPerformance: () => api.get('/manager/performance'),
    
    // Évaluer un candidat
    evaluateCandidate: (applicationId, data) => 
        api.post(`/manager/evaluate/${applicationId}`, data),
    
    // Répondre à une invitation
    respondToInterview: (interviewId, response) => 
        api.post(`/manager/interviews/${interviewId}/respond`, { response }),
};

export default consultantService;
