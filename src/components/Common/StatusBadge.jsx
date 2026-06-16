import { APPLICATION_STATUS_LABELS, POST_STATUS_LABELS } from '../../utils/constants'

const palette = {
  recue: 'bg-[#0369a1]/20 text-[#38bdf8]',
  en_cours: 'bg-[#b45309]/20 text-[#fbbf24]',
  entretien_rh: 'bg-[#1e40af]/20 text-[#60a5fa]',
  entretien_technique: 'bg-[#1e40af]/20 text-[#60a5fa]',
  acceptee: 'bg-[#15803d]/20 text-[#86efac]',
  refusee: 'bg-[#be123c]/20 text-[#fb7185]',
  ouvert: 'bg-[#15803d]/20 text-[#86efac]',
  ferme: 'bg-[#475569]/20 text-[#cbd5e1]',
  archive: 'bg-[#64748b]/20 text-[#94a3b8]',
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
