import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications, 
  fetchUnreadCount,
  markAllAsReadThunk, 
  markAsReadThunk, 
  deleteNotificationThunk 
} from '../../store/slices/notificationSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { Bell, User, LogOut, ChevronDown, Menu, X, Trash2 } from 'lucide-react';
import Avatar from '../Common/Avatar';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // ✅ CORRECTION : Accès sécurisé aux propriétés avec valeurs par défaut
  const notificationState = useSelector((state) => state.notifications);
  const notifications = notificationState?.items ?? [];
  const unreadCount = notificationState?.unreadCount ?? 0;
  const loading = notificationState?.loading ?? false;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Chargement initial + polling toutes les 30 secondes
  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Déconnexion réussie');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la déconnexion');
      navigate('/login', { replace: true });
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsReadThunk()).unwrap();
      toast.success('Toutes les notifications marquées comme lues');
      dispatch(fetchNotifications());
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRefreshNotifications = async () => {
    try {
      await dispatch(fetchNotifications()).unwrap();
      dispatch(fetchUnreadCount());
      toast.success('Notifications actualisées');
    } catch {
      toast.error('Erreur lors de l’actualisation');
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await dispatch(markAsReadThunk(id)).unwrap();
        dispatch(fetchNotifications());
      } catch {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (id) => {
    try {
      await dispatch(deleteNotificationThunk(id)).unwrap();
      toast.success('Notification supprimée');
      dispatch(fetchNotifications());
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getFullName = () => {
    if (!user) return 'Utilisateur';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur';
  };

  const getRoleDisplay = () => {
    const roles = { 
      admin: 'Responsable RH', 
      assistant: 'Assistant RH', 
      direction: 'Direction', 
      manager: 'Manager' 
    };
    return roles[user?.role] || 'Utilisateur';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationTitle = (notif) => {
    const titles = {
      nouvelle_candidature: 'Nouvelle candidature',
      changement_statut: 'Changement de statut',
      entretien_planifie: 'Entretien planifié',
      rappel_entretien: 'Rappel entretien',
      offre_validation: 'Offre à valider',
      nouveau_commentaire: 'Nouveau commentaire',
      compte_rendu: 'Compte rendu ajouté',
      candidat_shortliste: 'Candidat shortlisté',
      system_alert: 'Alerte système',
      nouvel_utilisateur: 'Nouvel utilisateur',
      poste_validation: 'Poste à valider',
      decision_direction: 'Décision Direction',
      daily_report: 'Rapport quotidien',
      weekly_report: 'Rapport hebdomadaire',
      monthly_report: 'Rapport mensuel',
      recruitment_blocked: 'Alerte recrutement',
    };

    return notif.title || titles[notif.type] || 'Notification';
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-full items-center justify-between px-3 sm:px-4">
        
        {/* Logo et menu mobile */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-[var(--app-text-soft)] transition hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)] md:hidden"
              title="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/dashboard" className="flex items-center gap-1 group shrink-0">
            <img 
              src="/akanjo.jpg" 
              alt="Akanjo Logo" 
              className="h-15 object-contain transition-transform duration-200 group-hover:scale-105" 
              title="Accueil"
            />
          </Link>
        </div>

        {/* Actions droites */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* NOTIFICATIONS */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="group relative rounded-lg p-2 text-[var(--app-text-soft)] transition hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)]"
              title="Notifications"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--app-danger)] text-xs font-bold text-white shadow-sm ring-2 ring-[var(--app-surface)] animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Panneau des notifications */}
            {showNotifications && (
              <div className="fixed inset-x-2 top-16 z-[60] flex max-h-[min(78vh,36rem)] w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl shadow-black/10 backdrop-blur-md sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(24rem,calc(100vw-1rem))] sm:max-h-[min(80vh,36rem)] sm:rounded-xl">
                <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-3 sm:px-4">
                  <h3 className="flex items-center gap-2 font-semibold text-[var(--app-text)]">
                    <Bell className="w-4 h-4 text-[var(--app-text-soft)]" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[var(--app-bg-soft)] px-2 py-0.5 text-xs text-[var(--app-text-soft)]">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshNotifications}
                      className="text-xs font-medium text-[var(--app-text-soft)] transition hover:text-[var(--app-text)]"
                    >
                      Actualiser
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-[var(--app-text-soft)] transition hover:text-[var(--app-text)]"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {loading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="inline-block animate-spin">
                        <Bell className="w-5 h-5 text-[var(--app-text-soft)]" />
                      </div>
                      <p className="mt-2 text-sm text-[var(--app-text-soft)]">Chargement...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[var(--app-text-soft)]">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`group border-b border-[var(--app-border)]/60 px-3 py-3 transition touch-manipulation sm:px-4 ${
                          !notif.is_read 
                            ? 'bg-[var(--app-success)]/10 hover:bg-[var(--app-success)]/20' 
                            : 'hover:bg-[var(--app-bg-soft)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div 
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => {
                              if (!notif.is_read) handleMarkAsRead(notif.id, notif.is_read);
                              if (notif.link) window.location.href = notif.link;
                            }}
                          >
                            <p className="line-clamp-2 break-words text-sm font-medium text-[var(--app-text)]">
                              {getNotificationTitle(notif)}
                            </p>
                            <p className="mt-1 break-words text-xs text-[var(--app-text-soft)]">
                              {notif.message || 'Aucun message'}
                            </p>
                            <p className="mt-1 text-xs text-[var(--app-text-soft)] opacity-70">
                              {formatTime(notif.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            {!notif.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--app-text-soft)] transition hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)]"
                                title="Marquer comme lu"
                              >
                                <div className="h-2.5 w-2.5 rounded-full bg-[var(--app-text-soft)]" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--app-text-soft)] transition hover:bg-[var(--app-danger)]/10 hover:text-[var(--app-danger)]"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-[var(--app-border)]/70 bg-[var(--app-bg-soft)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--app-text-soft)] transition hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)] disabled:text-[var(--app-border)] sm:w-auto sm:px-0 sm:py-0 sm:text-left"
                    >
                      Tout marquer comme lu
                    </button>
                    <Link
                      to="/notifications"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)] sm:w-auto"
                      onClick={() => setShowNotifications(false)}
                    >
                      Voir tout
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MENU UTILISATEUR */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="group flex items-center gap-2 rounded-lg p-1 transition hover:bg-[var(--app-bg-soft)]"
              title="Menu utilisateur"
            >
              <Avatar user={user} size="md" />
              <div className="hidden md:block text-left">
                <p className="leading-none text-sm font-medium text-[var(--app-text)]">
                  {getFullName()}
                </p>
                <p className="mt-0.5 text-xs text-[var(--app-text-soft)]">
                  {getRoleDisplay()}
                </p>
              </div>
              <ChevronDown
                className={`hidden w-4 h-4 text-[var(--app-text-soft)] transition-transform duration-200 md:block ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] shadow-xl backdrop-blur-md">
                <div className="border-b border-[var(--app-border)]/70 bg-[var(--app-bg-soft)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--app-text)]">{getFullName()}</p>
                  <p className="truncate text-xs text-[var(--app-text-soft)]">{user?.email}</p>
                  <div className="mt-2 inline-block rounded-full bg-[var(--app-bg-soft)] px-2 py-1 text-xs text-[var(--app-text-soft)]">
                    {getRoleDisplay()}
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 border-b border-[var(--app-border)]/90 px-4 py-2 text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft)]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--app-danger)] transition hover:bg-[var(--app-danger)]/10"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
