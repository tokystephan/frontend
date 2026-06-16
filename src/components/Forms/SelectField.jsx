const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner',
  error,
  required = false,
}) => {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
          error
            ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

export default SelectField
