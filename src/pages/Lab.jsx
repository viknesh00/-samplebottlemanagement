import React, { useState } from 'react'
import { StageBadge, EmptyState } from '../components/UI'
import * as Icons from '../components/Icons'

export default function Lab({ batches, setBatches, reports, setReports }) {
  const inLab  = batches.filter(b => b.stage === 6 || b.stage === 7)
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState({
    viscosity: '', moisture: '', acidity: '',
    result: 'Normal', technician: '', recommendation: '',
  })

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function startTesting(id) {
    setBatches(p => p.map(b => b.id === id ? { ...b, stage: 7 } : b))
  }

  function submitReport() {
    if (!sel) return
    const rpt = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      batchId: sel.id,
      customer: sel.customer,
      testType: 'Oil Analysis',
      date: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      ...form,
    }
    setReports(p => [...p, rpt])
    setBatches(p => p.map(b => b.id === sel.id ? { ...b, stage: 8 } : b))
    setSel(null)
    setForm({ viscosity: '', moisture: '', acidity: '', result: 'Normal', technician: '', recommendation: '' })
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Lab Processing</div>
        <div className="section-sub">Process samples received at VPS lab and generate test reports</div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Sample Queue */}
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">Samples In Lab</span>
              <span className="badge badge-blue">{inLab.length}</span>
            </div>

            {!inLab.length && (
              <EmptyState icon={Icons.Flask} message="No samples in lab currently" />
            )}

            {inLab.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  setSel(b)
                  setForm({ viscosity: '', moisture: '', acidity: '', result: 'Normal', technician: '', recommendation: '' })
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                  padding: 12, background: '#ffffff', borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  border: `1px solid ${sel?.id === b.id ? 'var(--teal)' : 'var(--border)'}`,
                  transition: 'border-color .15s',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--orange)' }}>{b.id}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{b.customer}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {b.qty} bottles · {b.location || 'Location TBD'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StageBadge stage={b.stage} />
                  {b.stage === 6 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); startTesting(b.id) }}
                    >
                      Start Testing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Form */}
        <div>
          {sel ? (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Enter Test Results</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--orange)' }}>{sel.id}</span>
              </div>

              <div className="form-group">
                <label>Technician Name</label>
                <input type="text" value={form.technician} onChange={e => f('technician', e.target.value)} placeholder="Dr. / Ms. / Mr." />
              </div>

              <div className="grid-3">
                {[
                  ['viscosity', 'Viscosity (cSt)'],
                  ['moisture',  'Moisture (ppm)'],
                  ['acidity',   'Acidity (mgKOH/g)'],
                ].map(([k, l]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input type="text" value={form[k]} onChange={e => f(k, e.target.value)} placeholder="0.00" />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Overall Result</label>
                <select value={form.result} onChange={e => f('result', e.target.value)}>
                  {['Normal', 'Warning', 'Critical'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Recommendation</label>
                <textarea
                  value={form.recommendation}
                  onChange={e => f('recommendation', e.target.value)}
                  placeholder="Maintenance recommendation for customer…"
                />
              </div>

              <button className="btn btn-primary w-full" onClick={submitReport}>
                Generate Report
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: .3 }}><Icons.Flask /></div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                Select a sample from the list to enter test results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
