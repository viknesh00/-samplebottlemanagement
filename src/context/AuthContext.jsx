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
    id: 'U003',
    role: 'staff',
    name: 'Ms. Asha',
    email: 'asha@vpsveritas.com',
    password: 'staff123',
    avatar: 'MA',
    title: 'Senior Analyst',
    company: 'VPS Veritas',
  },
  {
    id: 'C001',
    role: 'customer',
    name: 'James Walker',
    email: 'james.walker@ukpower.co.uk',
    password: 'ukpower123',
    avatar: 'JW',
    title: 'Maintenance Manager',
    company: 'UK POWER NETWORKS LPN',
    customerName: 'UK POWER NETWORKS LPN',
  },
  {
    id: 'C002',
    role: 'customer',
    name: 'Emily Thompson',
    email: 'emily.thompson@freedom.co.uk',
    password: 'freedom123',
    avatar: 'ET',
    title: 'Plant Engineer',
    company: 'FREEDOM GROUP OF COMPANIES LTD',
    customerName: 'FREEDOM GROUP OF COMPANIES LTD',
  },
  {
    id: 'C003',
    role: 'customer',
    name: 'George Harris',
    email: 'george.harris@infinis.co.uk',
    password: 'infinis123',
    avatar: 'GH',
    title: 'Operations Manager',
    company: 'INFINIS ENERGY SERVICES LTD',
    customerName: 'INFINIS ENERGY SERVICES LTD',
  },
]

// ── Context Setup ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
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
