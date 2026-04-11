import React, { useState } from 'react'
import { COURIERS, SAMPLE_TYPES, fmtDate, today, daysSince } from '../data/mockData'
import { Modal, SearchBar, SegBar, PriorityBadge } from '../components/UI'
import * as Icons from '../components/Icons'

// ── New Batch Form ────────────────────────────────────────────────────────────
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
      stage: 0,
      receivedDate: null,
      issues: []
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

const PRIORITY_COLORS = { urgent: 'red', high: 'amber', normal: 'teal' }

const TABS = [
  { key: 'all',      label: 'All'      },
  { key: 'active',   label: 'Active'   },
  { key: 'complete', label: 'Complete' },
  { key: 'issues',   label: 'Issues'   },
]

export default function Batches({ batches, setBatches, bottles, setBottles, customers }) {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('all')

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

  function createBatch(data) { setBatches(p => [data, ...p]) }

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

      {/* Summary Cards — matches Dashboard BatchBox style */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { value: batches.length,   label: 'Total Batches',    sub: 'All time',                    color: 'var(--accent)', bg: 'rgba(232,93,10,0.06)',  border: 'rgba(232,93,10,0.18)'  },
          { value: counts.active,    label: 'Awaiting Receipt', sub: 'Dispatched · not received',   color: 'var(--amber)',  bg: 'rgba(201,122,6,0.06)',  border: 'rgba(201,122,6,0.18)'  },
          { value: counts.complete,  label: 'Received',         sub: 'Confirmed at lab',            color: 'var(--green)', bg: 'rgba(10,124,82,0.06)',  border: 'rgba(10,124,82,0.18)'  },
          { value: counts.issues,    label: 'With Issues',      sub: 'Requires attention',          color: 'var(--red)',   bg: 'rgba(212,42,42,0.06)',  border: 'rgba(212,42,42,0.18)'  },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 160px', padding: '13px 15px',
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

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search batch ID, customer, sample type…" />
        </div>

        <div className="tab-bar">
          {TABS.map((t, i) => {
            const isActive = tab === t.key
            const isIssues = t.key === 'issues'
            return (
              <button
                key={t.key}
                className={`tab${isActive ? (isIssues ? ' active-issues' : ' active') : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {counts[t.key] >= 0 && (
                  <span className={isActive ? 'tab-count' : 'tab-count-inactive'}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
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
                    <span className="mono text-accent" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px' }}>
                      {b.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{b.customer.split(' ').slice(0, 3).join(' ')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{b.contact}</div>
                  </td>
                  <td style={{ fontSize: 11.5 }}>{b.sampleType}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                      {b.qty}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 11 }}>{fmtDate(b.dispatched)}</div>
                    {b.receivedDate && (
                      <div style={{ fontSize: 9.5, color: 'var(--green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        Rcvd {fmtDate(b.receivedDate)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-gray">{b.courier}</span>
                  </td>
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
                  <td>
                    <PriorityBadge priority={b.priority} />
                  </td>
                  <td>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: days > 30 ? 'var(--red)' : 'var(--text-muted)' }}>
                      {days}d
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="View">
                        <Icons.Eye />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Move Stage">
                        <Icons.Return />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                  No batches found
                  {tab !== 'all' ? ` in "${TABS.find(t => t.key === tab)?.label}" filter` : ''}
                  {search ? ` matching "${search}"` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create New Batch" large>
          <BatchForm customers={customers} onSave={createBatch} onClose={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  )
}