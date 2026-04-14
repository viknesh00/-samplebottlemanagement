import React from 'react'
import ReactDOM from 'react-dom'
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

  // Close on backdrop click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const content = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
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

  return ReactDOM.createPortal(content, document.body)
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
// ── useSortPage — shared sort + pagination hook ───────────────────────────────
export function useSortPage(data, defaultSort, pageSize = 15) {
  const [sortKey, setSortKey] = React.useState(defaultSort?.key || '')
  const [sortDir, setSortDir] = React.useState(defaultSort?.dir || 'asc')
  const [page,    setPage]    = React.useState(1)

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      let av = a[sortKey] ?? ''
      let bv = b[sortKey] ?? ''
      // numeric check
      const an = parseFloat(av), bn = parseFloat(bv)
      if (!isNaN(an) && !isNaN(bn)) { av = an; bv = bn }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  // reset page when data length changes (e.g. filter applied upstream)
  React.useEffect(() => { setPage(1) }, [data.length])
  React.useEffect(() => { setPage(1) }, [pageSize])

  return { paged, sorted, sortKey, sortDir, toggleSort, page: safePage, setPage, totalPages }
}

// ── SortTh — sortable <th> ────────────────────────────────────────────────────
export function SortTh({ label, sortKey, active, dir, onSort, style }) {
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, gap: 1, opacity: active ? 1 : 0.3, marginLeft: 2 }}>
          <svg width="7" height="5" viewBox="0 0 7 5" fill={active && dir === 'asc' ? 'var(--accent)' : 'currentColor'}><path d="M3.5 0L7 5H0z"/></svg>
          <svg width="7" height="5" viewBox="0 0 7 5" fill={active && dir === 'desc' ? 'var(--accent)' : 'currentColor'}><path d="M3.5 5L0 0h7z"/></svg>
        </span>
      </span>
    </th>
  )
}

// ── Pagination ────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

export function Pagination({ page, totalPages, onPage, total, pageSize, onPageSizeChange }) {
  if (!total) return null
  const start     = (page - 1) * pageSize + 1
  const end       = Math.min(page * pageSize, total)
  const multiPage = totalPages > 1
  const nums  = new Set([1, totalPages, page, page - 1, page + 1].filter(n => n >= 1 && n <= totalPages))
  const pages = [...nums].sort((a, b) => a - b)

  const navBtn = (label, disabled, onClick) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '4px 9px', border: '1px solid var(--border)', borderRadius: 6,
      background: 'var(--surface)', fontSize: 12, lineHeight: 1,
      color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1,
    }}>{label}</button>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', borderTop: '1px solid var(--border-light)',
      fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
      flexWrap: 'wrap', gap: 8,
    }}>
      <span>Showing <strong style={{ color: 'var(--text-secondary)' }}>{start}–{end}</strong> of <strong style={{ color: 'var(--text-secondary)' }}>{total}</strong></span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 8, fontSize: 11 }}>
            <span>Show</span>
            <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} style={{
              padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--surface)', fontSize: 11.5, color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        {multiPage && (
          <>
            {navBtn('«', page === 1,          () => onPage(1))}
            {navBtn('‹', page === 1,          () => onPage(page - 1))}
            {pages.map((p, i) => {
              const gap = i > 0 && p - pages[i - 1] > 1
              return (
                <React.Fragment key={p}>
                  {gap && <span style={{ padding: '0 2px' }}>…</span>}
                  <button onClick={() => onPage(p)} style={{
                    padding: '4px 9px', minWidth: 30, border: '1px solid var(--border)', borderRadius: 6,
                    background: p === page ? 'var(--accent)' : 'var(--surface)',
                    color:      p === page ? '#fff' : 'var(--text-secondary)',
                    borderColor:p === page ? 'var(--accent)' : 'var(--border)',
                    cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 700 : 400,
                    transition: 'all 0.13s',
                  }}>{p}</button>
                </React.Fragment>
              )
            })}
            {navBtn('›', page === totalPages, () => onPage(page + 1))}
            {navBtn('»', page === totalPages, () => onPage(totalPages))}
          </>
        )}
      </div>
    </div>
  )
}

