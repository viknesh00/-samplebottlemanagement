import React, { createContext, useContext, useState } from 'react'

// ── Dummy User Accounts ───────────────────────────────────────────────────────
export const DUMMY_USERS = [
  {
    id: 'U001',
    role: 'admin',
    name: 'VPS Admin',
    email: 'admin@vpsveritas.com',
    password: 'admin123',
    avatar: 'VA',
    title: 'Lab Manager',
    company: 'VPS Veritas',
  },
  {
    id: 'U002',
    role: 'staff',
    name: 'Dr. Mehta',
    email: 'mehta@vpsveritas.com',
    password: 'staff123',
    avatar: 'DM',
    title: 'Lab Technician',
    company: 'VPS Veritas',
  },
  {
    id: 'C001',
    role: 'customer',
    name: 'Ramesh Kumar',
    email: 'ramesh@bpcl.in',
    password: 'bpcl123',
    avatar: 'RK',
    title: 'Maintenance Head',
    company: 'Bharat Petroleum',
    customerName: 'Bharat Petroleum',
  },
  {
    id: 'C002',
    role: 'customer',
    name: 'Priya Sharma',
    email: 'priya.s@iocl.com',
    password: 'iocl123',
    avatar: 'PS',
    title: 'Plant Engineer',
    company: 'Indian Oil Corp',
    customerName: 'Indian Oil Corp',
  },
  {
    id: 'C003',
    role: 'customer',
    name: 'Vikram Singh',
    email: 'vsingh@ril.com',
    password: 'ril123',
    avatar: 'VS',
    title: 'Operations Manager',
    company: 'Reliance Ind',
    customerName: 'Reliance Ind',
  },
]

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  function login(email, password) {
    setError('')
    const found = DUMMY_USERS.find(
      u => u.email === email.trim().toLowerCase() && u.password === password
    )
    if (found) {
      setUser(found)
      return true
    }
    setError('Invalid email or password. Please try again.')
    return false
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
