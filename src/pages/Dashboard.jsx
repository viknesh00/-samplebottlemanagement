import React from 'react'
import { useNavigate } from 'react-router-dom'
import { STAGES, daysSince } from '../data/mockData'
import { StageBadge, PriorityBadge, StatCard, ProgressBar } from '../components/UI'
import * as Icons from '../components/Icons'

export default function Dashboard({ batches, alerts }) {
  const navigate = useNavigate()

  const active   = batches.filter(b => b.stage < 8).length
  const complete = batches.filter(b => b.stage === 8).length
  const flagged  = batches.filter(b => b.issues.length > 0).length
  const overdue  = batches.filter(b => daysSince(b.dispatched) > 14 && b.stage < 6)

  // Group by stage for pipeline view
  const pipeline = STAGES.map((label, i) => ({
    label,
    count: batches.filter(b => b.stage === i).length,
  })).filter(g => g.count > 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="section-title">Operations Dashboard</div>
        <div className="section-sub">Real-time visibility into all bottle &amp; sample movements</div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        <StatCard
          icon={<Icons.Bottle />}
          value={batches.length}
          label="Total Batches"
          delta="This cycle"
          color="#e8500a"
          bg="rgba(232,80,10,0.08)"
        />
        <StatCard
          icon={<Icons.Truck />}
          value={active}
          label="Active Batches"
          delta={`${overdue.length} overdue`}
          color="#64748b"
          bg="rgba(232,80,10,0.07)"
        />
        <StatCard
          icon={<Icons.Flask />}
          value={complete}
          label="Completed"
          delta="Reports issued"
          color="#94a3b8"
          bg="rgba(16,185,129,0.08)"
        />
        <StatCard
          icon={<Icons.Warn />}
          value={flagged}
          label="Flagged Issues"
          delta="Need attention"
          color="#f59e0b"
          bg="rgba(232,80,10,0.06)"
        />
      </div>

      {/* Pipeline + Alerts row */}
      <div className="grid-2 mb-4" style={{ gap: 20 }}>
        {/* Pipeline Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline Status</span>
          </div>
          {pipeline.map((g, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted">{g.label}</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{g.count}</span>
              </div>
              <ProgressBar value={g.count} max={batches.length} />
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Alerts</span>
            <span className="badge badge-red">{alerts.length}</span>
          </div>
          {alerts.slice(0, 4).map(a => (
            <div key={a.id} className="flex gap-3 mb-4" style={{ alignItems: 'flex-start' }}>
              <div style={{ color: a.severity === 'red' ? 'var(--red)' : 'var(--amber)', marginTop: 2, width: 16, height: 16, flexShrink: 0 }}>
                <Icons.Warn />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ fontWeight: 500, marginBottom: 2 }}>
                  {a.customer}{' '}
                  <span className="text-muted">·</span>{' '}
                  <span className="text-muted" style={{ fontSize: 11 }}>{a.batch}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.msg}</div>
              </div>
              <span className="chip">{a.age}</span>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm w-full" onClick={() => navigate('/alerts')}>
            View all alerts
          </button>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Batches</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/batches')}>View all</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Current Stage</th>
                <th>Days Active</th>
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--orange)' }}>
                      {b.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{b.customer}</td>
                  <td>{b.qty}</td>
                  <td><PriorityBadge priority={b.priority} /></td>
                  <td><StageBadge stage={b.stage} /></td>
                  <td>
                    <span className={daysSince(b.dispatched) > 14 ? 'badge badge-red' : 'badge badge-gray'}>
                      {daysSince(b.dispatched)}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
