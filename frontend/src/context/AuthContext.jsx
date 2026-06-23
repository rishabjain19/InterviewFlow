import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [apc, setApc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('apc_token')
    const saved = localStorage.getItem('apc_user')
    if (token && saved) {
      setApc(JSON.parse(saved))
      api.get('/auth/me')
        .then(r => setApc(r.data.user))
        .catch(() => { localStorage.removeItem('apc_token'); localStorage.removeItem('apc_user'); setApc(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('apc_token', res.data.token)
    localStorage.setItem('apc_user', JSON.stringify(res.data.user))
    setApc(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('apc_token')
    localStorage.removeItem('apc_user')
    setApc(null)
  }

  return (
    <AuthContext.Provider value={{ apc, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
