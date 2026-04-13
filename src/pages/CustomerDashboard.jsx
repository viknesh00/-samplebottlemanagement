import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtDate, today, SAMPLE_TYPES, bottleStats } from '../data/mockData'
import { Modal } from '../components/UI'
import {
  Package, Truck, FlaskConical, FileText, Check,
  Clock, ChevronRight, ArrowRight, Info,
} from 'lucide-react'
import * as Icons from '../components/Icons'

const STATUS_STEPS = [
  { key: 'Empty',        label: 'Bottles Received',  Icon: Package,      color: '#6b7280' },
  { key: 'Collected',    label: 'Samples Collected',  Icon: FlaskConical, color: '#2563eb' },
  { key: 'Sent to VPS',  label: 'Sent to VPS Lab',   Icon: Truck,        color: '#d97706' },
  { key: 'In Lab',       label: 'In Lab Testing',     Icon: FlaskConical, color: '#7c3aed' },
  { key: 'Tested',       label: 'Testing Complete',   Icon: Check,        color: '#0891b2' },
  { key: 'Report Ready', label: 'Report Ready',       Icon: FileText,     color: '#059669' },
]

/* ── Request Batch Modal ─────────────────────────────────────────────────────── */
function RequestBatchModal({ customerName, onClose, onSubmit }) {
  const [form, setForm] = useState({
    sampleType: 'Transformer Oil', qty: 12, location: '', notes: '', priority: 'normal', urgentReason: '',
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function submit() {
    if (!form.location.trim()) return
    onSubmit({ ...form, customer: customerName, requestedDate: today(), id: `REQ-${Date.now()}`, status: 'Pending' })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Request New Sample Batch from VPS Lab"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!form.location.trim()}>
            <Check size={14} strokeWidth={2.5} /> Submit Request
          </button>
        </>
      }
    >
      <div className="alert alert-blue" style={{ marginBottom: 20 }}>
        <FlaskConical size={15} strokeWidth={1.8} />
        <span style={{ fontSize: 12.5 }}>VPS Lab will review your request and dispatch bottles within 1–2 business days.</span>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>Sample Type *</label>
          <select value={form.sampleType} onChange={e => up('sampleType', e.target.value)}>
            {SAMPLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Number of Bottles *</label>
          <input type="number" min={1} max={100} value={form.qty} onChange={e => up('qty', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => up('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Collection Location / Site *</label>
        <input type="text" value={form.location} onChange={e => up('location', e.target.value)} placeholder="e.g. Transformer Bay A, Substation 2" />
      </div>
      {form.priority === 'urgent' && (
        <div className="form-group">
          <label>Reason for Urgency</label>
          <input type="text" value={form.urgentReason} onChange={e => up('urgentReason', e.target.value)} placeholder="Brief reason…" />
        </div>
      )}
      <div className="form-group">
        <label>Additional Notes</label>
        <textarea value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Special instructions, preferred delivery date, etc." rows={3} />
      </div>
    </Modal>
  )
}

/* ── Stat Card ───────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, sub, color, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '18px 20px', borderRadius: 'var(--r-lg)', background: bg || '#fff',
        border: '1.5px solid var(--border)', borderLeft: `4px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 'var(--r-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, lineHeight: 1, color }}>{value}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {onClick && <ChevronRight size={16} color={color} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </div>
  )
}

/* ── Pipeline Bar ─────────────────────────────────────────────────────────────── */
function PipelineBar({ bottles }) {
  const totals = { Empty: 0, Collected: 0, 'Sent to VPS': 0, 'In Lab': 0, Tested: 0, 'Report Ready': 0 }
  bottles.forEach(b => { if (totals[b.status] !== undefined) totals[b.status]++ })
  const total = bottles.length || 1

  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', marginBottom: 10, gap: 1 }}>
        {STATUS_STEPS.map(s => {
          const pct = (totals[s.key] / total) * 100
          return pct > 0 ? (
            <div key={s.key} style={{ width: `${pct}%`, background: s.color, transition: 'width 0.5s' }} title={`${s.label}: ${totals[s.key]}`} />
          ) : null
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
        {STATUS_STEPS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totals[s.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Request History Table ───────────────────────────────────────────────────── */
function RequestHistoryTable({ myRequests }) {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { key: 'all',      label: 'All',      count: myRequests.length },
    { key: 'Pending',  label: 'Pending',  count: myRequests.filter(r => r.status === 'Pending').length },
    { key: 'Approved', label: 'Approved', count: myRequests.filter(r => r.status === 'Approved').length },
    { key: 'Rejected', label: 'Rejected', count: myRequests.filter(r => r.status === 'Rejected').length },
  ]

  const filtered = activeTab === 'all' ? myRequests : myRequests.filter(r => r.status === activeTab)

  const statusStyle = {
    Pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    Approved:  { bg: '#f0fdf4', color: '#059669', border: '#a7f3d0' },
    Rejected:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    Fulfilled: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  }

  if (myRequests.length === 0) return null

  return (
    <div className="card mb-6">
      <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
        <span className="card-title">Batch Request History</span>
        <span className="badge badge-gray">{myRequests.length}</span>
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '0', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 14px', fontSize: 11.5, fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === t.key ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s', marginBottom: -1,
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 10,
                background: activeTab === t.key ? 'var(--accent)' : 'var(--border-dark)',
                color: activeTab === t.key ? '#fff' : 'var(--text-muted)',
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>No {activeTab} requests.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Request ID', 'Sample Type', 'Qty', 'Location', 'Priority', 'Requested', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const s = statusStyle[r.status] || statusStyle.Pending
                return (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{r.id || `REQ-${i + 1}`}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{r.sampleType}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.qty}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.location || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'capitalize',
                        background: r.priority === 'urgent' ? '#fef2f2' : r.priority === 'high' ? '#fffbeb' : 'var(--bg)',
                        color: r.priority === 'urgent' ? '#dc2626' : r.priority === 'high' ? '#d97706' : 'var(--text-muted)',
                        border: `1px solid ${r.priority === 'urgent' ? '#fecaca' : r.priority === 'high' ? '#fde68a' : 'var(--border)'}`,
                      }}>{r.priority || 'normal'}</span>
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(r.requestedDate)}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>{r.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Main Customer Dashboard ─────────────────────────────────────────────────── */
export default function CustomerDashboard({ batches, bottles, reports, batchRequests, setBatchRequests, customerName }) {
  const navigate = useNavigate()

  const activeBatches = batches.filter(b => b.stage === 0).length
  const inTransit     = bottles.filter(b => b.status === 'Sent to VPS').length
  const inLab         = bottles.filter(b => b.status === 'In Lab').length
  const reportReady   = bottles.filter(b => b.status === 'Report Ready').length
  const issuedReports = reports.filter(r => r.status === 'Issued')

  const myRequests   = batchRequests.filter(r => r.customer === customerName)
  const pendingReqs  = myRequests.filter(r => r.status === 'Pending')
  const approvedReqs = myRequests.filter(r => r.status === 'Approved')

  const hasPendingRequest = pendingReqs.length > 0
  const [showRequestModal, setShowRequestModal] = useState(false)

  function handleRequest(req) { setBatchRequests(p => [...p, req]) }

  const latestBatch = [...batches].sort((a, b) => new Date(b.dispatched) - new Date(a.dispatched))[0]
  const latestStats = latestBatch ? bottleStats(latestBatch.id, bottles) : null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-header-tag">Customer Portal</div>
          <div className="page-header-title">My Dashboard</div>
          <div className="page-header-sub">{customerName} — Sample tracking overview</div>
        </div>
      </div>

      {/* Pending request notification */}
      {pendingReqs.length > 0 && (
        <div style={{
          padding: '14px 18px', borderRadius: 'var(--r)', marginBottom: 20,
          background: '#fef3c7', border: '1.5px solid #fde68a',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'rgba(201,122,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={18} color="#92400e" strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>Your batch request is awaiting VPS Lab approval</div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>{pendingReqs[0].qty} × {pendingReqs[0].sampleType} · {pendingReqs[0].location}</div>
            <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>You can submit a new request once this one is approved or rejected.</div>
          </div>
          <span style={{ fontSize: 11, color: '#a16207', fontFamily: 'var(--font-mono)' }}>{fmtDate(pendingReqs[0]?.requestedDate)}</span>
        </div>
      )}

      {approvedReqs.length > 0 && (
        <div style={{
          padding: '14px 18px', borderRadius: 'var(--r)', marginBottom: 20,
          background: '#f0fdf4', border: '1.5px solid #a7f3d0',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'rgba(10,124,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={18} color="#065f46" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#065f46' }}>Batch request approved! Bottles are being dispatched.</div>
            <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>Check My Batches to acknowledge receipt.</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--green)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => navigate('/portal')}>
            View Batches <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid-4 mb-6">
        <StatCard icon={Package}      value={activeBatches} label="Pending Acknowledgement" sub="Tap to acknowledge"    color="#d97706" bg="#fffbeb" onClick={() => navigate('/portal')} />
        <StatCard icon={Truck}        value={inTransit}     label="Bottles In Transit"      sub="On the way to VPS Lab" color="#7c3aed" bg="#f5f3ff" onClick={() => navigate('/portal')} />
        <StatCard icon={FlaskConical} value={inLab}         label="Bottles In Lab"          sub="Being tested at VPS"   color="#0891b2" bg="#ecfeff" />
        <StatCard icon={FileText}     value={issuedReports.length} label="Reports Available" sub={reportReady > 0 ? `${reportReady} bottles report ready` : ''} color="#059669" bg="#f0fdf4" onClick={() => navigate('/portal')} />
      </div>

      {/* Middle section */}
      <div className="grid-2 mb-6" style={{ gap: 18 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Latest Batch Progress</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/portal')}>All Batches</button>
          </div>
          {latestBatch ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: '#faf8f5', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{latestBatch.id}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{latestBatch.sampleType} · {latestBatch.qty} bottles</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Dispatched {fmtDate(latestBatch.dispatched)} · {latestBatch.courier}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {latestBatch.stage === 0 ? (
                    <span style={{ padding: '4px 10px', borderRadius: 20, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, border: '1px solid #fde68a' }}>Awaiting ACK</span>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: 20, background: '#f0fdf4', color: '#065f46', fontSize: 11, fontWeight: 700, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={11} strokeWidth={2.5} /> Received
                    </span>
                  )}
                </div>
              </div>
              {latestStats && <PipelineBar bottles={bottles.filter(b => b.batchId === latestBatch.id)} />}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
              <Package size={28} strokeWidth={1.5} style={{ margin: '0 auto 10px', opacity: 0.2, display: 'block' }} />
              <div style={{ fontSize: 13 }}>No batches yet</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Request a new batch to get started.</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">All Bottles Pipeline</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{bottles.length} total</span>
          </div>
          {bottles.length > 0 ? (
            <>
              <PipelineBar bottles={bottles} />
              <div style={{ marginTop: 20 }}>
                {batches.map(b => {
                  const s = bottleStats(b.id, bottles)
                  const pctDone = s.total ? Math.round(((s.tested + s.reportReady) / s.total) * 100) : 0
                  return (
                    <div key={b.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{b.id}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{pctDone}% complete</span>
                      </div>
                      <div style={{ height: 8, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pctDone}%`, background: 'var(--green)', borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: 13 }}>No bottles tracked yet</div>
          )}
        </div>
      </div>

      {/* Reports */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">My Reports</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{issuedReports.length} total</span>
        </div>
        {issuedReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
            No reports yet — reports will appear here once testing is complete.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {issuedReports.map(r => {
              const rc = r.result === 'Normal'
                ? { bg: '#f0fdf4', color: '#059669', border: '#a7f3d0' }
                : r.result === 'Warning'
                  ? { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
                  : { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }
              return (
                <div key={r.id} style={{ padding: '14px 16px', borderRadius: 'var(--r)', border: `1.5px solid ${rc.border}`, background: rc.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: rc.color }}>{r.id}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fff', border: `1px solid ${rc.border}`, color: rc.color, fontWeight: 700 }}>{r.result}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{r.testType}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>{fmtDate(r.date)} · {r.technician} · {r.bottleIds?.length} bottles</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.recommendation?.slice(0, 100)}{r.recommendation?.length > 100 ? '…' : ''}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RequestHistoryTable myRequests={myRequests} />

      {showRequestModal && !hasPendingRequest && (
        <RequestBatchModal
          customerName={customerName}
          onClose={() => setShowRequestModal(false)}
          onSubmit={req => { handleRequest(req); setShowRequestModal(false) }}
        />
      )}
    </div>
  )
}
