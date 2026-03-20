import React, { useState } from 'react'
import { StepTracker, Modal } from '../components/UI'
import * as Icons from '../components/Icons'

// ── Customer Issue Report Modal ───────────────────────────────────────────────
// Shown when customer clicks "Mark Samples Collected" — lets them self-report
function SampleIssueModal({ batch, onClose, onConfirm }) {
  const [actualLocation, setActualLocation] = useState('')
  const [issues, setIssues]                 = useState([])
  const [note, setNote]                     = useState('')

  const expectedLocation = batch.location || ''

  function toggleIssue(issue) {
    setIssues(p => p.includes(issue) ? p.filter(i => i !== issue) : [...p, issue])
  }

  function handleConfirm() {
    const allIssues = [...issues]

    // Auto-flag if they typed a different location
    if (
      actualLocation.trim() &&
      actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase()
    ) {
      allIssues.push(
        `Wrong location (reported by customer): samples collected from "${actualLocation.trim()}" — expected "${expectedLocation}"`
      )
    }

    if (note.trim()) allIssues.push(`Customer note: ${note.trim()}`)

    onConfirm(batch.id, allIssues)
    onClose()
  }

  const locationMismatch = actualLocation.trim() &&
    actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase()

  return (
    <Modal
      open
      onClose={onClose}
      title="Confirm Sample Collection"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm {issues.length > 0 || locationMismatch ? '& Report Issues' : 'Collection'}
          </button>
        </>
      }
    >
      {/* Instructions */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          Batch {batch.id} — {batch.qty} Bottles
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Instructed collection location:{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {expectedLocation || 'See dispatch note'}
          </strong>
        </div>
      </div>

      {/* Location confirmation */}
      <div style={{
        border: '1px solid #e2e8f0', borderRadius: 'var(--radius)',
        padding: '14px 16px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          Where did you collect the samples from?
        </div>
        <input
          type="text"
          value={actualLocation}
          onChange={e => setActualLocation(e.target.value)}
          placeholder={`Instructed: ${expectedLocation || 'refer to dispatch note'}`}
          style={{
            width: '100%',
            background: locationMismatch ? 'rgba(239,68,68,0.06)' : 'var(--surface)',
            border: `1px solid ${locationMismatch ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: '9px 12px', fontSize: 13.5,
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
        {locationMismatch && (
          <div style={{
            marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            fontSize: 12.5, color: 'var(--red)', display: 'flex', gap: 6,
          }}>
            <span style={{ width: 14, height: 14, flexShrink: 0 }}><Icons.Warn /></span>
            This differs from the instructed location. VPS Lab will be notified — please also
            note it on the sample bottles.
          </div>
        )}
        {actualLocation.trim() && !locationMismatch && (
          <div style={{
            marginTop: 8, padding: '8px 12px', background: 'rgba(232,80,10,0.06)',
            border: '1px solid rgba(232,80,10,0.20)', borderRadius: 8,
            fontSize: 12.5, color: 'var(--orange)', display: 'flex', gap: 6,
          }}>
            ✓ Location matches instructions
          </div>
        )}
      </div>

      {/* Optional issue checkboxes */}
      <div style={{
        border: '1px solid #e2e8f0', borderRadius: 'var(--radius)',
        padding: '14px 16px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          Any issues to report? (optional)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Some bottles were already broken or damaged on arrival',
            'Could not access the specified location — used nearest available point',
            'Samples may have been contaminated during collection',
            'Fewer bottles filled than expected — some were unusable',
            'Collected from correct location but equipment was different type',
          ].map(issue => (
            <label key={issue} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
              padding: '8px 10px', borderRadius: 8,
              background: issues.includes(issue) ? 'rgba(239,68,68,0.06)' : 'transparent',
              border: `1px solid ${issues.includes(issue) ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
              transition: 'all .15s',
            }}>
              <input
                type="checkbox"
                checked={issues.includes(issue)}
                onChange={() => toggleIssue(issue)}
                style={{ width: 'auto', marginTop: 2, accentColor: 'var(--red)' }}
              />
              <span style={{ fontSize: 13, color: issues.includes(issue) ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.4 }}>
                {issue}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Free-text note */}
      <div className="form-group">
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Additional note for VPS Lab (optional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Anything else VPS Lab should know about these samples…"
          style={{
            width: '100%', background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 13.5,
            color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: 64, marginTop: 4,
          }}
        />
      </div>
    </Modal>
  )
}

// ── Main Customer Portal ──────────────────────────────────────────────────────
export default function CustomerPortal({ batches, setBatches, lockedCustomer = null }) {
  const allCustomers = [...new Set(batches.map(b => b.customer))]
  const [selected, setSelected]     = useState(lockedCustomer || allCustomers[0] || '')
  const [reportingBatch, setReportingBatch] = useState(null)

  const activeCustomer = lockedCustomer || selected
  const myBatches = batches.filter(b => b.customer === activeCustomer)

  // Simple stage advance (stages 1 and 3 don't need a modal)
  function updateStage(id, stage) {
    setBatches(p => p.map(b => b.id === id ? { ...b, stage } : b))
  }

  // Stage 2→3: Samples collected — open issue report modal
  function openCollectionReport(batch) {
    setReportingBatch(batch)
  }

  // Called after modal confirms
  function confirmCollection(id, newIssues) {
    setBatches(p => p.map(b => {
      if (b.id !== id) return b
      return {
        ...b,
        stage: 3,
        issues: [...(b.issues || []), ...newIssues],
      }
    }))
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Customer Portal</div>
        <div className="section-sub">
          {lockedCustomer
            ? `Your active batches — ${lockedCustomer}`
            : 'Simulates the customer-facing login view where customers update sample status'}
        </div>
      </div>

      {!lockedCustomer && (
        <div className="alert alert-teal mb-6">
          <div style={{ width: 16, height: 16, flexShrink: 0 }}><Icons.Customers /></div>
          <div>
            Admin view — switch between customers. In production, customers receive a
            unique login and see only their batches.
          </div>
        </div>
      )}

      {lockedCustomer && (
        <div className="alert alert-teal mb-6">
          <div style={{ width: 16, height: 16, flexShrink: 0 }}><Icons.Bottle /></div>
          <div>
            Logged in as <strong>{lockedCustomer}</strong>. Update your sample status below —
            VPS Lab is notified instantly.
          </div>
        </div>
      )}

      {/* Customer switcher — admin/staff only */}
      {!lockedCustomer && (
        <div className="form-group" style={{ maxWidth: 320, marginBottom: 28 }}>
          <label>Viewing as Customer</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {allCustomers.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {!myBatches.length && (
        <div className="empty-state">
          <Icons.Bottle />
          <p>No active batches for {activeCustomer}</p>
        </div>
      )}

      {myBatches.map(b => {
        return (
          <div className="card mb-4" key={b.id}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--orange)', marginBottom: 2 }}>{b.id}</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{b.qty} Sample Bottles</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Collection location:{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>
                    {b.location || 'Refer to dispatch note'}
                  </strong>
                </div>
              </div>
              {b.issues.length > 0 && (
                <span className="badge badge-red">
                  {b.issues.length} issue{b.issues.length > 1 ? 's' : ''} flagged
                </span>
              )}
            </div>

            {/* Step tracker */}
            <div className="mb-4">
              <StepTracker stage={b.stage} />
            </div>

            {/* Notes */}
            {b.notes && (
              <div style={{
                fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14,
                padding: '8px 12px', background: '#ffffff',
                borderRadius: 'var(--radius)', borderLeft: '2px solid var(--border)',
              }}>
                📋 {b.notes}
              </div>
            )}

            {/* Action buttons — stage-specific */}
            <div className="flex gap-3 flex-wrap">
              {b.stage === 1 && (
                <button className="btn btn-primary" onClick={() => updateStage(b.id, 2)}>
                  ✓ Acknowledge Receipt
                </button>
              )}

              {b.stage === 2 && (
                <>
                  <button className="btn btn-primary" onClick={() => openCollectionReport(b)}>
                    ✓ Mark Samples Collected
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                    You'll be asked to confirm the collection location
                  </div>
                </>
              )}

              {b.stage === 3 && (
                <button className="btn btn-primary" onClick={() => updateStage(b.id, 4)}>
                  ✓ Dispatch Samples Back to VPS
                </button>
              )}

              {b.stage === 0 && (
                <span className="badge badge-gray" style={{ padding: '8px 14px' }}>
                  Awaiting dispatch from VPS Lab
                </span>
              )}

              {b.stage >= 4 && (
                <span className="badge badge-teal" style={{ padding: '8px 14px' }}>
                  ✓ Samples returned to VPS Lab
                </span>
              )}
            </div>

            {/* Show existing issues */}
            {b.issues.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {b.issues.map((issue, i) => (
                  <div key={i} className="alert alert-red" style={{ marginBottom: 6 }}>
                    <div style={{ width: 14, height: 14, flexShrink: 0 }}><Icons.Warn /></div>
                    <div style={{ fontSize: 12.5 }}>{issue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Sample Collection Report Modal */}
      {reportingBatch && (
        <SampleIssueModal
          batch={reportingBatch}
          onClose={() => setReportingBatch(null)}
          onConfirm={confirmCollection}
        />
      )}
    </div>
  )
}
