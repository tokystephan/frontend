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
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-(--app-text)">
          {label}
          {required && <span className="ml-1 text-(--app-danger)">*</span>}
        </span>
      ) : null}

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-2xl border px-4 py-3 text-sm text-(--app-text) outline-none transition shadow-sm ${
          error
            ? 'border-(--app-danger)/70 bg-(--app-bg) focus:border-(--app-danger) focus:ring-2 focus:ring-(--app-danger)/20'
            : 'border-(--app-border) bg-(--app-surface) focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/20'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-(--app-danger)">{error}</span> : null}
    </label>
  )
}

export default SelectField
