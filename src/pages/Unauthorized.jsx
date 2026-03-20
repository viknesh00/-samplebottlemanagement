import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const navigate  = useNavigate()
  const { user }  = useAuth()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 32,
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
        marginBottom: 8, color: 'var(--text-primary)',
      }}>
        Access Restricted
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
        Your account <strong style={{ color: 'var(--text-primary)' }}>({user?.name})</strong> does
        not have permission to access this module.
        {user?.role === 'customer' && (
          <> Customers can only access the Customer Portal.</>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(user?.role === 'customer' ? '/portal' : '/')}
        >
          Go to {user?.role === 'customer' ? 'Customer Portal' : 'Dashboard'}
        </button>
      </div>
    </div>
  )
}
