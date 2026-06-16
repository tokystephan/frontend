import { useState, useEffect, useCallback } from 'react';
import entretienService from '../services/entretienService';

export const useInterviews = (initialFilters = {}) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await entretienService.getAll(filters);
      // Le serveur retourne { events: [...], stats: {...} }
      setInterviews(Array.isArray(response.data.events) ? response.data.events : response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const changerStatut = async (id, nouveauStatut) => {
    try {
      await entretienService.updateStatut(id, nouveauStatut);
      setInterviews(prev => prev.map(e => e.id === id ? { ...e, status: nouveauStatut } : e));
    } catch (e) {
      setError('Impossible de changer le statut');
      fetchInterviews(); // recharge pour rollback
    }
  };

  const supprimerEntretien = async (id) => {
    try {
      await entretienService.delete(id);
      setInterviews(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      setError('Impossible de supprimer');
    }
  };

  const ajouterEntretien = (nouvelEntretien) => {
    setInterviews(prev => [nouvelEntretien, ...prev]);
  };

  const majCompteRendu = (entretienId, nouveauCR) => {
    // backend renvoie un report (interview_reports)
    setInterviews(prev => prev.map(e => e.id === entretienId ? { ...e, report: nouveauCR } : e));
  };

  const createInterview = async (data) => {
    try {
      const response = await entretienService.create(data);
      ajouterEntretien(response.data);
      return response.data;
    } catch (error) {
      setError('Erreur lors de la création');
      throw error;
    }
  };

  const updateInterview = async (id, data) => {
    try {
      const response = await entretienService.update(id, data);
      setInterviews(prev => prev.map(e => e.id === id ? response.data : e));
      return response.data;
    } catch (error) {
      setError('Erreur lors de la modification');
      throw error;
    }
  };

  return {
    interviews,
    loading,
    error,
    filters,
    setFilters,
    changerStatut,
    supprimerEntretien,
    ajouterEntretien,
    majCompteRendu,
    createInterview,
    updateInterview,
    refetch: fetchInterviews,
  };
};