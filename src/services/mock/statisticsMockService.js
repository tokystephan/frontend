import { APPLICATION_STATUSES } from '../../utils/constants'
import { loadDb } from './mockStorage'

export const getStatisticsMock = async () => {
  const db = loadDb()

  const totalApplications = db.applications.length
  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    count: db.applications.filter((item) => item.status === status).length,
  }))

  const pending = db.applications.filter((item) => ['recue', 'en_cours'].includes(item.status)).length

  const byDepartment = db.posts.reduce((accumulator, post) => {
    const count = db.applications.filter((app) => app.post_id === post.id).length
    const current = accumulator[post.department] || 0
    accumulator[post.department] = current + count
    return accumulator
  }, {})

  return {
    totalApplications,
    pending,
    byStatus,
    byDepartment,
  }
}
