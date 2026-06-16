import axios from './axiosConfig'

export const getStatisticsApi = async () => {
  const { data } = await axios.get('/admin/statistics')
  return data
}
