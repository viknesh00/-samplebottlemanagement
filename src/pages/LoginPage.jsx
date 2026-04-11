import React, { useState } from 'react'
import { useAuth, DUMMY_USERS } from '../context/AuthContext'

const QUICK_LOGINS = [
  {
    role: 'admin',
    label: 'VPS Staff',
    desc: 'Full access — all modules',
    color: '#e85d0a',
    bg: 'rgba(232,93,10,0.07)',
    border: 'rgba(232,93,10,0.2)',
    iconBg: '#e85d0a',
    users: DUMMY_USERS.filter(u => u.role === 'admin' || u.role === 'staff'),
  },
  {
    role: 'customer',
    label: 'Customer Login',
    desc: 'Portal access only',
    color: '#1f5ec4',
    bg: 'rgba(31,94,196,0.07)',
    border: 'rgba(31,94,196,0.2)',
    iconBg: '#1f5ec4',
    users: DUMMY_USERS.filter(u => u.role === 'customer'),
  },
]

const ROLE_MATRIX = [
  ['Dashboard',        true,  true,  false],
  ['Batch Management', true,  true,  false],
  ['Dispatch',         true,  true,  false],
  ['Lab Processing',   true,  true,  false],
  ['Reports',          true,  true,  false],
  ['Customers',        true,  false, false],
  ['Customer Portal',  true,  true,  true ],
  ['Alerts',           true,  true,  false],
  ['Settings',         true,  false, false],
]

export default function LoginPage() {
  const { login, error, setError } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { login(email, password); setLoading(false) }, 550)
  }

  function quickFill(user) {
    setError('')
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: '#f0ede8',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(17,20,24,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17,20,24,0.035) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '390px 1fr',
        gap: '40px',
        width: '100%',
        maxWidth: '1020px',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 1,
        animation: 'pageIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── LEFT: Login Card ─────────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e0dcd6',
          borderRadius: 18,
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(17,20,24,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          position: 'relative',
          overflow: 'hidden',
          animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)',
            borderRadius: '18px 18px 0 0',
          }} />

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div style={{
              width: 46, height: 46,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(232,93,10,0.32)',
              position: 'relative', overflow: 'hidden', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width={22} height={22} style={{ position: 'relative', zIndex: 1 }}>
                <path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0e1117', letterSpacing: '0.2px', lineHeight: 1.1 }}>
                VPS LabTrack
              </div>
              <div style={{ fontSize: 10, color: '#8a919e', textTransform: 'uppercase', letterSpacing: '1.4px', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                Oil Sample Management
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

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderLeft: '3px solid var(--red)',
              borderRadius: 8, padding: '11px 14px', marginBottom: 20,
              fontSize: 13, color: '#dc2626',
              display: 'flex', gap: 9, alignItems: 'center',
              fontFamily: 'var(--font-body)',
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
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
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
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
                  onChange={e => setPassword(e.target.value)}
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
                    transition: 'color 0.15s',
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
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#c44e08' : 'var(--accent)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '14px', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'var(--font-body)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,93,10,0.38)',
                letterSpacing: '0.2px',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px) scale(1.005)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,10,0.44)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,93,10,0.38)' }}
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
            © Natobotics {new Date().getFullYear()}. All rights reserved.
          </div>
        </div>

        {/* ── RIGHT: Demo Accounts + Role Matrix ─────────────────────────── */}
        <div style={{ animation: 'slideInRight 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8a919e', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 18, fontFamily: 'var(--font-mono)' }}>
            Demo Accounts — Click to auto-fill
          </div>

          {QUICK_LOGINS.map((group, gi) => (
            <div key={group.role} style={{ marginBottom: 22 }}>
              {/* Group header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', marginBottom: 8,
                background: group.bg,
                border: `1.5px solid ${group.border}`,
                borderRadius: 10,
                animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${gi * 60}ms both`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: group.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: `0 3px 10px ${group.bg.replace('0.07', '0.35')}`,
                }}>
                  <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                    {group.role === 'admin'
                      ? <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                      : <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0H5m-2 0h2M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    }
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: group.color, fontFamily: 'var(--font-body)' }}>{group.label}</div>
                  <div style={{ fontSize: 11.5, color: '#8a919e', fontFamily: 'var(--font-body)', marginTop: 1 }}>{group.desc}</div>
                </div>
              </div>

              {/* User rows */}
              {group.users.map((u, ui) => (
                <div
                  key={u.id}
                  onClick={() => quickFill(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '12px 16px', marginBottom: 6,
                    background: '#ffffff',
                    border: '1.5px solid #e8e4de',
                    borderRadius: 10, cursor: 'pointer',
                    transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: '0 1px 4px rgba(17,20,24,0.05)',
                    animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${gi * 60 + (ui + 1) * 50}ms both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = group.border.replace('0.2', '0.45')
                    e.currentTarget.style.background = group.bg
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(17,20,24,0.09)'
                    e.currentTarget.style.transform = 'translateX(3px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e8e4de'
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(17,20,24,0.05)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: group.bg,
                    border: `1.5px solid ${group.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: group.color,
                    flexShrink: 0, fontFamily: 'var(--font-display)',
                  }}>
                    {u.avatar}
                  </div>

                  {/* Name + company */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0e1117', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: '#8a919e', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.company.split(' ').slice(0, 3).join(' ')} · {u.title}
                    </div>
                  </div>

                  {/* Credentials */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#8a919e', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                    <div style={{ fontSize: 10.5, color: '#b0aaa4', fontFamily: 'var(--font-mono)', marginTop: 2 }}>pw: {u.password}</div>
                  </div>

                  <svg width="14" height="14" fill="none" stroke="#c0bbb4" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              ))}
            </div>
          ))}

          {/* Role Access Matrix */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e8e4de',
            borderRadius: 12, padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(17,20,24,0.06)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 300ms both',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8a919e', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
              Role Access Matrix
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 56px 76px', alignItems: 'center' }}>
              {['Module', 'Admin', 'Staff', 'Customer'].map((h, i) => (
                <div key={h} style={{
                  fontSize: 11, fontWeight: 700,
                  color: i === 0 ? '#8a919e' : i === 1 ? 'var(--accent)' : i === 2 ? 'var(--blue)' : 'var(--teal)',
                  padding: '0 0 10px 0',
                  borderBottom: '1px solid #e9e5de',
                  textAlign: i === 0 ? 'left' : 'center',
                  fontFamily: 'var(--font-body)',
                }}>
                  {h}
                </div>
              ))}

              {ROLE_MATRIX.map(([mod, a, s, c], ri) => (
                <React.Fragment key={mod}>
                  <div style={{
                    fontSize: 12.5, color: '#4e5562',
                    padding: '8px 0',
                    borderBottom: ri < ROLE_MATRIX.length - 1 ? '1px solid #f0ede8' : 'none',
                    fontFamily: 'var(--font-body)',
                  }}>{mod}</div>
                  {[a, s, c].map((v, i) => (
                    <div key={i} style={{
                      textAlign: 'center', padding: '8px 0',
                      borderBottom: ri < ROLE_MATRIX.length - 1 ? '1px solid #f0ede8' : 'none',
                    }}>
                      {v
                        ? <svg width="14" height="14" fill="none" stroke={i===0?'var(--accent)':i===1?'var(--blue)':'var(--teal)'} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                        : <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      }
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
