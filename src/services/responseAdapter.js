export const unwrapList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  return []
}

export const unwrapItem = (response) => {
  if (!response) return null
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) return response.data
  if (response.item && typeof response.item === 'object') return response.item
  return response
}
