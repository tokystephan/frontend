const LoadingSpinner = ({ label = 'Chargement...' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
        </div>
        <p className="text-slate-600">{label}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner