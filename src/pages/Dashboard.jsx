import React from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtDate } from '../data/mockData'
import { DonutChart, MultiSegBar } from '../components/UI'
import {
  Package, Truck, FlaskConical, FileText,
  AlertTriangle, CheckCircle2, Clock, TriangleAlert,
} from 'lucide-react'

function KPICard({ icon: Icon, value, label, sub, color, bg, onClick, delay = 0 }) {
  return (
    <div className="kpi-card anim-slide-up" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', animationDelay: `${delay}ms` }}>
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

function BatchBox({ icon: Icon, value, label, sub, bg, border, iconColor, valueColor }) {
  return (
    <div style={{
      padding: '13px 16px', borderRadius: 'var(--r-sm)', background: bg,
      border: `1px solid ${border}`, borderLeft: `3px solid ${iconColor}`,
      transition: 'transform 200ms, box-shadow 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Icon size={14} color={iconColor} strokeWidth={2} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: valueColor, lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  )
}

function AlertItem({ alert }) {
  const isRed = alert.severity === 'red'
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      marginBottom: 12, paddingBottom: 12,
      borderBottom: '1px solid var(--border-light)',
    }}>
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

function ReportRow({ r }) {
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

export default function Dashboard({ batches, bottles, reports, alerts }) {
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

      {/* KPI Row */}
      <div className="grid-4 mb-6">
        <KPICard delay={0}   icon={Package}      value={emptyAtCust} label="Empty at Customer" sub={`${collectedCust} collected · not sent`}         color="#6b7280"        bg="rgba(107,114,128,0.08)" onClick={() => navigate('/portal')} />
        <KPICard delay={60}  icon={Truck}         value={inTransit}   label="In Transit"        sub="Sent to VPS · not yet received"                    color="var(--amber)"   bg="rgba(201,122,6,0.08)"    onClick={() => navigate('/lab')} />
        <KPICard delay={120} icon={FlaskConical}  value={inLab}       label="In Lab"            sub={tested > 0 ? `${tested} tested · pending report` : 'All processed'} color="var(--purple)"  bg="rgba(103,48,194,0.08)"  onClick={() => navigate('/lab')} />
        <KPICard delay={180} icon={FileText}      value={reports.length} label="Reports Generated" sub={`${reports.filter(r => r.status === 'Issued').length} issued to customers`} color="var(--green)" bg="rgba(10,124,82,0.08)" onClick={() => navigate('/reports')} />
      </div>

      {/* Middle Row */}
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
            <BatchBox icon={Clock}        value={pendingAck}  label="Awaiting Acknowledgement" sub="Customer has not confirmed receipt"   bg="#fef2f2" border="#fecaca" iconColor="var(--red)"   valueColor="var(--red)" />
            <BatchBox icon={CheckCircle2} value={received}    label="Received — Active"         sub="Bottles in collection stages"         bg="#f0fdf4" border="#a7f3d0" iconColor="var(--green)" valueColor="var(--green)" />
            <BatchBox icon={TriangleAlert} value={withIssues} label="With Issues"               sub="Requires staff attention"             bg="#eff6ff" border="#bfdbfe" iconColor="var(--blue)"  valueColor="var(--blue)" />
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

      {/* Bottom Row */}
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
            reports.map(r => <ReportRow key={r.id} r={r} />)
          )}
        </div>
      </div>
    </div>
  )
}
