// src/pages/statistics/SourceStats.jsx
import { useState, useEffect } from 'react';
import { getSourceStats } from '../../services/statisticsService';
import { SOURCE_LABELS } from '../../utils/constants';
import { Building2, Users, TrendingUp, BarChart3 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const SourceStats = ({ byDepartment = {} }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const result = await getSourceStats();
        setSources(result || []);
      } catch (error) {
        console.error('Erreur chargement stats sources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  const getSourceIcon = (name) => {
    const sourceName = name?.toLowerCase() || '';
    if (sourceName.includes('linkedin')) return '🔗';
    if (sourceName.includes('email')) return '📧';
    if (sourceName.includes('coopt') || sourceName.includes('parrain')) return '🤝';
    if (sourceName.includes('site') || sourceName.includes('career')) return '🌐';
    if (sourceName.includes('indeed')) return '📋';
    return '📌';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-500">Chargement des statistiques...</p>
      </div>
    );
  }

  const totalSources = sources.reduce((acc, s) => acc + s.count, 0);
  const totalDepartments = Object.values(byDepartment).reduce((acc, val) => acc + val, 0);
  const departmentCount = Object.keys(byDepartment).length;

  return (
    <div className="space-y-6">
      
      {/* ==================== CARTES RÉCAPITULATIVES ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sources actives" value={sources.length} icon={TrendingUp} color="blue" />
        <StatCard title="Total candidatures" value={totalSources} icon={Users} color="green" />
        <StatCard title="Départements" value={departmentCount} icon={Building2} color="purple" />
        <StatCard title="Taux moyen" value={`${totalDepartments > 0 ? Math.round((totalSources / totalDepartments)) : 0}%`} icon={BarChart3} color="orange" />
      </div>

      {/* ==================== ANALYSE DES SOURCES ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Analyse des canaux de recrutement
          </h3>
        </div>
        
        <div className="p-6">
         
          {/* Section Départements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              Par département
            </h4>
            {Object.keys(byDepartment).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Aucun département disponible</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byDepartment).map(([dept, count], index) => {
                  const percentage = totalDepartments > 0 ? Math.round((count / totalDepartments) * 100) : 0;
                  const maxCount = Math.max(...Object.values(byDepartment), 1);
                  const barWidth = (count / maxCount) * 100;
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{dept}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-green-600">{count}</span>
                          <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== NOTE DE RECOMMANDATION ==================== */}
      <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Bon à savoir</h4>
        <p className="text-sm text-gray-600">
          Les sources les plus performantes sont celles qui génèrent le plus de candidatures 
          et le meilleur taux de conversion. Analysez régulièrement ces données pour optimiser 
          votre stratégie de recrutement.
        </p>
      </div>
    </div>
  );
};

export default SourceStats;