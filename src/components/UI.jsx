import React from 'react'
import * as Icons from './Icons'
import { STAGES } from '../data/mockData'

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="close-btn" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Step Tracker ──────────────────────────────────────────────────────────────
const SHORT_LABELS = ['Packed','Dispatched','Cust. Recv','Filled','Cust. Sent','VPS Recv','In Lab','Testing','Report']

export function StepTracker({ stage }) {
  return (
    <div className="step-tracker">
      {SHORT_LABELS.map((s, i) => {
        const done   = i < stage
        const active = i === stage
        return (
          <React.Fragment key={i}>
            <div className="step">
              <div className={`step-circle ${done ? 'done' : active ? 'active' : ''}`}>
                {done ? <Icons.Check /> : i + 1}
              </div>
              <div className={`step-label ${done ? 'done' : active ? 'active' : ''}`}>{s}</div>
            </div>
            {i < SHORT_LABELS.length - 1 && (
              <div className={`connector ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
function stageColor(s) {
  if (s >= 8) return 'green'
  if (s >= 6) return 'blue'
  if (s >= 4) return 'teal'
  if (s >= 2) return 'amber'
  return 'gray'
}

export function StageBadge({ stage }) {
  const c = stageColor(stage)
  return (
    <span className={`badge badge-${c}`}>
      <span className={`dot dot-${c}`} />
      {STAGES[stage] || 'Unknown'}
    </span>
  )
}

// ── Priority Badge ────────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { urgent: 'red', high: 'amber', normal: 'teal' }
  const c = map[priority] || 'gray'
  return <span className={`badge badge-${c}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-bar">
      <Icons.Search />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Icons.Bottle, message = 'Nothing to show' }) {
  return (
    <div className="empty-state">
      <Icon />
      <p>{message}</p>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, value, label, delta, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        <div className="stat-delta">{delta}</div>
      </div>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max }) {
  const pct = Math.round((value / (max || 1)) * 100)
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
