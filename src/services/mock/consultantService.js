import api from './api';

const consultantService = {
    // Dashboard
    getDashboard: () => api.get('/consultant/dashboard'),
    
    // Postes
    getPosts: () => api.get('/consultant/posts'),
    
    // Candidatures à évaluer
    getCandidatesToEvaluate: () => api.get('/consultant/candidates-to-evaluate'),
    
    // Événements (agenda)
    getEvents: () => api.get('/consultant/events'),
    
    // Entretiens (invitations)
    getInterviews: () => api.get('/consultant/interviews'),
    
    // Performance
    getPerformance: () => api.get('/consultant/performance'),
    
    // Évaluer un candidat
    evaluateCandidate: (applicationId, data) => 
        api.post(`/consultant/evaluate/${applicationId}`, data),
    
    // Répondre à une invitation
    respondToInterview: (interviewId, response) => 
        api.post(`/consultant/interviews/${interviewId}/respond`, { response }),
};

export default consultantService;