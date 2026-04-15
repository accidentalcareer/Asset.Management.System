import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — unwrap data.data
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ams_token')
      localStorage.removeItem('ams_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
