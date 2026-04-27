import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, error, setError, loading } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setAccessDenied(false)
    const result = await login(email, password)
    if (result?.success) {
      navigate('/dashboard', { replace: true })
    } else if (result?.accessDenied) {
      setAccessDenied(true)
    }
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#f0ede8',
      position: 'relative',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(17,20,24,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17,20,24,0.035) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
        animation: 'pageIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e0dcd6',
          borderRadius: 18,
          padding: '44px 40px',
          boxShadow: '0 8px 40px rgba(17,20,24,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)',
            borderRadius: '18px 18px 0 0',
          }} />

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="https://vpsveritas.com//themes/custom/vps/images/logo.svg"
              alt="VPS Veritas"
              style={{ width: 72, height: 64, objectFit: 'contain', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0e1117', letterSpacing: '0.2px', lineHeight: 1.1 }}>
                VPS LabTrack
              </div>
              <div style={{ fontSize: 10, color: '#8a919e', textTransform: 'uppercase', letterSpacing: '1.4px', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                Sample Bottle Tracking system.
              </div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#0e1117', letterSpacing: '-0.3px' }}>
              Welcome back
            </div>
            <div style={{ fontSize: 14, color: '#8a919e', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              Sign in to your account to continue
            </div>
          </div>

          {/* Access Denied alert */}
          {accessDenied && (
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderLeft: '3px solid #f97316',
              borderRadius: 8, padding: '13px 14px', marginBottom: 20,
              fontFamily: 'var(--font-body)',
            }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <svg width="16" height="16" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#c2410c', marginBottom: 3 }}>
                    Access Restricted
                  </div>
                  <div style={{ fontSize: 12.5, color: '#9a3412', lineHeight: 1.5 }}>
                    This portal is only accessible to <strong>VPS Admin</strong> accounts.<br />
                    Please contact your VPS Admin for access.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General error (wrong password etc.) */}
          {error && !accessDenied && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderLeft: '3px solid var(--red)',
              borderRadius: 8, padding: '11px 14px', marginBottom: 20,
              fontSize: 13, color: '#dc2626',
              display: 'flex', gap: 9, alignItems: 'center',
              fontFamily: 'var(--font-body)',
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4e5562', marginBottom: 7, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setAccessDenied(false); setError('') }}
                placeholder="you@vpsveritas.com"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4e5562', marginBottom: 7, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setAccessDenied(false); setError('') }}
                  placeholder="Enter your password"
                  required
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#8a919e', display: 'flex', alignItems: 'center', padding: 2,
                  }}
                >
                  {showPass
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: '100%',
                background: loading ? '#c44e08' : 'var(--accent)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '14px', fontSize: 15, fontWeight: 500,
                cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'var(--font-body)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,93,10,0.28)',
                letterSpacing: '0.2px',
                opacity: (!email || !password) ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loading && email && password) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,10,0.34)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,93,10,0.28)' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #ede9e2', fontSize: 12, color: '#c0bbb4', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
            © VPS Veritas {new Date().getFullYear()}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}