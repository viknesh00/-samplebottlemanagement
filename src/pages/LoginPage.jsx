import React, { useState } from 'react'
import { useAuth, DUMMY_USERS } from '../context/AuthContext'

// ── Quick-login credential cards ──────────────────────────────────────────────
const QUICK_LOGINS = [
  {
    role: 'admin',
    label: 'VPS Admin',
    desc: 'Full access — all modules',
    color: '#e8500a',
    bg: 'rgba(232,80,10,0.06)',
    border: 'rgba(232,80,10,0.25)',
    icon: '🔬',
    users: DUMMY_USERS.filter(u => u.role === 'admin' || u.role === 'staff'),
  },
  {
    role: 'customer',
    label: 'Customer Login',
    desc: 'Portal access only',
    color: '#64748b',
    bg: 'rgba(232,80,10,0.05)',
    border: 'rgba(232,80,10,0.12)',
    icon: '🏭',
    users: DUMMY_USERS.filter(u => u.role === 'customer'),
  },
]

export default function LoginPage() {
  const { login, error, setError } = useAuth()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login(email, password)
      setLoading(false)
    }, 600)
  }

  function quickFill(user) {
    setError('')
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Background grid decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(26,32,53,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,32,53,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}/>

      {/* Glow orb */}
      <div style={{
        position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(232,80,10,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 980, display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* ── Left: Login Form ── */}
        <div style={{
          flex: '0 0 400px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '36px 32px',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 44, height: 44, background: '#e8500a', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} style={{ color: '#000' }}>
                <path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#1a2035' }}>
                VPS LabTrack
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Oil Sample Management
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#1a2035' }}>
              Welcome back
            </div>
            <div style={{ fontSize: 13.5, color: '#64748b' }}>
              Sign in to your account to continue
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%', background: '#f0f2f5', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)',
                  outline: 'none', transition: 'border .15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%', background: '#f0f2f5', border: '1px solid #e2e8f0',
                    borderRadius: 10, padding: '11px 40px 11px 14px', fontSize: 14, color: 'var(--text-primary)',
                    outline: 'none', transition: 'border .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 13,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? 'var(--teal-dim)' : 'var(--teal)',
                color: '#000', border: 'none', borderRadius: 10,
                padding: '12px', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)',
                    borderTopColor: '#000', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}/>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            VPS India Pvt Ltd · Confidential System
          </div>
        </div>

        {/* ── Right: Quick Login Cards ── */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 16 }}>
            Demo Accounts — Click to auto-fill
          </div>

          {QUICK_LOGINS.map(group => (
            <div key={group.role} style={{ marginBottom: 20 }}>
              {/* Group Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                padding: '10px 14px',
                background: group.bg, border: `1px solid ${group.border}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 18 }}>{group.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: group.color }}>{group.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{group.desc}</div>
                </div>
              </div>

              {/* User rows */}
              {group.users.map(u => (
                <div
                  key={u.id}
                  onClick={() => quickFill(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', marginBottom: 6,
                    background: '#ffffff', border: '1px solid #e2e8f0',
                    borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = group.border
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: group.bg, border: `1px solid ${group.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: group.color, flexShrink: 0,
                  }}>
                    {u.avatar}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{u.company} · {u.title}</div>
                  </div>

                  {/* Credentials */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>pw: {u.password}</div>
                  </div>

                  {/* Arrow */}
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 4 }}>→</div>
                </div>
              ))}
            </div>
          ))}

          {/* Access legend */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '14px 16px', marginTop: 4,
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              Role Access Matrix
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px 16px', fontSize: 12, alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontWeight: 600 }}>Module</div>
              <div style={{ color: '#e8500a', fontWeight: 600 }}>Admin</div>
              <div style={{ color: '#e8500a', fontWeight: 600 }}>Staff</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Customer</div>
              {[
                ['Dashboard',        '✓', '✓', '✗'],
                ['Batch Management', '✓', '✓', '✗'],
                ['Dispatch',         '✓', '✓', '✗'],
                ['Lab Processing',   '✓', '✓', '✗'],
                ['Reports',          '✓', '✓', '✗'],
                ['Customers',        '✓', '✗', '✗'],
                ['Customer Portal',  '✓', '✓', '✓'],
                ['Alerts',           '✓', '✓', '✗'],
                ['Settings',         '✓', '✗', '✗'],
              ].map(([mod, a, s, c]) => (
                <React.Fragment key={mod}>
                  <div style={{ color: '#64748b' }}>{mod}</div>
                  <div style={{ color: a === '✓' ? '#e8500a' : '#cbd5e1', textAlign: 'center' }}>{a}</div>
                  <div style={{ color: s === '✓' ? '#e8500a' : '#cbd5e1', textAlign: 'center' }}>{s}</div>
                  <div style={{ color: c === '✓' ? '#64748b' : '#cbd5e1', textAlign: 'center' }}>{c}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
