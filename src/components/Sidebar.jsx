import React from 'react'
import { NavLink } from 'react-router-dom'
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
      { to: '/customers', icon: <Icons.User />,    label: 'Customers'       },
      { to: '/portal',    icon: <Icons.Return />,  label: 'Customer Portal' },
      { to: '/alerts',    icon: <Icons.Warn />,    label: 'Alerts', badge: 'alerts' },
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
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: <Icons.Dashboard />, label: 'Dashboard' },
    ]
  },
  {
    label: 'My Batches',
    items: [
      { to: '/portal',   icon: <Icons.Return />,  label: 'My Batches & Samples' },
      { to: '/reports',  icon: <Icons.Reports />, label: 'Reports' },
    ]
  }
]

export default function Sidebar({ alertCount, pendingRequests }) {
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
        {sections.map(section => (
          <div key={section.label} className="nav-section">
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/dashboard'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge === 'alerts' && alertCount > 0 && (
                  <span className="nav-badge nav-badge-red">{alertCount}</span>
                )}
                {item.badge === 'requests' && pendingRequests > 0 && (
                  <span className="nav-badge nav-badge-orange">{pendingRequests}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* System Status */}
      <div className="sidebar-status">
        <div className="status-label">System Status</div>
        <div className="status-row">
          <span className="status-dot"></span>
          <span className="status-text">Online · v1.1.0</span>
        </div>
      </div>

      {/* User card + sign out */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.title || user?.role} · {user?.company || 'VPS VERITAS'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}