import { matchesQuery } from '../../utils/helpers'
import { loadDb, nextId, now, saveDb } from './mockStorage'

export const listCandidatesMock = async (params = {}) => {
  const { search = '', source = '' } = params
  const db = loadDb()

  let items = [...db.candidates]

  if (source) {
    items = items.filter((item) => item.source === source)
  }

  if (search) {
    items = items.filter((item) =>
      matchesQuery(search, item.first_name, item.last_name, item.email, item.phone, item.source),
    )
  }

  return items.sort((a, b) => b.id - a.id)
}

export const getCandidateMock = async (id) => {
  const db = loadDb()
  const item = db.candidates.find((candidate) => candidate.id === Number(id))
  if (!item) throw new Error('Candidat introuvable')
  return item
}

export const createCandidateMock = async (payload) => {
  const db = loadDb()
  const item = {
    id: nextId(db.candidates),
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    source: payload.source,
    documents: payload.documents || [],
    created_at: now(),
    updated_at: now(),
  }

  db.candidates.push(item)
  saveDb(db)
  return item
}

export const updateCandidateMock = async (id, payload) => {
  const db = loadDb()
  const index = db.candidates.findIndex((candidate) => candidate.id === Number(id))
  if (index === -1) throw new Error('Candidat introuvable')

  db.candidates[index] = {
    ...db.candidates[index],
    ...payload,
    updated_at: now(),
  }

  saveDb(db)
  return db.candidates[index]
}
