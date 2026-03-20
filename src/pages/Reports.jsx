import React, { useState } from 'react'
import { Modal, EmptyState } from '../components/UI'
import * as Icons from '../components/Icons'

function ReportDetail({ report, onClose }) {
  const params = [
    ['Viscosity', report.viscosity || '—'],
    ['Moisture',  report.moisture  || '—'],
    ['Acidity',   report.acidity   || '—'],
  ]
  const resultColor = report.result === 'Normal' ? 'teal' : report.result === 'Warning' ? 'gray' : 'red'

  return (
    <Modal
      open
      onClose={onClose}
      title={`Report — ${report.id}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {report.status === 'Issued' && (
            <button className="btn btn-primary"><Icons.Download /> Download PDF</button>
          )}
        </>
      }
    >
      {/* Header strip */}
      <div style={{
        background: '#ffffff', borderRadius: 'var(--radius)',
        padding: 16, marginBottom: 16, borderLeft: '3px solid var(--orange)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>
          VPS Lab Analysis Report
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          {report.customer}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Batch: {report.batchId} · Date: {report.date} · Technician: {report.technician || 'N/A'}
        </div>
      </div>

      {/* Parameter grid */}
      <div className="grid-3 mb-4">
        {params.map(([k, v]) => (
          <div key={k} style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Result */}
      <div className="flex items-center gap-3 mb-4">
        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Overall Result:</span>
        <span className={`badge badge-${resultColor}`} style={{ fontSize: 13 }}>{report.result}</span>
      </div>

      {/* Recommendation */}
      {report.recommendation && (
        <div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
            Recommendation
          </div>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: 12, fontSize: 13.5, lineHeight: 1.5 }}>
            {report.recommendation}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Reports({ reports, setReports }) {
  const [view, setView] = useState(null)

  function issue(id) {
    setReports(p => p.map(r => r.id === id ? { ...r, status: 'Issued' } : r))
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Test Reports</div>
        <div className="section-sub">Oil analysis reports and customer deliverables</div>
      </div>

      <div className="table-wrap mb-4">
        <table>
          <thead>
            <tr>
              <th>Report ID</th><th>Batch</th><th>Customer</th>
              <th>Test Type</th><th>Date</th><th>Technician</th>
              <th>Result</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => {
              const rc = r.result === 'Normal' ? 'teal' : r.result === 'Warning' ? 'gray' : 'red'
              return (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--orange)' }}>{r.id}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{r.batchId}</td>
                  <td style={{ fontWeight: 500 }}>{r.customer}</td>
                  <td className="text-muted" style={{ fontSize: 12.5 }}>{r.testType}</td>
                  <td className="text-muted" style={{ fontSize: 12.5 }}>{r.date}</td>
                  <td style={{ fontSize: 12.5 }}>{r.technician || '—'}</td>
                  <td><span className={`badge badge-${rc}`}>{r.result}</span></td>
                  <td>
                    <span className={`badge badge-${r.status === 'Issued' ? 'teal' : 'blue'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => setView(r)}>
                        <Icons.Eye />
                      </button>
                      {r.status === 'Draft' && (
                        <button className="btn btn-primary btn-sm" onClick={() => issue(r.id)}>
                          Issue
                        </button>
                      )}
                      {r.status === 'Issued' && (
                        <button className="btn btn-ghost btn-sm" title="Download">
                          <Icons.Download />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!reports.length && (
              <tr><td colSpan={9}><EmptyState message="No reports generated yet" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {view && <ReportDetail report={view} onClose={() => setView(null)} />}
    </div>
  )
}