// ── DatePicker ─────────────────────────────────────────────────────
const DP_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DP_DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su']

export function DatePicker({ value, onChange, placeholder = 'Select date…' }) {
  const [open, setOpen]           = React.useState(false)
  const ref                       = React.useRef()
  const portalRef                 = React.useRef()
  const selected                  = value ? new Date(value + 'T00:00:00') : null
  const init                      = selected || new Date()
  const [viewYear,  setViewYear]  = React.useState(init.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(init.getMonth())

  React.useEffect(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date()
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }, [value])

  React.useEffect(() => {
    function handle(e) {
      const inTrigger = ref.current && ref.current.contains(e.target)
      const inPortal  = portalRef.current && portalRef.current.contains(e.target)
      if (!inTrigger && !inPortal) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const display = selected
    ? selected.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  function buildDays(year, month) {
    const first = new Date(year, month, 1)
    const last  = new Date(year, month + 1, 0)
    let dow     = first.getDay(); dow = dow === 0 ? 6 : dow - 1
    const days  = []
    for (let i = 0; i < dow; i++) days.push({ date: new Date(year, month, i - dow + 1), cur: false })
    for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(year, month, d), cur: true })
    const pad = 7 - (days.length % 7)
    if (pad < 7) for (let d = 1; d <= pad; d++) days.push({ date: new Date(year, month + 1, d), cur: false })
    return days
  }

  const days  = buildDays(viewYear, viewMonth)
  const today = new Date()

  function selectDay(date) {
    onChange([date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-'))
    setOpen(false)
  }
  function prevMonth() { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }
  function nextMonth() { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }

  const arrowBtn = (lbl, fn) => (
    <button onClick={fn} style={{
      width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)', borderRadius:6, background:'var(--bg)',
      cursor:'pointer', fontSize:14, color:'var(--text-secondary)',
    }}>{lbl}</button>
  )

  const rect = open && ref.current ? ref.current.getBoundingClientRect() : null

  return (
    <div ref={ref} style={{ position:'relative', width:'100%' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:8, width:'100%', boxSizing:'border-box',
        border: open ? '1.5px solid var(--accent)' : '1.5px solid #d2cec6',
        borderRadius:'var(--r-sm)', padding:'10px 13px', background:'#fff', cursor:'pointer',
        boxShadow: open ? '0 0 0 3px var(--accent-glow)' : '0 1px 3px rgba(14,17,23,0.04)',
        transition:'border-color 0.15s, box-shadow 0.15s', lineHeight:'1.45',
      }}>
        <span style={{ flex:1, fontSize:13.5, fontFamily:'var(--font-sans)', color:display?'var(--text-primary)':'var(--text-muted)' }}>
          {display || placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      {open && rect && ReactDOM.createPortal(
        <div ref={portalRef} style={{
          position:'fixed', top: rect.bottom + 6, left: rect.left, zIndex:9999,
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--r-lg)', boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
          padding:'14px', width:268,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            {arrowBtn('‹', prevMonth)}
            <span style={{ fontWeight:700, fontSize:13.5, color:'var(--text-primary)' }}>
              {DP_MONTHS[viewMonth]} {viewYear}
            </span>
            {arrowBtn('›', nextMonth)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {DP_DAYS.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', padding:'2px 0', fontFamily:'var(--font-mono)' }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {days.map((d, i) => {
              const isSel   = selected && d.date.toDateString() === selected.toDateString()
              const isToday = d.date.toDateString() === today.toDateString()
              return (
                <button key={i} onClick={() => selectDay(d.date)}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg)' }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                  style={{
                    width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center',
                    border: isToday && !isSel ? '1.5px solid var(--accent)' : '1px solid transparent',
                    borderRadius:'50%', cursor:'pointer', fontSize:12,
                    background: isSel ? 'var(--accent)' : 'transparent',
                    color: isSel ? '#fff' : d.cur ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isSel || isToday ? 700 : 400, opacity: d.cur ? 1 : 0.35,
                    transition:'background 0.1s',
                  }}>
                  {d.date.getDate()}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
