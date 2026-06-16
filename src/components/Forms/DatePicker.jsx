const DatePicker = ({ label, name, value, onChange, error }) => {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
          error
            ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        }`}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

export default DatePicker
