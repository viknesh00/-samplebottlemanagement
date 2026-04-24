import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Maps VPS Customer Portal userRole / userType to LabTrack roles.
 * VPS Admin / Client Admin → 'admin'
 * Everything else (ClientUser, staff, etc.) → 'staff'
 */
function resolveRole(user) {
  if (!user) return null
  // If already set (legacy local user object)
  if (user.role) return user.role
  // Map from real API fields
  const t = (user.type || '').toLowerCase()
  const r = (user.userRole || '').toLowerCase()
  if (t.includes('admin') || r.includes('admin')) return 'admin'
  return 'staff'
}

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = resolveRole(user)

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
