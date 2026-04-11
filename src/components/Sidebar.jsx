import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as Icons from './Icons'

const NAV_SECTIONS_ADMIN = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: <Icons.Dashboard />, label: 'Dashboard' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/batches',  icon: <Icons.Bottle />,  label: 'Batches'        },
      { to: '/lab',      icon: <Icons.Flask />,   label: 'Lab Processing' },
      { to: '/reports',  icon: <Icons.Reports />, label: 'Reports'        },
    ]
  },
  {
    label: 'Management',
    items: [
      { to: '/customers', icon: <Icons.User />,     label: 'Customers'       },
      { to: '/portal',    icon: <Icons.Return />,   label: 'Customer Portal' },
      { to: '/alerts',    icon: <Icons.Warn />,     label: 'Alerts', badge: true },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/settings', icon: <Icons.Settings />, label: 'Settings' },
    ]
  },
]

const NAV_SECTIONS_CUSTOMER = [
  {
    label: 'Portal',
    items: [
      { to: '/portal', icon: <Icons.Return />, label: 'My Batches' },
    ]
  }
]

export default function Sidebar({ alertCount }) {
  const { user, logout } = useAuth()
  const sections = user?.role === 'customer' ? NAV_SECTIONS_CUSTOMER : NAV_SECTIONS_ADMIN
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'VA'

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <Icons.Flask />
          </div>
          <div>
            <div className="brand-name">VPS LabTrack</div>
            <div className="brand-sub">Sample Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span className="nav-badge">{alertCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        {/* System status */}
        <div style={{ marginTop: 8 }}>
          <div style={{
            padding: '9px 10px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.14)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
              System Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16,185,129,0.65)',
                animation: 'pulseGlow 2.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-mono)' }}>
                Online · v2.1.0
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-role">{user?.title || user?.role} · VPS Veritas</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <Icons.Logout />
          Sign Out
        </button>
      </div>
    </div>
  )
}
