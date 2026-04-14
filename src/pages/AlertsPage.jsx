import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StageBadge, PriorityBadge, useSortPage, SortTh, Pagination } from '../components/UI'
import * as Icons from '../components/Icons'
import { daysSince } from '../data/mockData'

const PAGE_SIZE = 15

export default function AlertsPage({ alerts, batches }) {
  const navigate = useNavigate()
  const overdue  = batches.filter(b => daysSince(b.dispatched) > 14 && b.stage < 6)

  // Enrich overdue with numeric days for sorting
  const overdueEnriched = overdue.map(b => ({ ...b, _days: daysSince(b.dispatched) }))

  const [pageSize, setPageSize] = useState(15)
  const { paged, sortKey, sortDir, toggleSort, page, setPage, totalPages } =
    useSortPage(overdueEnriched, { key: '_days', dir: 'desc' }, pageSize)

  const TH = ({ label, sk }) => (
    <SortTh label={label} sortKey={sk} active={sortKey===sk} dir={sortDir} onSort={toggleSort} />
  )

  const SEVERITY_LABELS = {
    'wrong-location': 'Wrong Location',
    'insufficient':   'Insufficient Qty',
    'no-update':      'No Update',
    'unacknowledged': 'Unacknowledged',
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Alerts &amp; Follow-ups</div>
        <div className="section-sub">Issues requiring immediate attention to avoid cycle delays</div>
      </div>

      {overdue.length > 0 && (
        <div className="alert alert-red mb-4">
          <div style={{ width:16, height:16, flexShrink:0, marginTop:1 }}><Icons.Warn /></div>
          <div>
            <strong>{overdue.length} batch{overdue.length > 1 ? 'es' : ''}</strong> have been
            active for over 14 days without completing the cycle. Manual follow-up required immediately.
          </div>
        </div>
      )}

      {/* Alert Cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
        {alerts.map(a => (
          <div key={a.id} className="card card-sm"
            style={{ borderLeft:`3px solid var(--${a.severity==='red'?'red':'amber'})`, display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ color:`var(--${a.severity==='red'?'red':'amber'})`, width:18, height:18, flexShrink:0, marginTop:2 }}>
              <Icons.Warn />
            </div>
            <div style={{ flex:1 }}>
              <div className="flex items-center gap-3 mb-1" style={{ flexWrap:'wrap' }}>
                <span style={{ fontWeight:600, fontSize:14 }}>{a.customer}</span>
                <span className="chip">{a.batch}</span>
                <span className={`badge badge-${a.severity==='red'?'red':'amber'}`}>{SEVERITY_LABELS[a.type]||a.type}</span>
              </div>
              <div style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:10 }}>{a.msg}</div>
              <div className="flex gap-2" style={{ flexWrap:'wrap' }}>
                <button className="btn btn-ghost btn-sm"><Icons.Mail /> Send Reminder</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/batches')}>View Batch</button>
                <span className="chip" style={{ marginLeft:'auto' }}>Flagged {a.age} ago</span>
              </div>
            </div>
          </div>
        ))}
        {!alerts.length && (
          <div className="empty-state"><Icons.Alerts /><p>No active alerts — all good!</p></div>
        )}
      </div>

      {/* Overdue Table with sort + pagination */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Overdue Batches (&gt;14 days)</span>
          <span className="badge badge-red">{overdue.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <TH label="Batch ID"      sk="id" />
                <TH label="Customer"      sk="customer" />
                <th>Current Stage</th>
                <TH label="Days Active"   sk="_days" />
                <TH label="Priority"      sk="priority" />
              </tr>
            </thead>
            <tbody>
              {paged.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily:'monospace', fontSize:12.5, color:'var(--orange)' }}>{b.id}</td>
                  <td style={{ fontWeight:500 }}>{b.customer}</td>
                  <td><StageBadge stage={b.stage} /></td>
                  <td><span className="badge badge-red">{b._days}d</span></td>
                  <td><PriorityBadge priority={b.priority} /></td>
                </tr>
              ))}
              {!paged.length && (
                <tr><td colSpan={5}><div className="empty-state" style={{ padding:'24px' }}><p>No overdue batches</p></div></td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={overdue.length} pageSize={pageSize} onPageSizeChange={setPageSize} />
        </div>
      </div>
    </div>
  )
}
