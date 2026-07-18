import { APPLICATION_STATUS_LABELS, POST_STATUS_LABELS } from '../../utils/constants'

const palette = {
  recue: 'bg-blue-100 text-blue-800 font-semibold border border-blue-300',
  en_cours: 'bg-amber-100 text-amber-900 font-semibold border border-amber-300',
  entretien_rh: 'bg-cyan-100 text-cyan-900 font-semibold border border-cyan-300',
  entretien_technique: 'bg-indigo-100 text-indigo-900 font-semibold border border-indigo-300',
  acceptee: 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300',
  refusee: 'bg-red-100 text-red-900 font-semibold border border-red-300',
  ouvert: 'bg-green-100 text-green-900 font-semibold border border-green-300',
  ferme: 'bg-slate-500 text-white font-semibold border border-slate-600',
  archive: 'bg-gray-400 text-white font-semibold border border-gray-500',
}

const StatusBadge = ({ value }) => {
  if (!value) return <span className="text-[#64748b]">-</span>

  const label = APPLICATION_STATUS_LABELS[value] || POST_STATUS_LABELS[value] || value
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette[value] || 'bg-[#475569]/20 text-[#cbd5e1]'}`}>
      {label}
    </span>
  )
}

export default StatusBadge
