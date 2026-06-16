const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onPageChange(value)}
          className={`rounded-md px-3 py-1 text-sm ${
            value === page
              ? 'bg-blue-600 font-semibold text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  )
}

export default Pagination
