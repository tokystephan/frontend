import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/Common/StatusBadge'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import usePermissions from '../../hooks/usePermissions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  addNewComment,
  fetchApplicationById,
  updateStatus,
} from '../../store/slices/applicationSlice'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from '../../utils/constants'
import Comments from './Comments'
import StatusHistory from './StatusHistory'
import { 
  ArrowLeft, 
  Edit2, 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  Home,
  User,
  Briefcase,
  Building2,
  FileText,
  Calendar
} from 'lucide-react'

const formatEntityLabel = (entity, fallback = '-') => {
  if (entity == null) return fallback
  if (typeof entity === 'string' || typeof entity === 'number') return String(entity)
  if (typeof entity === 'object') {
    return (
      entity.title ||
      entity.name ||
      `${entity.first_name || ''} ${entity.last_name || ''}`.trim() ||
      entity.description ||
      entity.email ||
      entity.label ||
      fallback
    )
  }
  return fallback
}

const ApplicationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { roleName, canManageApplications, canChangeFinalStatus } = usePermissions()

  const { currentApplication, loading, error } = useAppSelector((state) => state.applications)
  const user = useAppSelector((state) => state.auth.user)

  const getCandidateName = () => {
    if (currentApplication?.candidate) {
      return formatEntityLabel(currentApplication.candidate, `Candidat #${currentApplication.candidate_id || ''}`)
    }
    return currentApplication?.candidate_id ? `Candidat #${currentApplication.candidate_id}` : '-'
  }

  const getPostTitle = () => {
    if (currentApplication?.post) {
      return formatEntityLabel(currentApplication.post, `#${currentApplication.post_id || ''}`)
    }
    return currentApplication?.post_id ? `#${currentApplication.post_id}` : '-'
  }

  const getDepartmentName = () => {
    const department = currentApplication?.post?.department || currentApplication?.department
    return formatEntityLabel(department, '-')
  }

  const getContractType = () => {
    return formatEntityLabel(currentApplication?.post?.contract_type || currentApplication?.post?.contractType, '-')
  }

  const getAssignedTo = () => {
    if (currentApplication?.assigned_to) {
      return formatEntityLabel(currentApplication.assigned_to, currentApplication?.created_by || '-')
    }
    return currentApplication?.created_by || '-'
  }

  const [statusDraft, setStatusDraft] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchApplicationById(id))
    }
  }, [dispatch, id])

  const canUpdateStatus = roleName !== 'consultant' && (canManageApplications || canChangeFinalStatus)
  const selectedStatus = statusDraft || currentApplication?.status || ''

  const statusOptions = useMemo(
    () =>
      APPLICATION_STATUSES.map((item) => ({
        value: item,
        label: APPLICATION_STATUS_LABELS[item] || item,
      })),
    [],
  )

  const handleStatusUpdate = async (event) => {
    event.preventDefault()
    
    if (!selectedStatus) {
      toast.error('Veuillez sélectionner un statut')
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(
        updateStatus({
          id,
          statusData: {
            status: selectedStatus,
            note: note.trim() || null,
            changed_by: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Utilisateur',
          },
        }),
      ).unwrap()

      toast.success('Statut mis à jour avec succès')
      setNote('')
      setStatusDraft('')
    } catch (statusError) {
      console.error('Erreur statut:', statusError)
      toast.error(
        typeof statusError === 'string' 
          ? statusError 
          : statusError?.message || 'Erreur lors de la mise à jour du statut'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddComment = async (content) => {
    if (!content?.trim()) {
      toast.error('Le commentaire ne peut pas être vide')
      return
    }

    try {
      await dispatch(
        addNewComment({
          applicationId: id,
          commentData: {
            content: content.trim(),
            author: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Utilisateur',
          },
        }),
      ).unwrap()
      toast.success('Commentaire ajouté avec succès')
    } catch (commentError) {
      console.error('Erreur commentaire:', commentError)
      toast.error(
        typeof commentError === 'string' 
          ? commentError 
          : commentError?.message || 'Erreur lors de l\'ajout du commentaire'
      )
    }
  }

  if (loading && !currentApplication) {
    return <LoadingSpinner />
  }

  if (error && !currentApplication) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          ❌ {typeof error === 'string' ? error : 'Impossible de charger la candidature'}
        </p>
      </div>
    )
  }

  if (!currentApplication) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-600">⚠️ Candidature introuvable.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* ========== BOUTONS NAVIGATION ========== */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux candidatures
          </button>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* ========== EN-TÊTE CANDIDATURE ========== */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <User className="w-4 h-4" />
                <span>Candidat</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getCandidateName()}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{getPostTitle()}</span>
              </div>
            </div>
            <div>
              <StatusBadge value={currentApplication.status} />
            </div>
          </div>
        </div>

        {/* ========== CARTES INFORMATIONS ========== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
              <Building2 className="w-3 h-3" />
              <span>Département</span>
            </div>
            <p className="text-gray-800 font-medium">{getDepartmentName()}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
              <FileText className="w-3 h-3" />
              <span>Type de contrat</span>
            </div>
            <p className="text-gray-800 font-medium">{getContractType()}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
              <Calendar className="w-3 h-3" />
              <span>Date de création</span>
            </div>
            <p className="text-gray-800 font-medium">
              {new Date(currentApplication.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
              <User className="w-3 h-3" />
              <span>Assigné à</span>
            </div>
            <p className="text-gray-800 font-medium">{getAssignedTo()}</p>
          </div>
        </div>

        {/* ========== MISE À JOUR STATUT ========== */}
        {canUpdateStatus && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-800">Mettre à jour le statut</h3>
              </div>
            </div>
            
            <form onSubmit={handleStatusUpdate} className="p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={selectedStatus}
                  onChange={(event) => setStatusDraft(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:outline-none transition"
                >
                  <option value="">-- Sélectionner un statut --</option>
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mise à jour...' : 'Confirmer le changement'}
                </button>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isSubmitting}
                rows={2}
                placeholder="Note interne sur ce changement (optionnel)"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:outline-none transition placeholder:text-gray-400"
              />
            </form>
          </div>
        )}

        {/* ========== HISTORIQUE + COMMENTAIRES ========== */}
        <div className="grid gap-5 lg:grid-cols-2">
          
          {/* Historique des statuts */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-800">Historique des statuts</h3>
              </div>
            </div>
            <div className="p-5">
              {currentApplication.statusHistory && currentApplication.statusHistory.length > 0 ? (
                <StatusHistory history={currentApplication.statusHistory} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Aucun historique disponible</p>
              )}
            </div>
          </div>

          {/* Commentaires internes */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-800">Commentaires internes</h3>
              </div>
            </div>
            <div className="p-5">
              <Comments 
                comments={currentApplication.comments || []} 
                onAddComment={handleAddComment}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* ========== BOUTON MODIFIER ========== */}
        {canManageApplications && roleName !== 'consultant' && (
          <div className="flex justify-center pt-2">
            <Link 
              to={`/applications/${currentApplication.id}/edit`} 
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              Modifier la candidature
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationDetail