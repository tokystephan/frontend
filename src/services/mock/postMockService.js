import { matchesQuery } from '../../utils/helpers'
import { loadDb, nextId, now, saveDb } from './mockStorage'

export const listPostsMock = async (params = {}) => {
  const { search = '', status = '', department = '' } = params
  const db = loadDb()

  let items = [...db.posts]

  if (status) {
    items = items.filter((item) => item.status === status)
  }

  if (department) {
    items = items.filter((item) => item.department === department)
  }

  if (search) {
    items = items.filter((item) => matchesQuery(search, item.title, item.department, item.description))
  }

  return items.sort((a, b) => b.id - a.id)
}

export const getPostMock = async (id) => {
  const db = loadDb()
  const item = db.posts.find((post) => post.id === Number(id))
  if (!item) throw new Error('Poste introuvable')
  return item
}

export const createPostMock = async (payload) => {
  const db = loadDb()
  const item = {
    id: nextId(db.posts),
    title: payload.title,
    department: payload.department,
    contract_type: payload.contract_type,
    status: payload.status || 'ouvert',
    description: payload.description || '',
    created_at: now(),
    updated_at: now(),
  }

  db.posts.push(item)
  saveDb(db)
  return item
}

export const updatePostMock = async (id, payload) => {
  const db = loadDb()
  const index = db.posts.findIndex((post) => post.id === Number(id))
  if (index === -1) throw new Error('Poste introuvable')

  db.posts[index] = {
    ...db.posts[index],
    ...payload,
    updated_at: now(),
  }

  saveDb(db)
  return db.posts[index]
}

export const archivePostMock = async (id) => {
  return updatePostMock(id, { status: 'archive' })
}
