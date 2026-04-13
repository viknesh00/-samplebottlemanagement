import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as Icons from './Icons'

const ROUTE_META = {
  '/':          { title: 'Operations Dashboard', crumb: 'VPS LabTrack › Overview' },
  '/batches':   { title: 'Batch Management',     crumb: 'VPS LabTrack › Operations' },
  '/lab':       { title: 'Lab Processing',        crumb: 'VPS LabTrack › Operations' },
  '/reports':   { title: 'Lab Reports',           crumb: 'VPS LabTrack › Operations' },
  '/customers': { title: 'Customers',             crumb: 'VPS LabTrack › Management' },
  '/portal':    { title: 'Customer Portal',       crumb: 'VPS LabTrack › Management' },
  '/alerts':    { title: 'System Alerts',         crumb: 'VPS LabTrack › Management' },
  '/settings':  { title: 'Settings',             crumb: 'VPS LabTrack › System'     },
}

export default function Topbar({ activeBatches, alertCount, totalInTransit, totalInLab }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const meta = ROUTE_META[location.pathname] || { title: 'VPS LabTrack', crumb: 'VPS LabTrack' }
  const [bellHover, setBellHover] = useState(false)

  const isCustomer = user?.role === 'customer'

  function goToBatches(filter) {
    navigate('/batches', { state: { filter } })
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-title">{meta.title}</div>
          <div className="page-crumb">{meta.crumb}</div>
        </div>

        {/* <div className="topbar-divider" />

        <div
          className="metric-chip chip-green"
          onClick={() => goToBatches('active')}
          title="Click to view active batches"
          style={{ cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <div className="metric-chip-dot" style={{ boxShadow: '0 0 0 3px rgba(10,124,82,0.15)' }} />
          <span className="metric-chip-val">{activeBatches}</span>
          <span className="metric-chip-lbl">active batches</span>
        </div>

        {totalInTransit > 0 && (
          <div
            className="metric-chip chip-amber"
            onClick={() => isCustomer ? navigate('/portal') : navigate('/batches', { state: { filter: 'transit' } })}
            title="Click to view bottles in transit"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div className="metric-chip-dot" />
            <span className="metric-chip-val">{totalInTransit}</span>
            <span className="metric-chip-lbl">in transit</span>
          </div>
        )}

        {totalInLab > 0 && (
          <div
            className="metric-chip chip-purple"
            onClick={() => isCustomer ? navigate('/portal') : navigate('/lab')}
            title="Click to view lab queue"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div className="metric-chip-dot" />
            <span className="metric-chip-val">{totalInLab}</span>
            <span className="metric-chip-lbl">in lab</span>
          </div>
        )} */}
      </div>

      <div className="topbar-right">
        <button
          onClick={() => navigate('/alerts')}
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          style={{
            position: 'relative', width: 34, height: 34,
            border: `1.5px solid ${bellHover ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--r-sm)',
            background: bellHover ? 'var(--accent-ultra)' : 'var(--bg)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bellHover ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: bellHover ? 'scale(1.06)' : 'scale(1)',
          }}
        >
          <Icons.Warn style={{ width: 16, height: 16 }} />
          {alertCount > 0 && (
            <div style={{
              position: 'absolute', top: -5, right: -5,
              minWidth: 17, height: 17, borderRadius: 9,
              background: 'var(--red)', border: '2px solid var(--surface)',
              fontSize: 8.5, color: '#fff', fontFamily: 'var(--font-mono)',
              fontWeight: 700, padding: '0 3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}>
              {alertCount > 9 ? '9+' : alertCount}
            </div>
          )}
        </button>


      </div>
    </div>
  )
}
