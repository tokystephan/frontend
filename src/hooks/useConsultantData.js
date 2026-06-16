import { useState, useEffect, useCallback } from 'react';
import consultantService from '../services/consultantService';
import toast from 'react-hot-toast';

export const useConsultantData = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        myPosts: 0,
        pendingEvaluations: 0,
        upcomingEvents: 0,
        toEvaluate: 0,
    });
    const [myPosts, setMyPosts] = useState([]);
    const [candidatesToEvaluate, setCandidatesToEvaluate] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [events, setEvents] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, postsRes, candidatesRes, interviewsRes, eventsRes, performanceRes] = await Promise.all([
                consultantService.getDashboard(),
                consultantService.getPosts(),
                consultantService.getCandidatesToEvaluate(),
                consultantService.getInterviews(),
                consultantService.getEvents(),
                consultantService.getPerformance(),
            ]);
            
            setStats(statsRes.data);
            setMyPosts(postsRes.data);
            setCandidatesToEvaluate(candidatesRes.data);
            setInterviews(interviewsRes.data);
            setEvents(eventsRes.data);
            setPerformanceData(performanceRes.data);
        } catch (err) {
            console.error('Erreur chargement:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, []);

    const evaluateCandidate = async (applicationId, evaluationData) => {
        try {
            await consultantService.evaluateCandidate(applicationId, evaluationData);
            toast.success('Évaluation enregistrée avec succès');
            await fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'évaluation');
            throw err;
        }
    };

    const respondToInterview = async (interviewId, response) => {
        try {
            await consultantService.respondToInterview(interviewId, response);
            toast.success(`Invitation ${response === 'accept' ? 'acceptée' : 'refusée'}`);
            await fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la réponse');
            throw err;
        }
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        loading,
        error,
        stats,
        myPosts,
        candidatesToEvaluate,
        interviews,
        events,
        performanceData,
        evaluateCandidate,
        respondToInterview,
        refresh: fetchAll,
    };
};