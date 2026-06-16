import { formatDateTime } from '../../utils/dateFormats'
import { APPLICATION_STATUS_LABELS } from '../../utils/constants'

const StatusHistory = ({ history = [] }) => {
  if (!history.length) {
    return <p className="text-sm text-[#64748b]">Aucun historique de statut.</p>
  }

  const getStatusValue = (item) => item.new_status || item.status || item.status_label || ''
  const getStatusLabel = (item) => {
    const status = getStatusValue(item)
    return item.status_label || APPLICATION_STATUS_LABELS[status] || status || 'Statut inconnu'
  }
  const getChangedAt = (item) => item.changed_at || item.created_at || item.updated_at

  const ordered = [...history].sort((a, b) => new Date(getChangedAt(b) || 0) - new Date(getChangedAt(a) || 0))

  return (
    <div className="space-y-2">
      {ordered.map((item) => (
        <div key={item.id} className="rounded-lg border border-[#6366f1]/35 bg-[#1e293b] p-3">
          <p className="text-sm font-semibold text-[#f1f5f9]">
            {item.previous_status
              ? `${APPLICATION_STATUS_LABELS[item.previous_status] || item.previous_status} -> ${getStatusLabel(item)}`
              : getStatusLabel(item)}
          </p>
          <p className="mt-1 text-xs text-[#64748b]">
            Par {item.changed_by || 'Utilisateur'} le {formatDateTime(getChangedAt(item))}
          </p>
          {item.note ? <p className="mt-2 text-sm text-[#cbd5e1]">{item.note}</p> : null}
        </div>
      ))}
    </div>
  )
}

export default StatusHistory
