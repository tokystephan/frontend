// src/pages/dashboard/ConsultantDashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from '../../components/Layout/AppLayout';
import {
  Briefcase,
  Search,
  Users,
  Calendar,
  Star,
  Eye,
  MessageSquare,
  ChevronRight,
  Loader,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const ConsultantDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const endpointPrefix = '/manager';
  const [loading, setLoading] = useState(true);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  
  const [stats, setStats] = useState({
    myPosts: 0,
    pendingEvaluations: 0,
    upcomingEvents: 0,
    toEvaluate: 0,
    needsDepartment: false,
    message: '',
  });
  
  const [myPosts, setMyPosts] = useState([]);
  const [candidatesToEvaluate, setCandidatesToEvaluate] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({ 
    technical: 0,
    communication: 0,
    motivation: 0,
    culture: 0,
    recommendation: 'reserve',
    strengths: '',
    weaknesses: '',
    comment: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  
  const [managerInterviews, setManagerInterviews] = useState([]);

  // ==================== CHARGEMENT DES DONNÉES ====================
  
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur chargement des statistiques');
    }
  }, [endpointPrefix]);

  const fetchMyPosts = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/posts`);
      setMyPosts(response.data);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setMyPosts([]);
    }
  }, [endpointPrefix]);

  const fetchCandidatesToEvaluate = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/candidates-to-evaluate`);
      setCandidatesToEvaluate(response.data);
    } catch (error) {
      console.error('Erreur chargement candidats:', error);
      setCandidatesToEvaluate([]);
    }
  }, [endpointPrefix]);

  const fetchMyEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/events`);
      const events = response.data;
      const today = new Date().toISOString().split('T')[0];
      const todayEvts = events.filter((e) => e.datetime?.startsWith(today));
      setTodayEvents(todayEvts);
      const upcoming = events.filter((e) => e.datetime && e.datetime > today);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      setTodayEvents([]);
      setUpcomingEvents([]);
    }
  }, [endpointPrefix]);

  const fetchManagerInterviews = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/interviews`);
      setManagerInterviews(response.data || []);
    } catch (error) {
      console.error('Erreur chargement entretiens consultant:', error);
      setManagerInterviews([]);
    }
  }, [endpointPrefix]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await axios.get(`${endpointPrefix}/performance`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Erreur performance:', error);
      setPerformanceData([]);
    }
  }, [endpointPrefix]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchMyPosts(),
          fetchCandidatesToEvaluate(),
          fetchMyEvents(),
          fetchPerformanceData(),
          fetchManagerInterviews()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchDashboardData, fetchMyPosts, fetchCandidatesToEvaluate, fetchMyEvents, fetchPerformanceData, fetchManagerInterviews]);

  // ==================== FILTRAGE ====================
  
  const filteredCandidates = useMemo(() => {
    return candidatesToEvaluate.filter(candidate => {
      const matchesSearch = searchTerm === '' || 
        (candidate.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (candidate.position?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidatesToEvaluate, searchTerm, statusFilter]);

  // ==================== GESTION DE L'ÉVALUATION ====================
  
  const parseEvaluationNotes = (evaluation) => {
    if (!evaluation?.comment) return null;
    const lines = evaluation.comment.split('\n');
    const parsed = {
      technical: null,
      communication: null,
      motivation: null,
      culture: null,
    };

    const regex = /^(Technique|Communication|Motivation|Culture)\s*:\s*(\d)\/5$/i;
    lines.forEach((line) => {
      const match = line.trim().match(regex);
      if (match) {
        const key = match[1].toLowerCase();
        parsed[key] = Number(match[2]);
      }
    });

    // If the raw report uses alternative labels like 'Techniques', fallback to generic extraction
    if (parsed.technical === null && /Technique\s*:\s*\d\/5/i.test(evaluation.comment)) {
      const match = evaluation.comment.match(/Technique\s*:\s*(\d)\/5/i);
      parsed.technical = match ? Number(match[1]) : null;
    }

    return parsed;
  };

  const getEvaluationNumbers = (evaluation) => {
    if (!evaluation) return [];
    if (typeof evaluation.technical === 'number' && typeof evaluation.communication === 'number') {
      return [evaluation.technical, evaluation.communication, evaluation.motivation, evaluation.culture].map((value) => Number(value) || 0);
    }
    const parsed = parseEvaluationNotes(evaluation);
    if (parsed && Object.values(parsed).some((value) => value !== null)) {
      return [parsed.technical, parsed.communication, parsed.motivation, parsed.culture].map((value) => Number(value) || 0);
    }
    return [];
  };

  const getAverageEvaluationScore = (evaluation) => {
    const scores = getEvaluationNumbers(evaluation).filter((value) => value > 0);
    if (scores.length === 0) return null;
    return (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1);
  };

  const handleOpenEvaluation = (candidate) => {
    // 🔐 PERMISSION: Vérifier que le candidate est dans la liste visible
    const candidateExists = candidatesToEvaluate.some(c => c.id === candidate.id);
    if (!candidateExists) {
      toast.error('Vous n\'avez pas accès à cette candidature');
      return;
    }
    
    setSelectedCandidate(candidate);
    if (candidate.evaluation) {
      const parsed = parseEvaluationNotes(candidate.evaluation);
      setEvaluationForm({
        technical: parsed?.technical || 0,
        communication: parsed?.communication || 0,
        motivation: parsed?.motivation || 0,
        culture: parsed?.culture || 0,
        recommendation: candidate.evaluation.recommendation || 'reserve',
        strengths: candidate.evaluation.strengths || '',
        weaknesses: candidate.evaluation.weaknesses || '',
        comment: candidate.evaluation.comment || ''
      });
    } else {
      // Formulaire vierge par défaut
      setEvaluationForm({
        technical: 0,
        communication: 0,
        motivation: 0,
        culture: 0,
        recommendation: 'reserve',
        strengths: '',
        weaknesses: '',
        comment: ''
      });
    }
    setShowEvaluationModal(true);
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedCandidate) return;
    setEvaluationLoading(true);
    try {
      await axios.post(`${endpointPrefix}/evaluate/${selectedCandidate.id}`, evaluationForm);
      toast.success('Avis enregistré avec succès');
      setShowEvaluationModal(false);
      await fetchCandidatesToEvaluate();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setEvaluationLoading(false);
    }
  };

  // ==================== GESTION DES ENTRETIENS (Manager) ====================

  const handleInterviewResponse = async (interviewId, response) => {
    try {
      await axios.post(`${endpointPrefix}/interviews/${interviewId}/respond`, { response });
      toast.success(`Entretien ${response === 'accept' ? 'accepté' : 'refusé'}`);
      await fetchManagerInterviews();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // =================== FORMATAGE ====================
  
  const getStatusColor = (status) => {
    const colors = {
      'Reçue': 'bg-green-100 text-green-700',
      'En cours': 'bg-yellow-100 text-yellow-700',
      'Entretien RH': 'bg-blue-100 text-blue-700',
      'Entretien technique': 'bg-purple-100 text-purple-700',
      'Entretien final': 'bg-indigo-100 text-indigo-700',
      'Acceptée': 'bg-emerald-100 text-emerald-700',
      'Refusée': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getEventColor = (type) => {
    const colors = {
      'technique': 'bg-purple-100 text-purple-700',
      'rh': 'bg-blue-100 text-blue-700',
      'final': 'bg-indigo-100 text-indigo-700',
      'telephonique': 'bg-cyan-100 text-cyan-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'technique': return '💻';
      case 'rh': return '👥';
      case 'final': return '🎯';
      case 'telephonique': return '📞';
      default: return '📅';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Date invalide';
    }
  };

  // ==================== RENDU ====================
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-gray-500" />
            <p className="text-gray-400">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-800 font-medium">Erreur de chargement</p>
            <p className="text-gray-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const openPosts = myPosts.filter(p => p.status === 'ouvert');

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* ==================== EN-TÊTE ==================== */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Manager</h1>
          <p className="text-gray-500 mt-1">
            Bienvenue, {user?.first_name} {user?.last_name}
          </p>
        </div>

        {stats.needsDepartment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Département en attente</p>
                <p className="mt-1 text-sm">
                  {stats.message || "Aucun département n'est encore assigné. Vous recevrez une notification après validation par l'administrateur."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CARTES STATISTIQUES ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mes postes actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myPosts}</p>
              </div>
              <Briefcase className="w-10 h-10 text-blue-500 opacity-70" />
            </div>
            <p className="text-green-600 text-xs mt-2">Postes dans mon équipe</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Candidatures à évaluer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingEvaluations}</p>
              </div>
              <Users className="w-10 h-10 text-orange-500 opacity-70" />
            </div>
            <p className="text-orange-600 text-xs mt-2">En attente d'avis</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Entretiens à venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500 opacity-70" />
            </div>
            <p className="text-gray-500 text-xs mt-2">Cette semaine</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">À évaluer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.toEvaluate}</p>
              </div>
             
            </div>
            <p className="text-orange-600 text-xs mt-2">Candidatures à noter</p>
          </div>
        </div>

        {/* ==================== MES POSTES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">📌 Mes postes à pourvoir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-3">Poste</th>
                  <th className="px-6 py-3">Département</th>
                  <th className="px-6 py-3">Contrat</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Candidatures</th>
                  <th className="px-6 py-3">Entretiens</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {openPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{post.title}</td>
                    <td className="px-6 py-3 text-gray-600">{post.department}</td>
                    <td className="px-6 py-3 text-gray-600">{post.contract}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        🟢 Ouvert
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{post.candidates || 0}</td>
                    <td className="px-6 py-3 text-gray-600">{post.interviews || 0}</td>
                    <td className="px-6 py-3">
                      <Link to={`/posts/${post.id}`} className="p-1 text-gray-400 hover:text-blue-600 transition" title="Voir">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {openPosts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun poste ouvert pour le moment
              </div>
            )}
          </div>
        </div>

        {/* ==================== CANDIDATURES À ÉVALUER ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">⭐ Candidatures à évaluer</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="Reçue">Reçue</option>
                <option value="En cours">En cours</option>
                <option value="Entretien RH">Entretien RH</option>
                <option value="Entretien technique">Entretien technique</option>
                <option value="Entretien final">Entretien final</option>
                <option value="Acceptée">Acceptée</option>
                <option value="Refusée">Refusée</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-3">Candidat</th>
                  <th className="px-6 py-3">Poste</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Avis Manager</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{candidate.name}</td>
                    <td className="px-6 py-3 text-gray-600">{candidate.position}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{formatDate(candidate.date)}</td>
                    <td className="px-6 py-3">
                      {candidate.evaluation ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium text-gray-700">
                            {getAverageEvaluationScore(candidate.evaluation) ?? 'N/A'}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non évalué</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => handleOpenEvaluation(candidate)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> {candidate.evaluation ? 'Modifier avis' : 'Donner avis'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune candidature à évaluer
              </div>
            )}
          </div>
        </div>

        {/* ==================== MES ENTRETIENS À VENIR ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">📅 Mes entretiens à venir</h2>
          </div>
          <div className="p-4 space-y-3">
            {managerInterviews.filter(i => (i.status || i.statut) === 'planifie').length > 0 ? (
              managerInterviews.filter(i => (i.status || i.statut) === 'planifie').map((interview) => {
                const candidate = interview.candidate || interview.candidat;
                const location = interview.location_type === 'visio' ? `Google Meet - ${interview.meeting_link || 'Lien à venir'}` : 
                                 interview.location_type === 'telephone' ? `Téléphone - ${interview.phone_number || ''}` : interview.location;
                return (
                  <div key={interview.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-gray-50 rounded-lg gap-3 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">📅 {formatDate(interview.start_datetime).split(' ')[0]} {formatDate(interview.start_datetime).split(' ')[1]}</p>
                      <p className="text-gray-600 mt-1">• 👤 Candidat: {candidate?.first_name || candidate?.name} {candidate?.last_name || ''}</p>
                      <p className="text-gray-600">• 💼 Poste: {interview.candidature?.post?.title || interview.application?.post?.title}</p>
                      <p className="text-gray-600">• 📍 Lieu: {location}</p>
                      {interview.meeting_link && (
                        <p className="text-blue-600 text-sm mt-1">
                          🔗 <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="underline hover:text-blue-700">Rejoindre la réunion</a>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleInterviewResponse(interview.id, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition whitespace-nowrap"
                      >
                        ✅ Accepter
                      </button>
                      <button 
                        onClick={() => handleInterviewResponse(interview.id, 'refuse')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition whitespace-nowrap"
                      >
                        ❌ Refuser
                      </button>
                      <Link to={`/interviews/${interview.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition text-center whitespace-nowrap">
                        👁️ Voir détails
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun entretien planifié pour le moment
              </div>
            )}
          </div>
        </div>

        {/* ==================== ENTRETIENS RÉALISÉS (CR À REMPLIR) ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">✅ Entretiens réalisés (comptes rendus)</h2>
          </div>
          <div className="p-4 space-y-3">
            {managerInterviews.filter(i => (i.status || i.statut) === 'realise' || (i.status || i.statut) === 'termine' || (i.status || i.statut) === 'confirme').length > 0 ? (
              managerInterviews.filter(i => (i.status || i.statut) === 'realise' || (i.status || i.statut) === 'termine' || (i.status || i.statut) === 'confirme').map((interview) => {
                const candidate = interview.candidate || interview.candidat;
                const hasReport = interview.report || interview.compte_rendu;
                return (
                  <div key={interview.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">✅ {formatDate(interview.start_datetime).split(' ')[0]}</p>
                      <p className="text-gray-600 text-sm mt-1">Entretien {interview.type_entretien || interview.event_type} • {candidate?.first_name || candidate?.name} {candidate?.last_name || ''}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Link to={`/interviews/${interview.id}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition text-center whitespace-nowrap">
                        {hasReport ? '👁️ Voir CR' : '📝 Remplir le CR'}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun entretien réalisé pour le moment
              </div>
            )}
          </div>
        </div>

        {/* ==================== MON AGENDA ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Événements du jour */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">📅 Agenda du jour</h2>
            </div>
            <div className="p-4 space-y-3">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {event.candidate} • {event.datetime ? event.datetime.split(' ')[1] : 'Horaire non défini'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/events/${event.id}`} className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition text-center">
                      📋 Voir
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun entretien prévu aujourd'hui
                </div>
              )}
            </div>
          </div>

          {/* Événements à venir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">📅 Prochains entretiens</h2>
              <Link to="/events" className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1">
                Voir calendrier <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {event.candidate} • {event.datetime ? event.datetime.split(' ')[0] : 'Date non définie'}
                      </p>
                    </div>
                    <Link to={`/events/${event.id}`} className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition text-center">
                      📋 Voir
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun entretien à venir
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== PERFORMANCES ==================== */}
        {performanceData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Mes performances</h2> 
            <div className="w-full h-64 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      color: '#1f2937'
                    }} 
                  />
                  <Bar dataKey="evaluated" name="Candidatures évaluées" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="Recommandations acceptées" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>

      {/* ==================== MODALE D'ÉVALUATION (version simplifiée) ==================== */}
      {showEvaluationModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEvaluationModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Évaluation - {selectedCandidate.name}
              </h2>
              <button onClick={() => setShowEvaluationModal(false)} className="text-gray-400 hover:text-gray-600 transition text-xl">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Informations candidat */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800">{selectedCandidate.name}</p>
                <p className="text-gray-500 text-sm">{selectedCandidate.position}</p>
                <p className="text-gray-500 text-sm">Statut: {selectedCandidate.status}</p>
              </div>

              {/* Grille d'évaluation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Compétences techniques</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEvaluationForm({...evaluationForm, technical: star})}
                        className={`text-2xl transition ${star <= evaluationForm.technical ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Communication</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEvaluationForm({...evaluationForm, communication: star})}
                        className={`text-2xl transition ${star <= evaluationForm.communication ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Motivation</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEvaluationForm({...evaluationForm, motivation: star})}
                        className={`text-2xl transition ${star <= evaluationForm.motivation ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Adéquation culturelle</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEvaluationForm({...evaluationForm, culture: star})}
                        className={`text-2xl transition ${star <= evaluationForm.culture ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Points forts</label>
                <textarea
                  value={evaluationForm.strengths}
                  onChange={(e) => setEvaluationForm({...evaluationForm, strengths: e.target.value})}
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="• Très bonne maîtrise technique&#10;• Capacité à travailler en équipe"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Points d'amélioration</label>
                <textarea
                  value={evaluationForm.weaknesses}
                  onChange={(e) => setEvaluationForm({...evaluationForm, weaknesses: e.target.value})}
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="• DevOps à approfondir&#10;• Anglais technique à renforcer"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Recommandation</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommendation"
                      value="favorable"
                      checked={evaluationForm.recommendation === 'favorable'}
                      onChange={() => setEvaluationForm({...evaluationForm, recommendation: 'favorable'})}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-green-600">✅ Favorable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommendation"
                      value="reserve"
                      checked={evaluationForm.recommendation === 'reserve'}
                      onChange={() => setEvaluationForm({...evaluationForm, recommendation: 'reserve'})}
                      className="w-4 h-4 text-yellow-600"
                    />
                    <span className="text-yellow-600">⚠️ Réservé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommendation"
                      value="defavorable"
                      checked={evaluationForm.recommendation === 'defavorable'}
                      onChange={() => setEvaluationForm({...evaluationForm, recommendation: 'defavorable'})}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-red-600">❌ Défavorable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Commentaire</label>
                <textarea
                  value={evaluationForm.comment}
                  onChange={(e) => setEvaluationForm({...evaluationForm, comment: e.target.value})}
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Commentaire sur le candidat..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  disabled={evaluationLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {evaluationLoading ? <><Loader className="w-4 h-4 animate-spin" /> Envoi...</> : 'Enregistrer mon avis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ConsultantDashboard;
