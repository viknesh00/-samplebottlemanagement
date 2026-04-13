import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtDate } from '../data/mockData'
import { DonutChart, MultiSegBar } from '../components/UI'
import {
  Package, Truck, FlaskConical, FileText,
  AlertTriangle, CheckCircle2, Clock, TriangleAlert,
  ClipboardList, Inbox, ChevronDown, ChevronRight,
  ArrowRight, Bell,
} from 'lucide-react'
import * as Icons from '../components/Icons'

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
function KPICard({ icon: Icon, value, label, sub, color, bg, onClick, delay = 0 }) {
  return (
    <div className="kpi-card anim-slide-up"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', animationDelay: `${delay}ms` }}>
      <div className="kpi-accent-line" style={{ background: color }} />
      <div className="kpi-icon" style={{ background: bg, color }}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <div className="kpi-value" style={{ color }}>{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}

/* ── Batch Box ────────────────────────────────────────────────────────────── */
function BatchBox({ icon: Icon, value, label, sub, iconColor }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 'var(--r-sm)',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${iconColor}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--r-xs)', background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: iconColor, lineHeight: 1, flexShrink: 0 }}>{value}</div>
    </div>
  )
}

/* ── Alert Item ───────────────────────────────────────────────────────────── */
function AlertItem({ alert }) {
  const isRed = alert.severity === 'red'
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ color: isRed ? 'var(--red)' : 'var(--amber)', flexShrink: 0, marginTop: 1 }}>
        <AlertTriangle size={14} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}>
          {alert.customer?.split(' ').slice(0, 2).join(' ')}
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-muted)', marginLeft: 6 }}>{alert.batch}</span>
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.45, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.msg?.slice(0, 72)}{alert.msg?.length > 72 ? '…' : ''}
        </div>
      </div>
      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>{alert.age}</span>
    </div>
  )
}

