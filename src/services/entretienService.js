import api from './api';

const entretienService = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  updateStatut: (id, status) => api.patch(`/events/${id}/status`, { status }),
  submitCompteRendu: (id, data) => api.post(`/events/${id}/report`, data),
  deleteReport: (id) => api.delete(`/events/${id}/report`),
  validateReport: (id) => api.post(`/events/${id}/report/validate`),
  validateOffer: (id, data) => api.post(`/events/${id}/validate-offer`, data),
  exportReport: (id) => api.get(`/events/${id}/report/export`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/events/${id}`),
};

export default entretienService;
