import { useRef, useState } from 'react'

const FileUpload = ({ label = 'Documents', onFilesSelected }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const emitFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const names = files.map((file) => file.name)
    onFilesSelected(names)
  }

  const handleChange = (event) => {
    emitFiles(event.target.files)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    emitFiles(event.dataTransfer?.files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">{label}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={`cursor-pointer rounded-2xl border border-dashed px-4 py-6 text-center transition ${
          dragging
            ? 'border-sky-500 bg-sky-50 shadow-[0_10px_30px_-14px_rgba(14,165,233,0.75)]'
            : 'border-slate-300 bg-white/90 hover:border-sky-400 hover:bg-sky-50/50'
        }`}
      >
        <p className="text-sm font-semibold text-slate-800">Glisser-déposer les fichiers ici</p>
        <p className="mt-1 text-xs text-slate-500">ou cliquer pour sélectionner (CV, LM, pièces jointes)</p>
      </div>

      <input ref={inputRef} type="file" multiple onChange={handleChange} className="hidden" />

      <p className="text-xs text-slate-500">
        Les noms des fichiers sont enregistrés pour l&apos;instant (prêt pour upload API complet).
      </p>
    </div>
  )
}

export default FileUpload
