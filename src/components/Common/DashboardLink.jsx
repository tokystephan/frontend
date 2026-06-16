import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

const DashboardLink = ({ className = '', children = 'Dashboard' }) => {
  return (
    <Link
      to="/dashboard"
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <LayoutDashboard className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  )
}

export default DashboardLink
