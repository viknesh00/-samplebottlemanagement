import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import * as Icons from './Icons'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { path: '/',          label: 'Dashboard',       Icon: Icons.Dashboard, section: 'overview',    roles: ['admin','staff'] },
  { path: '/batches',   label: 'Batches',          Icon: Icons.Bottle,    section: 'operations',  roles: ['admin','staff'] },
  { path: '/dispatch',  label: 'Dispatch',         Icon: Icons.Truck,     section: 'operations',  roles: ['admin','staff'] },
  { path: '/lab',       label: 'Lab Processing',   Icon: Icons.Lab,       section: 'operations',  roles: ['admin','staff'] },
  { path: '/reports',   label: 'Reports',          Icon: Icons.Reports,   section: 'operations',  roles: ['admin','staff'] },
  { path: '/customers', label: 'Customers',        Icon: Icons.Customers, section: 'management',  roles: ['admin'] },
  { path: '/portal',    label: 'Customer Portal',  Icon: Icons.Portal,    section: 'management',  roles: ['admin','staff','customer'] },
  { path: '/alerts',    label: 'Alerts',           Icon: Icons.Alerts,    section: 'management',  roles: ['admin','staff'], badge: true },
  { path: '/settings',  label: 'Settings',         Icon: Icons.Settings,  section: 'system',      roles: ['admin'] },
]

const SECTIONS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'operations',  label: 'Operations' },
  { key: 'management',  label: 'Management' },
  { key: 'system',      label: 'System' },
]

export default function Sidebar({ alertCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const visibleNav = NAV.filter(n => n.roles.includes(user?.role))

  const roleColor = { admin: 'var(--teal)', staff: 'var(--blue)', customer: 'var(--amber)' }[user?.role] || 'var(--text-muted)'
  const roleLabel = { admin: 'Admin', staff: 'Staff', customer: 'Customer' }[user?.role] || 'User'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
              <path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">VPS LabTrack</div>
            <div className="brand-sub">Sample Management</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {SECTIONS.map(sec => {
          const items = visibleNav.filter(n => n.section === sec.key)
          if (!items.length) return null
          return (
            <div className="nav-section" key={sec.key}>
              <div className="nav-section-label">{sec.label}</div>
              {items.map(({ path, label, Icon, badge }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon />
                  {label}
                  {badge && alertCount > 0 && (
                    <span className="nav-badge">{alertCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', marginBottom: 6,
          background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--radius)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(232,80,10,0.10)',
            border: '1px solid rgba(232,80,10,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#ffffff',
          }}>
            {user?.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 10.5 }}>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{roleLabel}</span>
              <span style={{ color: 'var(--text-muted)' }}> · {user?.company}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontFamily: 'var(--font-body)', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
