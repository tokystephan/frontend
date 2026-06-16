// src/pages/statistics/RecruitmentStats.jsx
import { APPLICATION_STATUS_LABELS } from '../../utils/constants';
import { PieChart, TrendingUp, Users } from 'lucide-react';

const RecruitmentStats = ({ byStatus = [] }) => {
  // Calcul du total pour les pourcentages
  const total = byStatus.reduce((sum, item) => sum + item.count, 0);

  // Couleurs pour chaque statut (pour les barres)
  const statusColors = {
    'Reçue': 'bg-blue-500',
    'En cours': 'bg-yellow-500',
    'Entretien RH': 'bg-purple-500',
    'Entretien technique': 'bg-indigo-500',
    'Acceptée': 'bg-green-500',
    'Refusée': 'bg-red-500',
  };

  const getStatusColor = (statusName) => {
    return statusColors[statusName] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* En-tête */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          Répartition des candidatures par statut
        </h3>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {byStatus.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Carte récapitulative */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total des candidatures</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Liste des statuts */}
            <div className="space-y-3">
              {byStatus.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const statusName = APPLICATION_STATUS_LABELS[item.status] || item.status;
                const barColor = getStatusColor(statusName);

                return (
                  <div key={item.status} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${barColor}`}></div>
                        <span className="text-sm font-medium text-gray-700">{statusName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                        <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note informative */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
              Les pourcentages sont calculés sur la base du nombre total de candidatures.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentStats;