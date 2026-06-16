// src/services/statisticsService.js
import api from './api';

// ========== STATISTIQUES GÉNÉRALES ==========
export const getStatistics = async () => {
  try {
    const response = await api.get('/statistics');
    return response.data;
  } catch (error) {
    console.error('Erreur getStatistics:', error);
    return {
      totalApplications: 0,
      pending: 0,
      byStatus: [],
      byDepartment: {},
      scheduledInterviews: 0,
      conversionRate: 0,
    };
  }
};

// ========== STATISTIQUES DE RECRUTEMENT ==========
export const getRecruitmentStats = async (type = 'timeline') => {
  try {
    const response = await api.get(`/statistics/recruitment/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur getRecruitmentStats (${type}):`, error);
    return type === 'timeline' ? [] : [];
  }
};

// ========== STATISTIQUES PAR SOURCE ==========
export const getSourceStats = async () => {
  try {
    const response = await api.get('/statistics/sources');
    return response.data;
  } catch (error) {
    console.error('Erreur getSourceStats:', error);
    return [];
  }
};

// ========== STATISTIQUES PAR DÉPARTEMENT ==========
export const getDepartmentStats = async () => {
  try {
    const response = await api.get('/statistics/departments');
    return response.data;
  } catch (error) {
    console.error('Erreur getDepartmentStats:', error);
    return [];
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/statistics/admin');
    return response.data;
  } catch (error) {
    console.error('Erreur getAdminStats:', error);
    return {
      totalApplications: 0,
      pendingApplications: 0,
      interviewsScheduled: 0,
      conversionRate: 0,
      statusDistribution: [],
      departmentDistribution: [],
    };
  }
};

export const getStatusDistribution = async () => {
  try {
    const response = await api.get('/statistics/status-distribution');
    return response.data;
  } catch (error) {
    console.error('Erreur getStatusDistribution:', error);
    return [];
  }
};

export const getDepartmentDistribution = async () => {
  try {
    const response = await api.get('/statistics/department-distribution');
    return response.data;
  } catch (error) {
    console.error('Erreur getDepartmentDistribution:', error);
    return [];
  }
};