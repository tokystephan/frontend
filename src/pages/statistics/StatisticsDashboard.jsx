// src/pages/statistics/StatisticsDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Clock, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getStatistics } from '../../services/statisticsService';
import RecruitmentStats from './RecruitmentStats';
import SourceStats from './SourceStats';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3" />
              <span>{Math.abs(trend)}% vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const StatisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    byStatus: [],
    byDepartment: {},
  });

  useEffect(() => {
    const run = async () => {
      try {
        const result = await getStatistics();
        setStats({
          totalApplications: result.totalApplications || 0,
          pending: result.pending || 0,
          byStatus: result.byStatus || [],
          byDepartment: result.byDepartment || {},
        });
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Tableau de bord RH</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Statistiques RH</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analysez vos performances recrutement en temps réel.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              <Home className="w-4 h-4" />
              Retour au Dashboard
            </Link>
          </div>
        </div>

        {/* ==================== CARTES STATISTIQUES ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total candidatures"
            value={stats.totalApplications}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="En attente"
            value={stats.pending}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Entretiens planifiés"
            value="0"
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Taux de conversion"
            value="0%"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* ==================== STATISTIQUES DÉTAILLÉES ==================== */}
        <div className="space-y-6">
          <RecruitmentStats byStatus={stats.byStatus} />
          <SourceStats byDepartment={stats.byDepartment} />
        </div>

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;