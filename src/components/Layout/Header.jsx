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
import { Bell, User, LogOut, ChevronDown, Menu, X, Trash2, Search, BriefcaseBusiness, Users, FileText, Loader2 } from 'lucide-react';
import Avatar from '../Common/Avatar';
import toast from 'react-hot-toast';
import api from '../../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const knownNotificationIdsRef = useRef(new Set());

  // Chaque session recharge ses propres notifications. Les IDs sont comparés pour
  // signaler immédiatement l'arrivée d'une nouvelle notification sans dupliquer les toasts initiaux.
  useEffect(() => {
    const refreshNotifications = async (announceNew = false) => {
      const action = await dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());

      if (fetchNotifications.fulfilled.match(action)) {
        const received = action.payload?.data || [];
        const ids = new Set(received.map((notification) => String(notification.id)));
        if (announceNew && knownNotificationIdsRef.current.size > 0) {
          const newNotifications = received.filter(
            (notification) => !knownNotificationIdsRef.current.has(String(notification.id))
          );
          newNotifications.slice(0, 3).forEach((notification) => {
            toast(notification.title || notification.message || 'Nouvelle notification');
          });
        }
        knownNotificationIdsRef.current = ids;
      }
    };

    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await api.get('/search', { params: { q: query }, signal: controller.signal });
        setSearchResults(response.data?.data || {});
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') setSearchResults({});
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults(null);
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

  const searchSections = [
    { key: 'posts', label: 'Postes', icon: BriefcaseBusiness, to: (item) => `/posts/${item.id}`, text: (item) => item.title },
    { key: 'candidates', label: 'Candidats', icon: Users, to: (item) => `/candidates/${item.id}`, text: (item) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email },
    { key: 'applications', label: 'Candidatures', icon: FileText, to: (item) => `/applications/${item.id}`, text: (item) => `${item.candidate?.first_name || ''} ${item.candidate?.last_name || ''}`.trim() || `Candidature #${item.id}`, detail: (item) => item.post?.title },
  ];

  const hasSearchResults = searchSections.some(({ key }) => searchResults?.[key]?.length);
  const openSearchResult = (path) => {
    setSearchQuery('');
    setSearchResults(null);
    navigate(path);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-full items-center justify-between px-2 sm:px-4">
        
        {/* Logo et menu mobile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
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
              className="h-13 w-19 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-25"
              title="Accueil"
            />
          </Link>
        </div>

        {/* Recherche globale */}
        <div ref={searchRef} className="relative mx-1 min-w-0 flex-1 sm:mx-4 sm:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-soft)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setSearchResults((current) => current || {})}
            placeholder="Rechercher..."
            aria-label="Recherche globale"
            className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-soft)] py-2 pl-9 pr-9 text-sm text-[var(--app-text)] outline-none transition focus:border-[var(--app-primary)] focus:bg-[var(--app-surface)]"
          />
          {searchLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--app-text-soft)]" />}
          {searchResults && (
            <div className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-[min(70vh,30rem)] overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-2xl">
              {hasSearchResults ? searchSections.map(({ key, label, icon: Icon, to, text, detail }) => (
                searchResults[key]?.length ? (
                  <div key={key} className="py-1">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-soft)]">{label}</p>
                    {searchResults[key].map((item) => (
                      <button key={item.id} type="button" onClick={() => openSearchResult(to(item))} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[var(--app-bg-soft)]">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--app-text-soft)]" />
                        <span className="min-w-0"><span className="block truncate text-sm text-[var(--app-text)]">{text(item)}</span>{detail?.(item) && <span className="block truncate text-xs text-[var(--app-text-soft)]">{detail(item)}</span>}</span>
                      </button>
                    ))}
                  </div>
                ) : null
              )) : <p className="px-3 py-5 text-center text-sm text-[var(--app-text-soft)]">Aucun résultat pour « {searchQuery.trim()} »</p>}
            </div>
          )}
        </div>

        {/* Actions droites */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          
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
