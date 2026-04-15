import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ams_token')
    const saved = localStorage.getItem('ams_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (tokenData) => {
    localStorage.setItem('ams_token', tokenData.token)
    localStorage.setItem('ams_user', JSON.stringify({
      name: tokenData.name,
      email: tokenData.email,
      userId: tokenData.userId,
    }))
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    setUser({ name: tokenData.name, email: tokenData.email, userId: tokenData.userId })
  }

  const logout = () => {
    localStorage.removeItem('ams_token')
    localStorage.removeItem('ams_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
