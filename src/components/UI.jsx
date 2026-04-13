import React from 'react'
import * as Icons from './Icons'

// ── Segment Progress Bar (Fixed - reads real bottle stats) ────────────────────
const SEG_COLORS = {
  empty:       '#d1d5db',
  collected:   '#60a5fa',
  inTransit:   '#f59e0b',
  inLab:       '#8b5cf6',
  tested:      '#06b6d4',
  reportReady: '#10b981',
}
const SEG_LABELS = {
  empty:       'Empty',
  collected:   'Collected',
  inTransit:   'Transit',
  inLab:       'In Lab',
  tested:      'Tested',
  reportReady: 'Ready',
}

export function SegBar({ batchId, bottles }) {
  // Count bottles per status for this batch
  const batchBottles = bottles.filter(b => b.batchId === batchId)
  const stats = {
    empty:       batchBottles.filter(b => b.status === 'Empty').length,
    collected:   batchBottles.filter(b => b.status === 'Collected').length,
    inTransit:   batchBottles.filter(b => b.status === 'Sent to VPS').length,
    inLab:       batchBottles.filter(b => b.status === 'In Lab').length,
    tested:      batchBottles.filter(b => b.status === 'Tested').length,
    reportReady: batchBottles.filter(b => b.status === 'Report Ready').length,
  }

  const keys = ['reportReady', 'tested', 'inLab', 'inTransit', 'collected', 'empty']
  const segs = keys
    .map(k => ({ k, v: stats[k], c: SEG_COLORS[k], l: SEG_LABELS[k] }))
    .filter(s => s.v > 0)

  if (!segs.length) return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
  )

  return (
    <div style={{ minWidth: 140 }}>
      <div className="seg-bar">
        {segs.map(sg => (
          <div
            key={sg.k}
            className="seg"
            style={{ flex: sg.v, background: sg.c }}
            title={`${sg.v} ${sg.l}`}
          />
        ))}
      </div>
      <div className="seg-legend">
        {segs.map(sg => (
          <div key={sg.k} className="seg-dot">
            <div className="seg-dot-sq" style={{ background: sg.c }} />
            <span className="seg-dot-label">{sg.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Multi-Segment Bar (Dashboard version with labels) ────────────────────────
export function MultiSegBar({ batchId, bottles, label }) {
  const batchBottles = bottles.filter(b => b.batchId === batchId)
  const stats = {
    empty:       batchBottles.filter(b => b.status === 'Empty').length,
    collected:   batchBottles.filter(b => b.status === 'Collected').length,
    inTransit:   batchBottles.filter(b => b.status === 'Sent to VPS').length,
    inLab:       batchBottles.filter(b => b.status === 'In Lab').length,
    tested:      batchBottles.filter(b => b.status === 'Tested').length,
    reportReady: batchBottles.filter(b => b.status === 'Report Ready').length,
  }
  const total = batchBottles.length

  const segs = [
    { label: 'Empty',        value: stats.empty,       color: '#d1d5db' },
    { label: 'Collected',    value: stats.collected,    color: '#60a5fa' },
    { label: 'In Transit',   value: stats.inTransit,    color: '#f59e0b' },
    { label: 'In Lab',       value: stats.inLab,        color: '#8b5cf6' },
    { label: 'Tested',       value: stats.tested,       color: '#06b6d4' },
    { label: 'Report Ready', value: stats.reportReady,  color: '#10b981' },
  ].filter(x => x.value > 0)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{total} bottles</span>
      </div>
      <div className="seg-bar">
        {segs.map(sg => (
          <div key={sg.label} className="seg" style={{ flex: sg.value, background: sg.color }} title={`${sg.value} ${sg.label}`} />
        ))}
      </div>
      <div className="seg-legend" style={{ marginTop: 5 }}>
        {segs.map(sg => (
          <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: sg.color }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {sg.value} {sg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, large }) {
  if (!open) return null
  return (
    <div className="modal-overlay">
      <div className={`modal${large ? ' modal-lg' : ''}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="close-btn" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
export function DonutChart({ segments, size = 140, thickness = 22, centerLabel, centerSub }) {
  const r     = (size - thickness) / 2
  const circ  = 2 * Math.PI * r
  const total = segments.reduce((a, s) => a + (s.value || 0), 0)

  if (!total) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
    </div>
  )

  let offset = 0
  const paths = segments.map((seg, i) => {
    const dash = (seg.value / total) * circ
    const gap  = circ - dash
    const path = (
      <circle key={i}
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={seg.color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="butt"
      />
    )
    offset += dash
    return path
  })

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>{paths}</svg>
      {centerLabel !== undefined && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: Math.round(size * 0.18), fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
            {centerLabel}
          </div>
          {centerSub && (
            <div style={{ fontSize: Math.round(size * 0.08), color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {centerSub}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round(((value || 0) / (max || 1)) * 100))
  return (
    <div className="progress-track">
      <div className={`progress-fill${color ? ' ' + color : ''}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  'Empty': 'gray', 'Collected': 'blue', 'Sent to VPS': 'amber',
  'In Lab': 'purple', 'Tested': 'teal', 'Report Ready': 'green',
  'Normal': 'green', 'Warning': 'amber', 'Critical': 'red',
  'Draft': 'blue', 'Issued': 'green', 'Dispatched': 'orange',
}
export function StatusBadge({ status }) {
  const color = STATUS_MAP[status] || 'gray'
  return <span className={`badge badge-${color}`}>{status}</span>
}

// ── Priority Badge ────────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { urgent: 'red', high: 'amber', normal: 'teal' }
  const c   = map[priority] || 'gray'
  const cap = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '—'
  return <span className={`badge badge-${c}`}>{cap}</span>
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-bar">
      <Icons.Search />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

// ── Summary Chip ─────────────────────────────────────────────────────────────
export function SummaryChip({ value, label, color }) {
  return (
    <div className="summary-chip">
      <span className="summary-chip-val" style={{ color }}>{value}</span>
      <div className="summary-chip-divider" />
      <span className="summary-chip-lbl">{label}</span>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
export function KPICard({ icon, value, label, sub, color, bg, accentColor, onClick }) {
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-accent-line" style={{ background: accentColor || color }} />
      <div className="kpi-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="kpi-value" style={{ color }}>{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}

// ── Step Tracker ──────────────────────────────────────────────────────────────
export function StepTracker({ steps, currentStep }) {
  return (
    <div className="step-tracker">
      {steps.map((step, i) => {
        const isDone   = i < currentStep
        const isActive = i === currentStep
        return (
          <React.Fragment key={step}>
            <div className="step">
              <div className={`step-circle${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {isDone ? '✓' : i + 1}
              </div>
              <div className={`step-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {step}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`connector${isDone ? ' done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <div
      className={`toggle-track${value ? ' on' : ''}`}
      onClick={() => onChange(!value)}
    />
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

// ── StageBadge (alias) ───────────────────────────────────────────────────────
export { StatusBadge as StageBadge }