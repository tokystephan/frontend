const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  disabled = false,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--app-text)]">
        {label}
        {required && <span className="text-[var(--app-danger)]">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-[var(--app-danger)]/60 focus:border-[var(--app-danger)] focus:ring-[var(--app-danger)]/20'
            : 'border-[var(--app-border)] focus:border-[var(--app-primary)] focus:ring-[var(--app-primary)]/20 hover:border-[var(--app-primary-hover)]'
        } ${disabled ? 'cursor-not-allowed bg-[var(--app-bg-soft)]' : 'bg-[var(--app-surface)]'}`}
      />
      {error && <p className="text-xs text-[var(--app-danger)]">{error}</p>}
    </div>
  )
}

export default InputField