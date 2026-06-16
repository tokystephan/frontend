import { APPLICATION_STATUSES } from '../../utils/constants'
import { matchesQuery } from '../../utils/helpers'
import { ensureApplicationDefaults, loadDb, nextId, now, saveDb } from './mockStorage'

const enrichApplication = (application, db) => {
  const candidate = db.candidates.find((item) => item.id === application.candidate_id) || null
  const post = db.posts.find((item) => item.id === application.post_id) || null
  return {
    ...application,
    candidate,
    post,
  }
}

export const listApplicationsMock = async (params = {}) => {
  const { search = '', status = '', post_id: postId = '', candidate_id: candidateId = '' } = params
  const db = loadDb()

  let items = db.applications.map((item) => enrichApplication(ensureApplicationDefaults(item), db))

  if (status) {
    items = items.filter((item) => item.status === status)
  }

  if (postId) {
    items = items.filter((item) => item.post_id === Number(postId))
  }

  if (candidateId) {
    items = items.filter((item) => item.candidate_id === Number(candidateId))
  }

  if (search) {
    items = items.filter((item) =>
      matchesQuery(
        search,
        item.candidate?.first_name,
        item.candidate?.last_name,
        item.candidate?.email,
        item.post?.title,
      ),
    )
  }

  return items.sort((a, b) => b.id - a.id)
}

export const getApplicationMock = async (id) => {
  const db = loadDb()
  const item = db.applications.find((application) => application.id === Number(id))
  if (!item) throw new Error('Candidature introuvable')
  return enrichApplication(ensureApplicationDefaults(item), db)
}

export const createApplicationMock = async (payload) => {
  const db = loadDb()

  if (!db.candidates.some((candidate) => candidate.id === Number(payload.candidate_id))) {
    throw new Error('Le candidat sélectionné est introuvable')
  }

  if (!db.posts.some((post) => post.id === Number(payload.post_id))) {
    throw new Error('Le poste sélectionné est introuvable')
  }

  const exists = db.applications.some(
    (application) =>
      application.candidate_id === Number(payload.candidate_id) &&
      application.post_id === Number(payload.post_id) &&
      application.status !== 'refusee',
  )

  if (exists) {
    throw new Error('Une candidature existe déjà pour ce candidat et ce poste')
  }

  const status = APPLICATION_STATUSES.includes(payload.status) ? payload.status : 'recue'

  const item = {
    id: nextId(db.applications),
    candidate_id: Number(payload.candidate_id),
    post_id: Number(payload.post_id),
    status,
    assigned_to: payload.assigned_to || '',
    comments: [],
    history: [
      {
        id: 1,
        previous_status: null,
        new_status: status,
        changed_by: payload.changed_by || 'Système',
        note: payload.note || 'Création de candidature',
        changed_at: now(),
      },
    ],
    created_at: now(),
    updated_at: now(),
  }

  db.applications.push(item)
  saveDb(db)
  return enrichApplication(item, db)
}

export const updateApplicationMock = async (id, payload) => {
  const db = loadDb()
  const index = db.applications.findIndex((application) => application.id === Number(id))
  if (index === -1) throw new Error('Candidature introuvable')

  db.applications[index] = {
    ...db.applications[index],
    ...payload,
    candidate_id: Number(payload.candidate_id ?? db.applications[index].candidate_id),
    post_id: Number(payload.post_id ?? db.applications[index].post_id),
    updated_at: now(),
  }

  saveDb(db)
  return enrichApplication(ensureApplicationDefaults(db.applications[index]), db)
}

export const updateApplicationStatusMock = async (id, payload) => {
  const db = loadDb()
  const index = db.applications.findIndex((application) => application.id === Number(id))
  if (index === -1) throw new Error('Candidature introuvable')

  const current = ensureApplicationDefaults(db.applications[index])
  const nextStatus = payload.status

  if (!APPLICATION_STATUSES.includes(nextStatus)) {
    throw new Error('Statut de candidature invalide')
  }

  const historyItem = {
    id: nextId(current.history),
    previous_status: current.status,
    new_status: nextStatus,
    changed_by: payload.changed_by || 'Utilisateur',
    note: payload.note || '',
    changed_at: now(),
  }

  db.applications[index] = {
    ...current,
    status: nextStatus,
    history: [...current.history, historyItem],
    updated_at: now(),
  }

  saveDb(db)
  return enrichApplication(db.applications[index], db)
}

export const addApplicationCommentMock = async (id, payload) => {
  const db = loadDb()
  const index = db.applications.findIndex((application) => application.id === Number(id))
  if (index === -1) throw new Error('Candidature introuvable')

  const current = ensureApplicationDefaults(db.applications[index])

  const comment = {
    id: nextId(current.comments),
    author: payload.author || 'Utilisateur',
    content: payload.content,
    created_at: now(),
  }

  db.applications[index] = {
    ...current,
    comments: [...current.comments, comment],
    updated_at: now(),
  }

  saveDb(db)
  return enrichApplication(db.applications[index], db)
}
