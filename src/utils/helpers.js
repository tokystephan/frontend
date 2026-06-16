export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const getFullName = (user) => {
  if (!user) return 'Utilisateur'
  const first = user.first_name || ''
  const last = user.last_name || ''
  const value = `${first} ${last}`.trim()
  return value || user.username || user.email || 'Utilisateur'
}

export const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export const matchesQuery = (query, ...fields) => {
  if (!query) return true
  const normalizedQuery = normalizeText(query)
  return fields.some((field) => normalizeText(field).includes(normalizedQuery))
}
