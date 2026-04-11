import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 * - Not logged in       → /login
 * - Wrong role          → /unauthorized
 * - Correct role        → renders children
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