/* ── Report Row ───────────────────────────────────────────────────────────── */
function ReportRow({ r, bottles = [] }) {
  const resultBadge = r.result === 'Normal' ? 'badge-green' : r.result === 'Warning' ? 'badge-amber' : 'badge-red'
  const statusBadge = r.status === 'Issued' ? 'badge-green' : 'badge-blue'
  return (
    <div className="info-row">
      <div>
        <span className="mono text-accent" style={{ fontSize: 10.5, fontWeight: 700 }}>{r.id}</span>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
          {r.customer?.split(' ').slice(0, 2).join(' ')} · {r.bottleIds?.length} btl · {fmtDate(r.date)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className={`badge ${resultBadge}`}>{r.result}</span>
        <span className={`badge ${statusBadge}`}>{r.status}</span>
      </div>
    </div>
  )
}

/* ── Pending Request Card ─────────────────────────────────────────────────── */
function PendingRequestCard({ req, onViewInBatches }) {
  const [expanded, setExpanded] = useState(false)
  const priorityColor = req.priority === 'urgent' ? 'var(--red)' : req.priority === 'high' ? 'var(--amber)' : 'var(--blue)'
  const priorityBg    = req.priority === 'urgent' ? 'rgba(212,42,42,0.07)' : req.priority === 'high' ? 'rgba(201,122,6,0.07)' : 'rgba(31,94,196,0.07)'

  return (
    <div style={{
      borderRadius: 'var(--r)',
      border: `1px solid ${priorityColor}30`,
      borderLeft: `3px solid ${priorityColor}`,
      background: 'var(--surface)',
      overflow: 'hidden',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', cursor: 'pointer',
          background: expanded ? priorityBg : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--r-xs)',
          background: priorityBg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <ClipboardList size={16} color={priorityColor} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>
              {req.customer?.split(' ').slice(0, 3).join(' ')}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
              background: priorityBg, color: priorityColor,
              border: `1px solid ${priorityColor}40`,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>{req.priority}</span>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{req.id}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {req.sampleType} · {req.qty} bottles · Requested {fmtDate(req.requestedDate)}
          </div>
        </div>
        <ChevronDown size={15} color="var(--text-muted)" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${priorityColor}20` }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px',
            padding: '12px 0', fontSize: 12,
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: 10.5, display: 'block', marginBottom: 2 }}>Sample Type</span>
              <span style={{ fontWeight: 600 }}>{req.sampleType}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: 10.5, display: 'block', marginBottom: 2 }}>Bottles Requested</span>
              <span style={{ fontWeight: 700, color: priorityColor, fontSize: 14, fontFamily: 'var(--font-display)' }}>{req.qty}</span>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10.5, display: 'block', marginBottom: 2 }}>Collection Location</span>
              <span style={{ fontWeight: 600 }}>{req.location || '—'}</span>
            </div>
            {req.notes && (
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10.5, display: 'block', marginBottom: 2 }}>Notes</span>
                <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{req.notes}</span>
              </div>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: 4 }}
            onClick={(e) => { e.stopPropagation(); onViewInBatches() }}
          >
            <ArrowRight size={13} strokeWidth={2} />
            Approve / Reject in Batches
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
export default function Dashboard({ batches, bottles, reports, alerts, batchRequests = [], setBatchRequests, setBatches }) {
  const navigate = useNavigate()

  const emptyAtCust   = bottles.filter(b => b.status === 'Empty').length
  const collectedCust = bottles.filter(b => b.status === 'Collected').length
  const inTransit     = bottles.filter(b => b.status === 'Sent to VPS').length
  const inLab         = bottles.filter(b => b.status === 'In Lab').length
  const tested        = bottles.filter(b => b.status === 'Tested').length
  const reportReady   = bottles.filter(b => b.status === 'Report Ready').length
  const totalBottles  = bottles.length
  const pendingAck    = batches.filter(b => b.stage === 0).length
  const received      = batches.filter(b => b.stage === 1).length
  const withIssues    = batches.filter(b => b.issues?.length > 0).length
  const activeBatches = batches.filter(b => b.stage === 1)

  const pendingRequests = batchRequests.filter(r => r.status === 'Pending')

  const donut = [
    { label: 'Empty at Customer', value: emptyAtCust,   color: '#d1d5db' },
    { label: 'Collected',         value: collectedCust,  color: '#60a5fa' },
    { label: 'In Transit',        value: inTransit,      color: '#f59e0b' },
    { label: 'In Lab',            value: inLab,          color: '#8b5cf6' },
    { label: 'Tested',            value: tested,         color: '#06b6d4' },
    { label: 'Report Ready',      value: reportReady,    color: '#10b981' },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">Overview</div>
          <div className="page-header-title">Operations Dashboard</div>
          <div className="page-header-sub">Live tracking across all batches and lab activity</div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid-4 mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KPICard delay={0}   icon={Inbox}       value={batchRequests.length}  label="Customer Requests"  sub={`${pendingRequests.length} pending · ${batchRequests.filter(r => r.status === 'Approved').length} approved`} color="var(--blue)"   bg="rgba(31,94,196,0.08)"   onClick={() => navigate('/batches')} />
        <KPICard delay={40}  icon={Package}     value={emptyAtCust}           label="Empty at Customer"  sub={`${collectedCust} collected · not sent`}                                                                       color="#6b7280"       bg="rgba(107,114,128,0.08)" onClick={() => navigate('/portal')} />
        <KPICard delay={80}  icon={Truck}       value={inTransit}             label="In Transit"         sub="Sent to VPS · not yet received"                                                                                color="var(--amber)"  bg="rgba(201,122,6,0.08)"   onClick={() => navigate('/lab')} />
        <KPICard delay={120} icon={FlaskConical} value={inLab}                label="In Lab"             sub={tested > 0 ? `${tested} tested · pending report` : 'All processed'}                                           color="var(--purple)" bg="rgba(103,48,194,0.08)"  onClick={() => navigate('/lab')} />
        <KPICard delay={160} icon={FileText}    value={reports.length}        label="Reports Generated"  sub={`${reports.filter(r => r.status === 'Issued').length} issued to customers`}                                   color="var(--green)"  bg="rgba(10,124,82,0.08)"   onClick={() => navigate('/reports')} />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid-3 mb-6">
        <div className="card anim-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="card-header">
            <span className="card-title">Bottle Status</span>
            <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{totalBottles} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <DonutChart segments={donut} size={130} thickness={22} centerLabel={totalBottles} centerSub="bottles" />
            <div style={{ width: '100%' }}>
              {donut.map(item => (
                <div key={item.label} className="info-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card anim-slide-up" style={{ animationDelay: '290ms' }}>
          <div className="card-header">
            <span className="card-title">Batch Status</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/batches')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BatchBox icon={Clock}         value={pendingAck} label="Awaiting Acknowledgement" sub="Customer has not confirmed receipt"  iconColor="var(--red)"   />
            <BatchBox icon={CheckCircle2}  value={received}   label="Received — Active"         sub="Bottles in collection stages"        iconColor="var(--green)" />
            <BatchBox icon={TriangleAlert} value={withIssues} label="With Issues"               sub="Requires staff attention"            iconColor="var(--blue)"  />
          </div>
        </div>

        <div className="card anim-slide-up" style={{ animationDelay: '340ms' }}>
          <div className="card-header">
            <span className="card-title">Active Alerts</span>
            {alerts.length > 0 && <span className="badge badge-red">{alerts.length}</span>}
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={26} style={{ margin: '0 auto 10px', opacity: 0.2, display: 'block' }} strokeWidth={1.5} />
              <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>All Clear</div>
            </div>
          ) : (
            <>
              {alerts.slice(0, 4).map(a => <AlertItem key={a.id} alert={a} />)}
              {alerts.length > 4 && (
                <button className="btn btn-ghost btn-sm w-full" onClick={() => navigate('/alerts')}>
                  View All {alerts.length} Alerts
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid-2 mb-6" style={{ gap: 18 }}>
        <div className="card anim-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="card-header">
            <span className="card-title">Bottle Progress by Batch</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/batches')}>All Batches</button>
          </div>
          {activeBatches.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>No received batches yet.</div>
          ) : (
            activeBatches.map(b => (
              <MultiSegBar key={b.id} batchId={b.id} bottles={bottles} label={`${b.id} — ${b.customer.split(' ').slice(0, 2).join(' ')}`} />
            ))
          )}
        </div>

        <div className="card anim-slide-up" style={{ animationDelay: '450ms' }}>
          <div className="card-header">
            <span className="card-title">Recent Reports</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>All</button>
          </div>
          {reports.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>No reports yet.</div>
          ) : (
            reports.map(r => <ReportRow key={r.id} r={r} bottles={bottles} />)
          )}
        </div>
      </div>
    </div>
  )
}
