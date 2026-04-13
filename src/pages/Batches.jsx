import React, { useState } from 'react'
import { COURIERS, SAMPLE_TYPES, fmtDate, today, daysSince } from '../data/mockData'
import { Modal, SearchBar, SegBar, PriorityBadge } from '../components/UI'
import * as Icons from '../components/Icons'

// ── New Batch Form ─────────────────────────────────────────────────────────────
function BatchForm({ customers, onSave, onClose }) {
  const [form, setForm] = useState({
    customer: '', contact: '', qty: 10, courier: 'BlueDart', awb: '',
    location: '', notes: '', priority: 'normal', sampleType: 'Transformer Oil', dispatched: today()
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const autoContact = customers.find(c => c.name === form.customer)?.contact || ''

  function handleSave() {
    if (!form.customer) return
    const year = new Date().getFullYear()
    onSave({
      id: `VPS-${year}-${String(Math.floor(Math.random() * 900 + 100))}`,
      ...form,
      contact: form.contact || autoContact,
      stage: 0, receivedDate: null, issues: []
    })
    onClose()
  }

  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label>Customer *</label>
          <select value={form.customer} onChange={e => up('customer', e.target.value)}>
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Contact Person</label>
          <input type="text" value={form.contact || autoContact} onChange={e => up('contact', e.target.value)} placeholder="Auto-filled from customer" />
        </div>
        <div className="form-group">
          <label>Sample Type</label>
          <select value={form.sampleType} onChange={e => up('sampleType', e.target.value)}>
            {SAMPLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Bottle Quantity</label>
          <input type="number" min={1} max={200} value={form.qty} onChange={e => up('qty', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => up('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="form-group">
          <label>Courier</label>
          <select value={form.courier} onChange={e => up('courier', e.target.value)}>
            {COURIERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>AWB / Tracking No.</label>
          <input type="text" value={form.awb} onChange={e => up('awb', e.target.value)} placeholder="Tracking number" />
        </div>
        <div className="form-group">
          <label>Dispatch Date</label>
          <input type="date" value={form.dispatched} onChange={e => up('dispatched', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Collection Location</label>
        <input type="text" value={form.location} onChange={e => up('location', e.target.value)} placeholder="e.g. Transformer Bay A" />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Special instructions…" />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={!form.customer}>
          <Icons.Plus /> Create Batch
        </button>
      </div>
    </>
  )
}

// ── Approve Request Modal ──────────────────────────────────────────────────────
function ApproveRequestModal({ request, onClose, onApprove }) {
  const [form, setForm] = useState({
    courier: 'BlueDart', awb: '', dispatched: today(),
    qty: request.qty, notes: '',
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal open onClose={onClose} title={`Approve Request — ${request.customer?.split(' ').slice(0,2).join(' ')}`}>
      {/* Request summary */}
      <div style={{ padding:'12px 14px', borderRadius:'var(--r)', background:'#f0fdf4', border:'1px solid #a7f3d0', marginBottom:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--green)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Customer Request Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 20px', fontSize:12.5 }}>
          <div><span style={{color:'var(--text-muted)'}}>Customer:</span> <strong>{request.customer?.split(' ').slice(0,3).join(' ')}</strong></div>
          <div><span style={{color:'var(--text-muted)'}}>Requested Qty:</span> <strong>{request.qty} bottles</strong></div>
          <div><span style={{color:'var(--text-muted)'}}>Sample Type:</span> <strong>{request.sampleType}</strong></div>
          <div><span style={{color:'var(--text-muted)'}}>Priority:</span> <strong style={{textTransform:'capitalize'}}>{request.priority}</strong></div>
          <div style={{gridColumn:'1/-1'}}><span style={{color:'var(--text-muted)'}}>Location:</span> <strong>{request.location}</strong></div>
          {request.notes && <div style={{gridColumn:'1/-1'}}><span style={{color:'var(--text-muted)'}}>Notes:</span> {request.notes}</div>}
        </div>
      </div>

      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Dispatch Details</div>
      <div className="grid-2">
        <div className="form-group">
          <label>Bottles to Dispatch</label>
          <input type="number" min={1} value={form.qty} onChange={e => up('qty', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Courier</label>
          <select value={form.courier} onChange={e => up('courier', e.target.value)}>
            {COURIERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>AWB / Tracking No. *</label>
          <input type="text" value={form.awb} onChange={e => up('awb', e.target.value)} placeholder="Required to approve" />
        </div>
        <div className="form-group">
          <label>Dispatch Date</label>
          <input type="date" value={form.dispatched} onChange={e => up('dispatched', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Staff Notes (optional)</label>
        <textarea value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Any notes for this dispatch…" rows={2} />
      </div>
      <div style={{ display:'flex', gap:10, justifyContent:'space-between', marginTop:16 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!form.awb.trim()} onClick={() => { onApprove(form); onClose() }}>
          <Icons.Check /> Approve & Dispatch
        </button>
      </div>
    </Modal>
  )
}

const TABS = [
  { key: 'all',      label: 'All'      },
  { key: 'active',   label: 'Active'   },
  { key: 'complete', label: 'Complete' },
  { key: 'issues',   label: 'Issues'   },
]

export default function Batches({ batches, setBatches, bottles, setBottles, customers, batchRequests = [], setBatchRequests }) {
  const [showCreate, setShowCreate] = useState(false)
  const [approveReq, setApproveReq] = useState(null)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('all')
  const [reqTab, setReqTab]          = useState('pending')

  const counts = {
    all:      batches.length,
    active:   batches.filter(b => b.stage === 0).length,
    complete: batches.filter(b => b.stage === 1).length,
    issues:   batches.filter(b => b.issues?.length > 0).length,
  }

  const filtered = batches
    .filter(b => {
      if (tab === 'active')   return b.stage === 0
      if (tab === 'complete') return b.stage === 1
      if (tab === 'issues')   return b.issues?.length > 0
      return true
    })
    .filter(b =>
      !search ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.sampleType.toLowerCase().includes(search.toLowerCase())
    )

  const pendingRequests = batchRequests.filter(r => r.status === 'Pending')
  const allReviewed     = batchRequests.filter(r => r.status !== 'Pending')
  const reqTabs = [
    { key: 'pending', label: 'Pending Approval', count: pendingRequests.length },
    { key: 'history', label: 'Request History',  count: allReviewed.length },
  ]
  const reqRows      = reqTab === 'pending' ? pendingRequests : allReviewed
  const statusColor  = { Approved: 'var(--green)', Rejected: 'var(--red)', Fulfilled: 'var(--blue)' }
  const statusBg     = { Approved: 'rgba(10,124,82,0.08)', Rejected: 'rgba(212,42,42,0.08)', Fulfilled: 'rgba(31,94,196,0.08)' }

  function createBatch(data) { setBatches(p => [data, ...p]) }

  function handleApprove(req, form) {
    const year = new Date().getFullYear()
    const newBatch = {
      id: `VPS-${year}-${String(Math.floor(Math.random() * 900 + 100))}`,
      customer: req.customer,
      contact: req.contactName || '',
      qty: form.qty,
      stage: 0,
      dispatched: form.dispatched,
      receivedDate: null,
      courier: form.courier,
      awb: form.awb,
      priority: req.priority,
      sampleType: req.sampleType,
      location: req.location,
      notes: (req.notes || '') + (form.notes ? ` | Staff: ${form.notes}` : ''),
      issues: [],
    }
    setBatches(p => [...p, newBatch])
    setBatchRequests(p => p.map(r => r.id === req.id
      ? { ...r, status: 'Approved', approvedDate: today(), batchId: newBatch.id }
      : r
    ))
  }

  function handleReject(reqId) {
    setBatchRequests(p => p.map(r => r.id === reqId
      ? { ...r, status: 'Rejected', rejectedDate: today() }
      : r
    ))
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">Operations</div>
          <div className="page-header-title">Batch Management</div>
          <div className="page-header-sub">Track every bottle from dispatch to report generation</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icons.Plus /> New Batch
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { value: batches.length,        label: 'Total Batches',      sub: 'All time',                   color: 'var(--accent)', bg: 'rgba(232,93,10,0.06)',  border: 'rgba(232,93,10,0.18)'  },
          { value: counts.active,         label: 'Awaiting Receipt',   sub: 'Dispatched · not received',  color: 'var(--amber)',  bg: 'rgba(201,122,6,0.06)',  border: 'rgba(201,122,6,0.18)'  },
          { value: counts.complete,       label: 'Received',           sub: 'Confirmed at lab',           color: 'var(--green)', bg: 'rgba(10,124,82,0.06)',  border: 'rgba(10,124,82,0.18)'  },
          { value: counts.issues,         label: 'With Issues',        sub: 'Requires attention',         color: 'var(--red)',   bg: 'rgba(212,42,42,0.06)',  border: 'rgba(212,42,42,0.18)'  },
          { value: pendingRequests.length, label: 'Customer Requests', sub: 'Pending your approval',      color: 'var(--blue)',  bg: 'rgba(31,94,196,0.06)',  border: 'rgba(31,94,196,0.18)'  },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 140px', padding: '13px 15px',
            borderRadius: 'var(--r-lg)', background: s.bg,
            border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.color}`,
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Customer Batch Requests — Professional Tabbed Card ── */}
      {batchRequests.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          {/* Card header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 0' }}>
            <span className="card-title">Customer Batch Requests</span>
            {pendingRequests.length > 0 && <span className="badge badge-blue">{pendingRequests.length} awaiting approval</span>}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:2, padding:'0 20px', borderBottom:'1px solid var(--border)', marginTop:8 }}>
            {reqTabs.map(t => (
              <button key={t.key} onClick={() => setReqTab(t.key)} style={{
                padding:'8px 14px', fontSize:11.5, fontWeight:600,
                background:'none', border:'none', cursor:'pointer',
                borderBottom: reqTab===t.key ? '2px solid var(--accent)' : '2px solid transparent',
                color: reqTab===t.key ? 'var(--accent)' : 'var(--text-muted)',
                display:'flex', alignItems:'center', gap:6, transition:'color 0.15s', marginBottom:-1,
              }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{
                    fontSize:9.5, fontWeight:700, padding:'1px 5px', borderRadius:10,
                    background: reqTab===t.key ? 'var(--accent)' : 'var(--border-dark)',
                    color: reqTab===t.key ? '#fff' : 'var(--text-muted)',
                  }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          {reqRows.length === 0 ? (
            <div style={{ padding:'24px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:12.5 }}>
              {reqTab === 'pending' ? 'No pending requests.' : 'No reviewed requests yet.'}
            </div>
          ) : reqTab === 'pending' ? (
            /* Pending — action rows */
            <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'14px 16px' }}>
              {pendingRequests.map(req => (
                <div key={req.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderRadius:'var(--r)', border:'1px solid var(--border)', background:'var(--surface)',
                  borderLeft: req.priority==='urgent' ? '3px solid var(--red)' : req.priority==='high' ? '3px solid var(--amber)' : '3px solid var(--border-dark)',
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>{req.customer?.split(' ').slice(0,3).join(' ')}</span>
                      <PriorityBadge priority={req.priority} />
                      <span className="mono" style={{ fontSize:9.5, color:'var(--text-muted)' }}>{req.id}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                      {req.sampleType} · {req.qty} bottles · {req.location?.slice(0,40)}{req.location?.length>40?'…':''}
                    </div>
                    <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:2 }}>
                      Requested {fmtDate(req.requestedDate)}{req.notes && <span style={{ marginLeft:8 }}>· {req.notes.slice(0,50)}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(req.id)}><Icons.X /> Reject</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setApproveReq(req)}><Icons.Check /> Approve</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* History — clean table */
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
                <thead>
                  <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                    {['Request ID','Customer','Sample Type','Qty','Location','Priority','Requested','Status','Linked Batch'].map(h => (
                      <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700,
                        textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allReviewed.map((r,i) => (
                    <tr key={r.id||i} style={{ borderBottom:'1px solid var(--border-light)', transition:'background 0.1s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}
                    >
                      <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)', fontWeight:700 }}>{r.id||`REQ-${i+1}`}</td>
                      <td style={{ padding:'10px 14px', fontWeight:600, whiteSpace:'nowrap' }}>{r.customer?.split(' ').slice(0,2).join(' ')}</td>
                      <td style={{ padding:'10px 14px' }}>{r.sampleType}</td>
                      <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontWeight:700 }}>{r.qty}</td>
                      <td style={{ padding:'10px 14px', color:'var(--text-secondary)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.location||'—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, textTransform:'capitalize',
                          background:r.priority==='urgent'?'#fef2f2':r.priority==='high'?'#fffbeb':'var(--bg)',
                          color:r.priority==='urgent'?'#dc2626':r.priority==='high'?'#d97706':'var(--text-muted)',
                          border:`1px solid ${r.priority==='urgent'?'#fecaca':r.priority==='high'?'#fde68a':'var(--border)'}`,
                        }}>{r.priority||'normal'}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{fmtDate(r.requestedDate)}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20,
                          background: statusBg[r.status]||'var(--bg)', color: statusColor[r.status]||'var(--text-muted)',
                          border:`1px solid ${statusColor[r.status]||'var(--border)'}30`, whiteSpace:'nowrap',
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)' }}>{r.batchId||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search batch ID, customer, sample type…" />
        </div>
        <div className="tab-bar">
          {TABS.map((t) => {
            const isActive = tab === t.key
            const isIssues = t.key === 'issues'
            return (
              <button
                key={t.key}
                className={`tab${isActive ? (isIssues ? ' active-issues' : ' active') : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className={isActive ? 'tab-count' : 'tab-count-inactive'}>{counts[t.key]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Batches Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Customer</th>
              <th>Sample Type</th>
              <th>Qty</th>
              <th>Dispatched</th>
              <th>Courier</th>
              <th>Stage</th>
              <th>Bottle Progress</th>
              <th>Priority</th>
              <th>Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const isReceived = b.stage === 1
              const days = b.dispatched ? daysSince(b.dispatched) : 0
              return (
                <tr key={b.id}>
                  <td>
                    <span className="mono text-accent" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px' }}>{b.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{b.customer.split(' ').slice(0, 3).join(' ')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{b.contact}</div>
                  </td>
                  <td style={{ fontSize: 11.5 }}>{b.sampleType}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{b.qty}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: 11 }}>{fmtDate(b.dispatched)}</div>
                    {b.receivedDate && (
                      <div style={{ fontSize: 9.5, color: 'var(--green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        Rcvd {fmtDate(b.receivedDate)}
                      </div>
                    )}
                  </td>
                  <td><span className="badge badge-gray">{b.courier}</span></td>
                  <td>
                    {b.issues?.length > 0
                      ? <span className="badge badge-red">⚠ Issues</span>
                      : b.stage === 0
                        ? <span className="badge badge-amber">Awaiting</span>
                        : <span className="badge badge-green">✓ Received</span>
                    }
                  </td>
                  <td>
                    {isReceived
                      ? <SegBar batchId={b.id} bottles={bottles} />
                      : <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Awaiting receipt</span>
                    }
                  </td>
                  <td><PriorityBadge priority={b.priority} /></td>
                  <td>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: days > 30 ? 'var(--red)' : 'var(--text-muted)' }}>{days}d</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="View"><Icons.Eye /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Move Stage"><Icons.Return /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                  No batches found{tab !== 'all' ? ` in "${TABS.find(t => t.key === tab)?.label}" filter` : ''}{search ? ` matching "${search}"` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create New Batch" large>
          <BatchForm customers={customers} onSave={createBatch} onClose={() => setShowCreate(false)} />
        </Modal>
      )}

      {approveReq && (
        <ApproveRequestModal
          request={approveReq}
          onClose={() => setApproveReq(null)}
          onApprove={(form) => { handleApprove(approveReq, form); setApproveReq(null) }}
        />
      )}
    </div>
  )
}