const TableActions = ({ onView, onEdit, onArchive, readOnly = false }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onView}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Voir
      </button>
      {!readOnly ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Éditer
        </button>
      ) : null}
      {onArchive && !readOnly ? (
        <button
          type="button"
          onClick={onArchive}
          className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Archiver
        </button>
      ) : null}
    </div>
  )
}

export default TableActions
