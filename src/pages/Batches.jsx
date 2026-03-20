import React, { useState } from 'react'
import { COURIERS, daysSince } from '../data/mockData'
import { Modal, StepTracker, StageBadge, PriorityBadge, SearchBar, EmptyState } from '../components/UI'
import * as Icons from '../components/Icons'

// ── New Batch Form ────────────────────────────────────────────────────────────
function BatchForm({ customers, onSave, onClose }) {
  const [form, setForm] = useState({
    customer: '', contact: '', qty: 10, courier: 'BlueDart',
    awb: '', location: '', notes: '', priority: 'normal',
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const autoContact = customers.find(c => c.name === form.customer)?.contact || ''

  function handleSave() {
    const newBatch = {
      id: `VPS-2024-${String(Date.now()).slice(-4)}`,
      ...form,
      contact: form.contact || autoContact,
      stage: 0,
      dispatched: new Date().toISOString().slice(0, 10),
      issues: [],
    }
    onSave(newBatch)
    onClose()
  }

  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label>Customer</label>
          <select value={form.customer} onChange={e => f('customer', e.target.value)}>
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Contact Person</label>
          <input
            type="text"
            value={form.contact || autoContact}
            onChange={e => f('contact', e.target.value)}
            placeholder="Auto-filled from customer"
          />
        </div>
        <div className="form-group">
          <label>Bottle Quantity</label>
          <input type="number" min={1} max={100} value={form.qty} onChange={e => f('qty', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => f('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="form-group">
          <label>Courier</label>
          <select value={form.courier} onChange={e => f('courier', e.target.value)}>
            {COURIERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>AWB / Tracking Number</label>
          <input type="text" value={form.awb} onChange={e => f('awb', e.target.value)} placeholder="Courier tracking number" />
        </div>
      </div>

      <div className="form-group">
        <label>Sample Collection Location(s)</label>
        <input
          type="text"
          value={form.location}
          onChange={e => f('location', e.target.value)}
          placeholder="e.g. Transformer Bay A, Cooling Chamber, Piston Area"
        />
      </div>

      <div className="form-group">
        <label>Notes / Instructions</label>
        <textarea
          value={form.notes}
          onChange={e => f('notes', e.target.value)}
          placeholder="Special sampling instructions, test type required…"
        />
      </div>

      <div className="alert alert-amber">
        <div style={{ width: 16, height: 16, flexShrink: 0 }}><Icons.Warn /></div>
        <div>Ensure collection locations are clearly specified to avoid wrong-location samples.</div>
      </div>

      <div className="modal-footer" style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Create Batch</button>
      </div>
    </>
  )
}

// ── Batch Detail Modal ────────────────────────────────────────────────────────
function BatchDetail({ batch, onClose }) {
  const meta = [
    ['Customer',   batch.customer],
    ['Contact',    batch.contact],
    ['Quantity',   `${batch.qty} bottles`],
    ['Courier',    `${batch.courier} · ${batch.awb || 'No AWB'}`],
    ['Priority',   batch.priority],
    ['Dispatched', batch.dispatched],
  ]
  return (
    <Modal
      open
      onClose={onClose}
      title={`Batch Detail — ${batch.id}`}
      footer={<button className="btn btn-ghost" onClick={onClose}>Close</button>}
    >
      <div className="mb-4"><StepTracker stage={batch.stage} /></div>

      <div className="grid-2 mb-4">
        {meta.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: .5 }}>{k}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Collection Locations</div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 13.5 }}>
          {batch.location || 'Not specified'}
        </div>
      </div>

      {batch.notes && (
        <div className="form-group">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Notes</div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 13.5 }}>
            {batch.notes}
          </div>
        </div>
      )}

      {batch.issues.length > 0 && (
        <div className="alert alert-red">
          <div style={{ width: 16, height: 16, flexShrink: 0 }}><Icons.Warn /></div>
          <div>{batch.issues.join('; ')}</div>
        </div>
      )}
    </Modal>
  )
}

// ── Main Batches Page ─────────────────────────────────────────────────────────
export default function Batches({ batches, setBatches, customers }) {
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [showNew,    setShowNew]    = useState(false)
  const [viewBatch,  setViewBatch]  = useState(null)

  const FILTERS = ['all', 'active', 'complete', 'issues']

  const filtered = batches.filter(b => {
    const q   = search.toLowerCase()
    const hit = !q || b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.contact.toLowerCase().includes(q)
    const stageOk =
      filter === 'all'      ? true :
      filter === 'active'   ? b.stage < 8 :
      filter === 'complete' ? b.stage >= 8 :
                              b.issues.length > 0
    return hit && stageOk
  })

  function advanceStage(id) {
    setBatches(p => p.map(b => b.id === id && b.stage < 8 ? { ...b, stage: b.stage + 1 } : b))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="section-title">Batch Management</div>
          <div className="section-sub">Track every bottle from dispatch to report generation</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Icons.Plus /> New Batch
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search batch ID, customer…"
        />
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {FILTERS.map(t => (
            <button
              key={t}
              className={`tab${filter === t ? ' active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Qty</th>
              <th>Courier</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Days</th>
              <th>Issues</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <span
                    style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--orange)', cursor: 'pointer' }}
                    onClick={() => setViewBatch(b)}
                  >
                    {b.id}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{b.customer}</td>
                <td className="text-muted">{b.contact}</td>
                <td>{b.qty}</td>
                <td><span className="chip">{b.courier}</span></td>
                <td><StageBadge stage={b.stage} /></td>
                <td><PriorityBadge priority={b.priority} /></td>
                <td>
                  <span className={daysSince(b.dispatched) > 14 ? 'badge badge-red' : 'badge badge-gray'}>
                    {daysSince(b.dispatched)}d
                  </span>
                </td>
                <td>
                  {b.issues.length > 0
                    ? <span className="badge badge-red">{b.issues.length}</span>
                    : <span className="badge badge-green">None</span>
                  }
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewBatch(b)} title="View">
                      <Icons.Eye />
                    </button>
                    {b.stage < 8 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => advanceStage(b.id)} title="Advance stage">
                        <Icons.Dispatch />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={10}>
                  <EmptyState icon={Icons.Bottle} message="No batches match your filters" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Batch Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Batch">
        <BatchForm
          customers={customers}
          onSave={nb => setBatches(p => [nb, ...p])}
          onClose={() => setShowNew(false)}
        />
      </Modal>

      {/* Detail Modal */}
      {viewBatch && <BatchDetail batch={viewBatch} onClose={() => setViewBatch(null)} />}
    </div>
  )
}
