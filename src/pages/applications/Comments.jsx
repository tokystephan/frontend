import { useState } from 'react'
import { formatDateTime } from '../../utils/dateFormats'

const Comments = ({ comments = [], onAddComment }) => {
  const [content, setContent] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onAddComment(trimmed)
    setContent('')
  }

  return (
    <div className="space-y-3">
      {comments.length ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-[#6366f1]/35 bg-[#1e293b] p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-[#64748b]">
                <span className="font-semibold text-[#f1f5f9]">{comment.author}</span>
                <span>{formatDateTime(comment.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-[#cbd5e1]">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748b]">Aucun commentaire.</p>
      )}

      {onAddComment && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder="Ajouter un commentaire interne"
          className="w-full rounded-lg border border-[#6366f1]/35 bg-[#1e293b] px-3 py-2 text-sm text-[#f1f5f9] outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 placeholder-[#64748b]"
        />
        <button type="submit" className="rounded-lg bg-[#6366f1] px-3 py-2 text-xs font-semibold text-white hover:bg-[#6366f1]/80 transition">
          Ajouter commentaire
        </button>
      </form>
      )}
    </div>
  )
}

export default Comments
