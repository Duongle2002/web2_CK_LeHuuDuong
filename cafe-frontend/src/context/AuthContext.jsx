import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const api = useMemo(() => createApi(() => token), [token])

  const login = async (username, password) => {
    const res = await api.login(username, password)
    setToken(res.token)
    setUser({ username: res.username, roles: res.roles })
    return res
  }
  const logout = () => {
    setToken('')
    setUser(null)
  }

  const hasRole = (...rs) => {
    const roles = user?.roles || []
    return roles?.some(r => {
      const name = typeof r === 'string' ? r : (r?.name || '')
      return rs.includes(name)
    })
  }
  const isAdmin = hasRole('ROLE_ADMIN', 'ROLE_ROOT')

  const value = useMemo(() => ({ token, user, login, logout, api, isAuthenticated: !!token, hasRole, isAdmin }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
