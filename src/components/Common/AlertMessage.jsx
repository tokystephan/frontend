import { cn } from '../../utils/helpers'

const variants = {
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

const AlertMessage = ({ type = 'info', message }) => {
  if (!message) return null

  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', variants[type] || variants.info)}>
      {message}
    </div>
  )
}

export default AlertMessage
