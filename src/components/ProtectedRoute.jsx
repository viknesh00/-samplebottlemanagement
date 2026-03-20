import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route and redirects if:
 * - Not logged in → /login
 * - Logged in but wrong role → /unauthorized
 *
 * Props:
 *   allowedRoles: string[]  e.g. ['admin', 'staff']
 *   children: JSX
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
