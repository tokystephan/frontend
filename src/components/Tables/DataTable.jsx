import LoadingSpinner from '../Common/LoadingSpinner'

const DataTable = ({ columns, rows, rowKey = 'id', loading = false, emptyLabel = 'Aucune donnée.', renderMobileRow }) => {
  if (loading) {
    return <LoadingSpinner />
  }

  if (!rows.length) {
    return <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-4">
      {renderMobileRow && (
        <div className="md:hidden space-y-4">
          {rows.map((row) => (
            <div key={row[rowKey]} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {renderMobileRow(row)}
            </div>
          ))}
        </div>
      )}

      <div className={`${renderMobileRow ? 'hidden md:block' : ''} overflow-x-auto rounded-lg border border-slate-200 bg-white`}>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]} className="border-t border-slate-100 hover:bg-slate-50/60">
                {columns.map((column) => (
                  <td key={`${row[rowKey]}-${column.key}`} className="px-4 py-3 text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
