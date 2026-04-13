import React, { useState, useMemo, useCallback } from 'react'
import { fmtDate, uid } from '../data/mockData'
import { Modal } from '../components/UI'
import {
  FlaskConical, Package, FileText, Check, X,
  ChevronDown, ChevronUp, Microscope, TestTube, Beaker,
} from 'lucide-react'
import * as Icons from '../components/Icons'

// ── Result Form ───────────────────────────────────────────────────────────────
function ResultForm({ count, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    technician: '', viscosity: '', moisture: '', acidity: '',
    result: 'Normal', recommendation: ''
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const rc = {
    Normal:   { bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.3)',  color: 'var(--green)' },
    Warning:  { bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.3)',  color: 'var(--amber)' },
    Critical: { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.3)',  color: 'var(--red)'   },
  }[form.result]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#faf8f5', borderRadius: 'var(--r)', marginBottom: 20, border: '1px solid var(--border)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--r)', background: 'rgba(103,48,194,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlaskConical size={22} color="var(--purple)" strokeWidth={1.8} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Testing {count} bottle{count !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter measurements and overall result</div>
        </div>
      </div>

      <div className="form-group">
        <label>Technician Name *</label>
        <input type="text" value={form.technician} onChange={e => up('technician', e.target.value)} placeholder="Your name" />
      </div>

      <div className="grid-3">
        {[['viscosity', 'Viscosity (cSt)'], ['moisture', 'Moisture (ppm)'], ['acidity', 'Acidity (mgKOH/g)']].map(([k, l]) => (
          <div className="form-group" key={k}>
            <label>{l}</label>
            <input type="text" value={form[k]} onChange={e => up(k, e.target.value)} placeholder="0.00" />
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Overall Result</label>
        <select value={form.result} onChange={e => up('result', e.target.value)}>
          {['Normal', 'Warning', 'Critical'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ padding: '12px 16px', borderRadius: 'var(--r)', marginBottom: 16, background: rc.bg, border: `1.5px solid ${rc.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: rc.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: rc.color }}>Result: {form.result}</span>
      </div>

      <div className="form-group">
        <label>Recommendation for Customer</label>
        <textarea value={form.recommendation} onChange={e => up('recommendation', e.target.value)} placeholder="Maintenance recommendation…" />
      </div>

      <div className="flex gap-3 mt-4">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-primary flex-1"
          onClick={() => onSubmit(form)}
          disabled={!form.technician.trim()}
        >
          <FileText size={15} strokeWidth={1.8} /> Generate Report &amp; Complete
        </button>
      </div>
    </div>
  )
}

/* ── Main Lab Page ─────────────────────────────────────────────────────────── */
export default function Lab({ bottles, setBottles, batches, reports, setReports }) {
  const [selected, setSelected]       = useState([])
  const [showResults, setShowResults] = useState(false)

  const inbound = useMemo(() => bottles.filter(b => b.status === 'Sent to VPS'), [bottles])
  const inQueue = useMemo(() => bottles.filter(b => b.status === 'In Lab'), [bottles])

  const inQueueIds     = useMemo(() => new Set(inQueue.map(b => b.id)), [inQueue])
  const activeSelected = useMemo(() => selected.filter(id => inQueueIds.has(id)), [selected, inQueueIds])

  const groupByBatch = useCallback((list) => {
    const map = {}
    list.forEach(b => {
      if (!map[b.batchId]) map[b.batchId] = { batch: batches.find(bt => bt.id === b.batchId), bottles: [] }
      map[b.batchId].bottles.push(b)
    })
    return map
  }, [batches])

  const inboundByBatch = useMemo(() => groupByBatch(inbound), [inbound, groupByBatch])
  const queueByBatch   = useMemo(() => groupByBatch(inQueue),  [inQueue, groupByBatch])

  function receiveBatch(batchId) {
    setBottles(p => p.map(b =>
      b.batchId === batchId && b.status === 'Sent to VPS'
        ? { ...b, status: 'In Lab', receivedByLabDate: new Date().toISOString().slice(0, 10) }
        : b
    ))
  }

  function toggleBottle(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function toggleBatchGroup(batchId) {
    const ids = queueByBatch[batchId]?.bottles.map(b => b.id) || []
    const allSelected = ids.every(id => selected.includes(id))
    setSelected(p => allSelected ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])])
  }

  function submitResults(form) {
    if (activeSelected.length === 0) return
    const reportId = uid('RPT')
    const dateStr  = new Date().toISOString().slice(0, 10)

    const selectedBottles = bottles.filter(b => activeSelected.includes(b.id))
    const uniqueBatchIds  = [...new Set(selectedBottles.map(b => b.batchId))]
    const primaryBatch    = batches.find(b => b.id === uniqueBatchIds[0])

    const customerLabel = uniqueBatchIds.length > 1
      ? uniqueBatchIds.map(id => batches.find(b => b.id === id)?.customer).filter(Boolean).join(' / ')
      : primaryBatch?.customer || '—'

    setBottles(p => p.map(b =>
      activeSelected.includes(b.id)
        ? { ...b, status: 'Tested', testedDate: dateStr, ...form }
        : b
    ))
    setReports(p => [{
      id: reportId,
      batchId: primaryBatch?.id,
      batchIds: uniqueBatchIds,
      bottleIds: [...activeSelected],
      customer: customerLabel,
      testType: `${primaryBatch?.sampleType || 'Oil'} Analysis`,
      date: dateStr,
      status: 'Draft',
      ...form,
    }, ...p])

    setSelected([])
    setShowResults(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">Operations</div>
          <div className="page-header-title">VPS Lab Portal</div>
          <div className="page-header-sub">Receive samples · Select bottles · Enter results · Generate reports</div>
        </div>
        {/* Live counters */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Inbound',  val: inbound.length,  color: 'var(--amber)',  cls: 'chip-amber'  },
            { label: 'In Queue', val: inQueue.length,  color: 'var(--purple)', cls: 'chip-purple' },
            { label: 'Reports',  val: reports.length,  color: 'var(--green)',  cls: 'chip-green'  },
          ].map(c => (
            <div key={c.label} className={`metric-chip ${c.cls}`}>
              <div className="metric-chip-dot" />
              <span className="metric-chip-val">{c.val}</span>
              <span className="metric-chip-lbl">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 1: Inbound ── */}
      {inbound.length > 0 && (
        <div className="card mb-4" style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--r)', background: 'rgba(10,124,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="var(--green)" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                  Inbound — {inbound.length} bottle{inbound.length !== 1 ? 's' : ''} in transit
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Confirm receipt to move bottles into the lab queue</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(inboundByBatch).map(([batchId, { batch, bottles: bb }]) => (
              <div key={batchId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: 'var(--r)', border: '1px solid #a7f3d0', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--orange)', fontWeight: 600 }}>{batchId}</span>
                  <span style={{ fontSize: 12.5, marginLeft: 10, color: 'var(--text-secondary)' }}>
                    {batch?.customer?.split(' ').slice(0, 2).join(' ')} · <strong>{bb.length}</strong> bottles · {batch?.sampleType}
                  </span>
                  {(batch?.returnCourier || batch?.returnAwb) && (
                    <span style={{ fontSize: 11, marginLeft: 10, color: 'var(--text-muted)' }}>
                      via {batch.returnCourier} · {batch.returnAwb}
                      {batch.returnSentDate ? ` · sent ${fmtDate(batch.returnSentDate)}` : ''}
                    </span>
                  )}
                  {bb.some(b => b.bottleBarcode) && (
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {bb.filter(b => b.bottleBarcode).map(b => b.bottleBarcode).join(' · ')}
                    </div>
                  )}
                </div>
                <button className="btn btn-success btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => receiveBatch(batchId)}>
                  <Check size={13} strokeWidth={2.5} /> Receive {bb.length} Bottle{bb.length !== 1 ? 's' : ''}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 2: Lab Queue + Selection ── */}
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Queue list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lab Queue</span>
            <div className="flex gap-2 items-center">
              <span className="badge badge-purple">{inQueue.length} bottles</span>
              {activeSelected.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
              )}
            </div>
          </div>

          {Object.keys(queueByBatch).length === 0 ? (
            <div className="empty-state">
              <FlaskConical size={28} strokeWidth={1.5} />
              <p>No bottles in lab queue.{inbound.length > 0 ? ' Receive inbound batches above.' : ''}</p>
            </div>
          ) : (
            Object.entries(queueByBatch).map(([batchId, { batch, bottles: bb }]) => {
              const allSel  = bb.every(b => selected.includes(b.id))
              const partSel = bb.some(b => selected.includes(b.id))
              return (
                <div key={batchId} style={{ marginBottom: 14 }}>
                  <div
                    onClick={() => toggleBatchGroup(batchId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      padding: '9px 12px', borderRadius: 'var(--r)',
                      background: allSel ? 'rgba(212,82,12,0.06)' : partSel ? 'rgba(212,82,12,0.03)' : '#faf8f5',
                      border: `1.5px solid ${allSel ? 'rgba(212,82,12,0.3)' : 'var(--border)'}`,
                      marginBottom: 6, transition: 'all 0.13s',
                    }}
                  >
                    <input type="checkbox" checked={allSel} onChange={() => {}} style={{ width: 'auto', accentColor: 'var(--orange)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {batch?.customer?.split(' ').slice(0, 2).join(' ')}
                        <span className="mono" style={{ fontSize: 11, color: 'var(--orange)', marginLeft: 8 }}>{batchId}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bb.length} bottles · {batch?.sampleType}</div>
                    </div>
                    <span className={`badge badge-${allSel ? 'orange' : 'gray'}`}>{bb.length}</span>
                  </div>

                  {bb.map(b => (
                    <div
                      key={b.id}
                      onClick={() => toggleBottle(b.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 12px 7px 28px', cursor: 'pointer',
                        borderRadius: 'var(--r)', marginBottom: 3,
                        border: `1px solid ${selected.includes(b.id) ? 'rgba(212,82,12,0.25)' : 'var(--border)'}`,
                        background: selected.includes(b.id) ? 'rgba(212,82,12,0.04)' : '#fff',
                        transition: 'all 0.12s',
                      }}
                    >
                      <input type="checkbox" checked={selected.includes(b.id)} onChange={() => {}} style={{ width: 'auto', accentColor: 'var(--orange)' }} />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>
                        Bottle #{b.bottleNum}
                        {b.bottleBarcode && (
                          <span style={{ marginLeft: 8, color: 'var(--accent)', fontSize: 10 }}>{b.bottleBarcode}</span>
                        )}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.location || '—'}</span>
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>

        {/* Right panel */}
        <div>
          {activeSelected.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(103,48,194,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FlaskConical size={26} color="var(--purple)" strokeWidth={1.5} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Select bottles to test</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Click a batch header to select all its bottles, or pick them individually.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', background: '#faf8f5', padding: '12px', borderRadius: 'var(--r)', textAlign: 'left' }}>
                You can select bottles from multiple batches if they share the same test methodology.
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ready to Test</span>
                <span className="badge badge-orange">{activeSelected.length} selected</span>
              </div>
              <div style={{ padding: '20px', background: '#faf8f5', borderRadius: 'var(--r)', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--orange)', lineHeight: 1 }}>{activeSelected.length}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>bottle{activeSelected.length !== 1 ? 's' : ''} selected for testing</div>
              </div>
              <button className="btn btn-primary w-full" onClick={() => setShowResults(true)}>
                Enter Test Results
              </button>
              <button className="btn btn-ghost w-full mt-3" onClick={() => setSelected([])}>
                Clear Selection
              </button>
            </div>
          )}

          {/* Recent reports */}
          {reports.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                <span className="card-title">Recent Reports</span>
                <span className="badge badge-gray">{reports.length}</span>
              </div>
              {reports.slice(0, 6).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>{r.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{r.customer?.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge badge-${r.result === 'Normal' ? 'green' : r.result === 'Warning' ? 'amber' : 'red'}`}>{r.result}</span>
                    <span className={`badge badge-${r.status === 'Issued' ? 'green' : 'blue'}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results modal */}
      {showResults && (
        <Modal open onClose={() => setShowResults(false)} title="Enter Test Results" large>
          <ResultForm
            count={activeSelected.length}
            onCancel={() => setShowResults(false)}
            onSubmit={submitResults}
          />
        </Modal>
      )}
    </div>
  )
}
