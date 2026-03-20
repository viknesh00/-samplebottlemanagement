import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COURIERS, STAGES, daysSince } from '../data/mockData'
import { Modal, StepTracker, StageBadge, PriorityBadge, SearchBar, EmptyState } from '../components/UI'
import * as Icons from '../components/Icons'

// ── Reverse Stage Reasons ──────────────────────────────────────────────────────
const REVERSE_REASONS = [
  'Stage was advanced by mistake',
  'Customer returned bottles — re-opening for re-dispatch',
  'Insufficient samples — bottles being re-sent to customer',
  'Wrong location samples rejected — customer must re-collect',
  'Lab rejected samples — returning to dispatch stage',
  'Customer requested re-collection',
  'Data entry error — correcting stage',
  'Other (specify below)',
]

// ── Reverse Stage Modal ───────────────────────────────────────────────────────
function ReverseStageModal({ batch, onClose, onConfirm }) {
  const [targetStage, setTargetStage]   = useState(Math.max(0, batch.stage - 1))
  const [reason, setReason]             = useState(REVERSE_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [confirmed, setConfirmed]       = useState(false)

  const isCustom = reason === 'Other (specify below)'
  const finalReason = isCustom ? customReason.trim() : reason
  const canSubmit = finalReason.length > 0 && confirmed

  function handleConfirm() {
    if (!canSubmit) return
    onConfirm(batch.id, targetStage, finalReason)
    onClose()
  }

  const stepsBack = batch.stage - targetStage

  return (
    <Modal
      open
      onClose={onClose}
      title={`Reverse Stage — ${batch.id}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!canSubmit}
            style={{ background: canSubmit ? 'var(--red)' : '#ccc', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            Reverse Stage
          </button>
        </>
      }
    >
      {/* Warning banner */}
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)',
        padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div style={{ width: 18, height: 18, color: '#dc2626', flexShrink: 0, marginTop: 1 }}><Icons.Warn /></div>
        <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
          <strong>This action reverses the workflow.</strong> The batch will be moved back and
          the customer may need to be notified. This action is logged in the audit trail.
        </div>
      </div>

      {/* Current vs Target */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>
          Stage Change Preview
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1, padding: '10px 14px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Current</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#991b1b' }}>{STAGES[batch.stage]}</div>
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>Step {batch.stage + 1} of 9</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 300 }}>→</div>
          <div style={{
            flex: 1, padding: '10px 14px', background: '#fff7ed',
            border: '1px solid #fed7aa', borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: 11, color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Reverting To</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#9a3412' }}>{STAGES[targetStage]}</div>
            <div style={{ fontSize: 11, color: '#c2410c', marginTop: 2 }}>Step {targetStage + 1} of 9</div>
          </div>
        </div>
      </div>

      {/* Target stage selector */}
      <div className="form-group">
        <label>Revert to which stage?</label>
        <select
          value={targetStage}
          onChange={e => setTargetStage(+e.target.value)}
        >
          {STAGES.map((s, i) => {
            if (i >= batch.stage) return null
            return (
              <option key={i} value={i}>
                Step {i + 1}: {s}{i === batch.stage - 1 ? ' (one step back)' : ''}
              </option>
            )
          })}
        </select>
        {stepsBack > 1 && (
          <div style={{ fontSize: 12, color: '#c2410c', marginTop: 6 }}>
            ⚠ This will revert <strong>{stepsBack} steps</strong> — use with caution.
          </div>
        )}
      </div>

      {/* Reason selector */}
      <div className="form-group">
        <label>Reason for reversal <span style={{ color: 'var(--red)' }}>*</span></label>
        <select value={reason} onChange={e => setReason(e.target.value)}>
          {REVERSE_REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Custom reason text */}
      {isCustom && (
        <div className="form-group">
          <label>Describe the reason <span style={{ color: 'var(--red)' }}>*</span></label>
          <textarea
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            placeholder="Explain why the stage needs to be reversed…"
            style={{ minHeight: 72 }}
          />
        </div>
      )}

      {/* Audit trail notice */}
      <div style={{
        background: '#f8fafc', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16,
        fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 14 }}>📋</span>
        <span>
          This reversal will be recorded in the batch audit log with your name, timestamp, and reason.
        </span>
      </div>

      {/* Confirm checkbox */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', background: confirmed ? '#fff7ed' : '#f8fafc',
        border: `1px solid ${confirmed ? '#fed7aa' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13,
        color: confirmed ? '#9a3412' : 'var(--text-secondary)',
        transition: 'all .15s',
        marginBottom: 0,
      }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          style={{ width: 'auto' }}
        />
        I confirm this stage reversal is necessary and understand it will be logged.
      </label>
    </Modal>
  )
}

// ── Stage History / Audit Log in Batch Detail ─────────────────────────────────
function AuditLog({ log }) {
  if (!log || log.length === 0) return null
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 700 }}>
        Stage Reversal Audit Log
      </div>
      {log.map((entry, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, padding: '8px 12px',
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 'var(--radius)', marginBottom: 6,
          alignItems: 'flex-start', fontSize: 12.5,
        }}>
          <span style={{ color: '#c2410c', flexShrink: 0 }}>↩</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#9a3412', marginBottom: 2 }}>
              Step {entry.from + 1} → Step {entry.to + 1}
              <span style={{ fontWeight: 400, color: '#c2410c' }}> · {entry.fromStage} → {entry.toStage}</span>
            </div>
            <div style={{ color: '#c2410c' }}>{entry.reason}</div>
            <div style={{ color: '#d97706', fontSize: 11, marginTop: 2 }}>{entry.by} · {entry.at}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

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
      auditLog: [],
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
          <input type="text" value={form.contact || autoContact} onChange={e => f('contact', e.target.value)} placeholder="Auto-filled from customer" />
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
        <input type="text" value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Transformer Bay A, Cooling Chamber, Piston Area" />
      </div>
      <div className="form-group">
        <label>Notes / Instructions</label>
        <textarea value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Special sampling instructions, test type required…" />
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
function BatchDetail({ batch, onClose, onAdvance, onReverse }) {
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
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
          {/* Reverse button — left side */}
          {onReverse && batch.stage > 0 && batch.stage < 8 && (
            <button
              className="btn btn-sm"
              onClick={() => { onClose(); onReverse(batch) }}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', marginRight: 'auto',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ↩ Reverse Stage
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {onAdvance && batch.stage < 8 && (
            <button className="btn btn-primary btn-sm" onClick={() => { onAdvance(batch.id); onClose() }}>
              Advance Stage →
            </button>
          )}
        </div>
      }
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
        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 13.5 }}>
          {batch.location || 'Not specified'}
        </div>
      </div>

      {batch.notes && (
        <div className="form-group">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Notes</div>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 13.5 }}>
            {batch.notes}
          </div>
        </div>
      )}

      {batch.issues.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {batch.issues.map((iss, i) => (
            <div key={i} className="alert alert-red" style={{ marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, flexShrink: 0 }}><Icons.Warn /></div>
              <div style={{ fontSize: 12.5 }}>{iss}</div>
            </div>
          ))}
        </div>
      )}

      <AuditLog log={batch.auditLog} />
    </Modal>
  )
}

