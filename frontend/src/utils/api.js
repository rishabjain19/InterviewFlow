import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://interviewflow-1-anoe.onrender.com/api' : '/api')

const api = axios.create({
  baseURL: BACKEND,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('apc_token')
      localStorage.removeItem('apc_user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
