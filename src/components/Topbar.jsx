import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Icons from './Icons'
import { useAuth } from '../context/AuthContext'

const PAGE_META = {
  '/':             { title: 'Dashboard',            crumb: 'Overview' },
  '/batches':      { title: 'Batch Management',     crumb: 'Operations' },
  '/dispatch':     { title: 'Dispatch & Logistics', crumb: 'Operations' },
  '/lab':          { title: 'Lab Processing',        crumb: 'Operations' },
  '/reports':      { title: 'Test Reports',          crumb: 'Operations' },
  '/customers':    { title: 'Customers',             crumb: 'Management' },
  '/portal':       { title: 'Customer Portal',       crumb: 'Management' },
  '/alerts':       { title: 'Alerts & Follow-ups',  crumb: 'Management' },
  '/settings':     { title: 'Settings',              crumb: 'System' },
  '/unauthorized': { title: 'Access Denied',         crumb: '' },
}

export default function Topbar({ activeBatches = 0, alertCount = 0 }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { title, crumb } = PAGE_META[pathname] || { title: 'VPS LabTrack', crumb: '' }

  const isCustomer = user?.role === 'customer'

  return (
    <div className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-breadcrumb">
          VPS LabTrack {crumb ? `› ${crumb}` : ''}
          {isCustomer && (
            <span style={{ marginLeft: 8, color: '#f59e0b', fontSize: 11, fontWeight: 500 }}>
              · Customer View — {user.company}
            </span>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        {!isCustomer && (
          <>
            <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              <span className="dot dot-teal" />
              {activeBatches} active batches
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/alerts')}
              style={{ position: 'relative' }}
              title="Alerts"
            >
              <Icons.Alerts />
              {alertCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--red)', color: '#fff',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {alertCount}
                </span>
              )}
            </button>

            <button className="btn btn-primary" onClick={() => navigate('/batches')}>
              <Icons.Plus />
              New Batch
            </button>
          </>
        )}

        {isCustomer && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', background: 'rgba(232,80,10,0.06)',
            border: '1px solid rgba(232,80,10,0.20)', borderRadius: 'var(--radius)',
            fontSize: 13,
          }}>
            <span style={{ color: '#e8500a' }}>🏭</span>
            <span style={{ color: '#9a3412', fontWeight: 600 }}>{user.company}</span>
          </div>
        )}
      </div>
    </div>
  )
}