// ── Main Batches Page ─────────────────────────────────────────────────────────
export default function Batches({ batches, setBatches, customers }) {
  const { user } = useAuth()
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState('all')
  const [showNew,       setShowNew]       = useState(false)
  const [viewBatch,     setViewBatch]     = useState(null)
  const [reverseBatch,  setReverseBatch]  = useState(null)

  const FILTERS = ['all', 'active', 'complete', 'issues']

  const filtered = batches.filter(b => {
    const q = search.toLowerCase()
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

  function reverseStage(id, targetStage, reason) {
    setBatches(p => p.map(b => {
      if (b.id !== id) return b
      const logEntry = {
        from:      b.stage,
        to:        targetStage,
        fromStage: STAGES[b.stage],
        toStage:   STAGES[targetStage],
        reason,
        by:  user?.name || 'VPS Staff',
        at:  new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      }
      return {
        ...b,
        stage: targetStage,
        auditLog: [...(b.auditLog || []), logEntry],
      }
    }))
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search batch ID, customer…" />
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {FILTERS.map(t => (
            <button key={t} className={`tab${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
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
                    style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setViewBatch(b)}
                  >
                    {b.id}
                  </span>
                  {b.auditLog?.length > 0 && (
                    <span
                      title={`${b.auditLog.length} reversal(s) logged`}
                      style={{
                        marginLeft: 6, fontSize: 10, background: '#fff7ed',
                        color: '#c2410c', border: '1px solid #fed7aa',
                        borderRadius: 4, padding: '1px 5px', fontWeight: 600, cursor: 'default',
                      }}
                    >
                      ↩{b.auditLog.length}
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{b.customer}</td>
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
                    {/* View */}
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewBatch(b)} title="View detail">
                      <Icons.Eye />
                    </button>

                    {/* Advance — admin/staff only */}
                    {isAdminOrStaff && b.stage < 8 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => advanceStage(b.id)}
                        title="Advance to next stage"
                        style={{ color: 'var(--orange)', borderColor: '#fed7aa' }}
                      >
                        <Icons.Dispatch />
                      </button>
                    )}

                    {/* Reverse — admin/staff only, stage > 0 and not completed */}
                    {isAdminOrStaff && b.stage > 0 && b.stage < 8 && (
                      <button
                        className="btn btn-sm"
                        onClick={() => setReverseBatch(b)}
                        title="Reverse stage"
                        style={{
                          background: '#fef2f2', border: '1px solid #fecaca',
                          color: '#dc2626', padding: '6px 8px',
                        }}
                      >
                        ↩
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
      {viewBatch && (
        <BatchDetail
          batch={viewBatch}
          onClose={() => setViewBatch(null)}
          onAdvance={isAdminOrStaff ? advanceStage : null}
          onReverse={isAdminOrStaff ? b => { setViewBatch(null); setReverseBatch(b) } : null}
        />
      )}

      {/* Reverse Stage Modal */}
      {reverseBatch && (
        <ReverseStageModal
          batch={reverseBatch}
          onClose={() => setReverseBatch(null)}
          onConfirm={reverseStage}
        />
      )}
    </div>
  )
}
