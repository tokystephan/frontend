// src/pages/notifications/NotificationsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Bell, 
  CheckCircle2, 
  RefreshCcw, 
  Trash2, 
  Check,
  Clock,
  Filter,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchNotifications, 
  markAllAsReadThunk, 
  markAsReadThunk,
  deleteNotificationThunk
} from '../../store/slices/notificationSlice';

// Formatage de la date et heure
const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatage relatif (aujourd'hui, hier, etc.)
const formatRelativeDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
};

// Obtenir le canal en fonction du type
const getNotificationChannel = (type) => {
  const channels = {
    nouvelle_candidature: '🔔 + 📧',
    changement_statut: '🔔',
    entretien_planifie: '🔔 + 📧',
    rappel_entretien: '📧 + 🔔',
    offre_validation: '🔔 + 📧',
    nouveau_commentaire: '🔔',
    compte_rendu: '🔔',
    candidat_shortliste: '🔔',
    system_alert: '🔔 + 📧',
    nouvel_utilisateur: '🔔',
    poste_validation: '🔔',
    decision_direction: '🔔',
    daily_report: '📧',
    weekly_report: '📧',
    monthly_report: '📧',
    recruitment_blocked: '🔔',
  };
  return channels[type] || '🔔';
};

// Obtenir le titre en fonction du type
const getNotificationTitle = (type) => {
  const titles = {
    nouvelle_candidature: '📄 Nouvelle candidature',
    changement_statut: '📊 Changement de statut',
    entretien_planifie: '📅 Entretien planifié',
    rappel_entretien: '⏰ Rappel entretien',
    offre_validation: '✅ Offre à valider',
    nouveau_commentaire: '💬 Nouveau commentaire',
    compte_rendu: '📝 Compte rendu ajouté',
    candidat_shortliste: '⭐ Candidat shortlisté',
    system_alert: '⚠️ Alerte système',
    nouvel_utilisateur: '👤 Nouvel utilisateur',
    poste_validation: '📋 Poste à valider',
    decision_direction: '🏆 Décision Direction',
    daily_report: '📊 Rapport quotidien',
    weekly_report: '📊 Rapport hebdomadaire',
    monthly_report: '📈 Rapport mensuel',
    recruitment_blocked: '⚠️ Alerte recrutement',
  };
  return titles[type] || '🔔 Notification';
};

// Obtenir l'icône en fonction du type
const getNotificationIcon = (type) => {
  const icons = {
    nouvelle_candidature: '📄',
    changement_statut: '📊',
    entretien_planifie: '📅',
    rappel_entretien: '⏰',
    offre_validation: '✅',
    nouveau_commentaire: '💬',
    compte_rendu: '📝',
    candidat_shortliste: '⭐',
    system_alert: '⚠️',
    nouvel_utilisateur: '👤',
    poste_validation: '📋',
    decision_direction: '🏆',
    daily_report: '📊',
    weekly_report: '📊',
    monthly_report: '📈',
    recruitment_blocked: '⚠️',
  };
  return icons[type] || '🔔';
};

const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const { 
    items: notifications = [], 
    unreadCount = 0, 
    loading = false, 
    error = null 
  } = useAppSelector((state) => state.notifications);
  
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Erreur de chargement');
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchNotifications());
    toast.success('Notifications rafraîchies');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsReadThunk()).unwrap();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch {
      toast.error('Impossible de marquer toutes les notifications comme lues');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsReadThunk(id)).unwrap();
      toast.success('Notification marquée comme lue');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette notification ?')) {
      try {
        await dispatch(deleteNotificationThunk(id)).unwrap();
        toast.success('Notification supprimée');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  // Grouper les notifications par date
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const dateKey = formatRelativeDate(notif.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notif);
    return groups;
  }, {});

  const filterOptions = [
    { value: 'all', label: 'Toutes', count: notifications.length },
    { value: 'unread', label: 'Non lues', count: unreadCount },
    { value: 'read', label: 'Lues', count: notifications.length - unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Bell className="w-4 h-4" />
                <span>Centre de notifications</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Historique des notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultez toutes vos notifications et leur historique complet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-start sm:justify-end">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                Filtrer
              </button>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || loading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> 
                Tout marquer lu
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCcw className="w-4 h-4" /> 
                Rafraîchir
              </button>
              <Link
                to="/dashboard"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowRight className="w-4 h-4" /> 
                Retour dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* ==================== FILTRES ==================== */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label} ({opt.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================== RÉSUMÉ ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            <div className="min-w-[120px]">
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="min-w-[120px]">
              <span className="text-sm text-gray-500">Non lues</span>
              <p className="text-xl font-bold text-blue-600">{unreadCount}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="min-w-[120px]">
              <span className="text-sm text-gray-500">Lues</span>
              <p className="text-xl font-bold text-gray-600">{notifications.length - unreadCount}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>

        {/* ==================== LISTE DES NOTIFICATIONS ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <p className="mt-3 text-gray-500">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Aucune notification trouvée</p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  Voir toutes les notifications
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
                <div key={dateKey}>
                  <div className="bg-gray-50 px-6 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {dateKey}
                      </span>
                    </div>
                  </div>
                  {dateNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-5 transition ${
                        !notification.is_read ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {/* Icône */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-semibold ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {getNotificationTitle(notification.type)}
                            </h3>
                            <span className="text-xs text-gray-400">
                              {getNotificationChannel(notification.type)}
                            </span>
                            {!notification.is_read && (
                              <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message || 'Aucun message'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDateTime(notification.created_at)}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Lien d'action */}
                      {notification.link && (
                        <div className="mt-2 sm:ml-14 ml-0">
                          <Link
                            to={notification.link}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            onClick={() => {
                              if (!notification.is_read) handleMarkAsRead(notification.id);
                            }}
                          >
                            Voir les détails <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== PIED DE PAGE ==================== */}
        <div className="text-center text-xs text-gray-400 pt-4">
          © 2026 Akanjo - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
