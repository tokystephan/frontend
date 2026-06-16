const SearchBar = ({ value, onChange, placeholder = 'Rechercher...' }) => {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    />
  )
}

export default SearchBar
