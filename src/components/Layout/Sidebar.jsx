import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  BarChart3,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  UserCog,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logoutUser } from '../../store/slices/authSlice'
import { setSidebarOpen } from '../../store/slices/uiSlice'
import Avatar from '../Common/Avatar'

const ROLE_ALIASES = {
  'responsable rh': 'admin',
  'assistant rh': 'assistant',
  'directeur rh': 'direction',
  directeur: 'direction',
  consultant: 'manager',
}

const getNormalizedRole = (roleValue) => {
  if (typeof roleValue === 'string') {
    const normalized = roleValue.toLowerCase()
    return ROLE_ALIASES[normalized] || normalized
  }
  if (roleValue && typeof roleValue === 'object' && typeof roleValue.name === 'string') {
    const normalized = roleValue.name.toLowerCase()
    return ROLE_ALIASES[normalized] || normalized
  }
  return 'assistant'
}

const LINKS_BY_ROLE = {
  admin: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/posts', label: 'Postes', icon: Briefcase },
    { to: '/candidates', label: 'Candidats', icon: Users },
    { to: '/applications', label: 'Candidatures', icon: FileText },
    { to: '/interviews', label: 'Entretiens', icon: Calendar },
    { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
    { to: '/admin/users', label: 'Utilisateurs', icon: UserCog },
  ],
  assistant: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/posts', label: 'Postes', icon: Briefcase },
    { to: '/candidates', label: 'Candidats', icon: Users },
    { to: '/applications', label: 'Candidatures', icon: FileText },
    { to: '/interviews', label: 'Entretiens', icon: Calendar },
    { to: '/profile', label: 'Profil', icon: UserCog },
  ],
  manager: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/posts', label: 'Postes', icon: Briefcase },
    { to: '/candidates', label: 'Candidats', icon: Users },
    { to: '/applications', label: 'Candidatures', icon: FileText },
    { to: '/interviews', label: 'Entretiens', icon: Calendar },
    { to: '/profile', label: 'Profil', icon: UserCog },
  ],
  direction: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/posts', label: 'Postes', icon: Briefcase },
    { to: '/applications', label: 'Candidatures', icon: FileText },
    { to: '/interviews', label: 'Entretiens', icon: Calendar },
    { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
    { to: '/profile', label: 'Profil', icon: UserCog },
  ],
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Responsable RH'
    case 'assistant':
      return 'Assistant RH'
    case 'manager':
      return 'Manager'
    case 'direction':
      return 'Direction'
    default:
      return 'Utilisateur'
  }
}

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)
  const [collapsed, setCollapsed] = useState(false)

  const role = getNormalizedRole(user?.role || user?.roleName)
  const links = useMemo(() => LINKS_BY_ROLE[role] || LINKS_BY_ROLE.assistant, [role])

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false))
    }
  }

  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false))
    }
  }, [dispatch, location.pathname])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success('Déconnexion réussie')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const userInitials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase() || '?'

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={`fixed left-0 right-0 bottom-0 top-16 z-40 flex h-[calc(100vh-4rem)] transform flex-col overflow-hidden border-r border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] backdrop-blur-md transition-all duration-300 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:translate-x-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Effet de fond */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(0,0,0,0.04),transparent_40%),radial-gradient(circle_at_86%_85%,rgba(0,0,0,0.03),transparent_45%)]" />
        </div>

        {/* En-tête avec logo */}
        <div className={`relative z-10 flex items-center border-b border-[var(--app-border)] p-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="logo-cube">
                <div className="face-front"></div>
                <div className="face-back"></div>
                <div className="face-left"></div>
                <div className="face-right"></div>
                <div className="face-top"></div>
                <div className="face-bottom"></div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[var(--app-primary)] font-semibold text-sm tracking-tight">
                  Akanjo
                </span>
                <span className="text-[var(--app-primary-hover)] text-[8px] uppercase tracking-widest">
                  RH
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-text)] text-sm font-bold text-white shadow-sm">
              AR
            </div>
          )}
          <button
            type="button"
            className="hidden text-[#64748b] transition hover:text-[#f1f5f9] md:block"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className={`relative z-10 flex items-center border-b border-[var(--app-border)] p-4 ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
          <div className="relative">
            {user ? (
              <Avatar user={user} size="md" className="flex-shrink-0" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary)] text-sm font-bold text-white">
                {userInitials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-success)]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--app-text)]">
                {user?.first_name || ''} {user?.last_name || ''}
              </p>
              <p className="truncate text-xs text-[var(--app-text-soft)]">{getRoleLabel(role)}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : ''}
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-[var(--app-bg-soft)] text-[var(--app-text)] shadow-sm'
                        : 'text-[var(--app-text-soft)] hover:bg-[var(--app-bg-soft)] hover:text-[var(--app-text)]'
                    }`
                  }
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Bouton déconnexion */}
        <div className="relative z-10 border-t border-[var(--app-border)] p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Déconnexion' : ''}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer text-sm font-medium text-[var(--app-text-soft)] transition hover:bg-[var(--app-danger)]/10 hover:text-[var(--app-danger)] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
