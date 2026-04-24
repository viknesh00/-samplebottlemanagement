import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { daysSince, fmtDate } from '../utils/constants'
import { getAlerts, markAlertRead, normaliseApiAlert, getBatches, normaliseApiBatch } from '../services/LabTrackApi'
import { useToast } from '../App'
import {
  Bell, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Eye, Package, ArrowRight, ChevronRight,
  RotateCcw, ShieldAlert, TrendingUp,
} from 'lucide-react'

const SEV = {
  overdue: { label: 'Overdue',         color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)' },
  manual:  { label: 'Manual Reminder', color: '#b45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.2)'  },
}

function KPI({ val, label, color, bg, border, icon: Icon }) {
  return (
    <div style={{
      flex: '1 1 140px', background: '#fff',
      border: `1px solid ${border}`, borderRadius: 14,
      padding: '16px 18px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(14,17,23,0.05)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ position: 'absolute', right: 6, top: 12, opacity: 0.05 }}><Icon size={52} strokeWidth={1} color={color} /></div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={15} color={color} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  )
}

function AlertRow({ alert, onMarkRead, onView }) {
  const s = SEV[alert.type] ?? SEV.manual
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 0, position: 'relative',
        background: hover ? '#fafaf9' : alert.read ? 'var(--bg)' : '#fff',
        borderBottom: '1px solid var(--border-light)',
        opacity: alert.read ? 0.65 : 1,
        transition: 'background 0.15s, opacity 0.2s',
      }}
    >
      <div style={{ width: 4, flexShrink: 0, alignSelf: 'stretch', background: alert.read ? 'transparent' : s.color }} />
      <div style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: alert.read ? 'rgba(14,17,23,0.05)' : s.bg,
          border: `1px solid ${alert.read ? 'var(--border)' : s.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldAlert size={14} color={alert.read ? 'var(--text-muted)' : s.color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ flex: 1, padding: '12px 14px 12px 4px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(232,93,10,0.07)', color: 'var(--accent)', border: '1px solid rgba(232,93,10,0.2)' }}>{alert.batch}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.customer}</span>
          {alert.read && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>
              <CheckCircle size={10} strokeWidth={2.5} /> Read
            </span>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 10px' }}>{alert.msg}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Clock size={10} strokeWidth={2} /> {alert.age}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {!alert.read && (
              <button onClick={() => onMarkRead(alert.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: 'rgba(10,124,82,0.07)', border: '1px solid rgba(10,124,82,0.22)', fontSize: 11, fontWeight: 700, color: 'var(--green)', cursor: 'pointer' }}>
                <CheckCircle size={11} strokeWidth={2.5} /> Mark read
              </button>
            )}
            <button onClick={onView} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: '#fff', border: '1px solid var(--border-dark)', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <Eye size={11} strokeWidth={2} /> View Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverdueCard({ batch, rank }) {
  const urgency = batch._days > 60 ? '#dc2626' : batch._days > 45 ? '#c97a06' : '#1f5ec4'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--border-light)', background: '#fff', transition: 'background 0.13s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#faf8f5'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: rank === 0 ? 'rgba(220,38,38,0.1)' : 'rgba(14,17,23,0.05)', border: `1px solid ${rank === 0 ? 'rgba(220,38,38,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: rank === 0 ? '#dc2626' : 'var(--text-muted)' }}>#{rank + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: 'var(--accent)', lineHeight: 1.2 }}>{batch.id}</div>
        <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>{batch.customer}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8, background: `${urgency}18`, color: urgency, border: `1px solid ${urgency}35` }}>{batch._days}d</div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>overdue</div>
      </div>
    </div>
  )
}

export default function AlertsPage({ onTopbarUpdate }) {
  const navigate = useNavigate()
  const toast    = useToast()
  const [apiAlerts,  setApiAlerts]  = useState([])
  const [batches,    setBatches]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [spinning,   setSpinning]   = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const [alertRes, batchRes] = await Promise.all([getAlerts(false), getBatches({ pageSize: 200 })])
        if (cancelled) return
        if (alertRes?.data?.alerts) {
          const norm = alertRes.data.alerts.map(normaliseApiAlert)
          setApiAlerts(norm)
          if (onTopbarUpdate) onTopbarUpdate({ alerts: alertRes.data.unreadCount ?? norm.filter(n => !n.read).length })
        }
        const _list = Array.isArray(batchRes?.data?.data) ? batchRes.data.data
                    : Array.isArray(batchRes?.data?.Data) ? batchRes.data.Data : []
        setBatches(_list.map(normaliseApiBatch))
      } catch (e) { if (!cancelled) console.error('[AlertsPage]', e) }
      if (!cancelled) { setLoading(false); setSpinning(false) }
    }
    run()
    return () => { cancelled = true }
  }, [refreshKey])

  const overdueBatches = batches
    .filter(b => b.stage === 3 && b.deliveredDate && daysSince(b.deliveredDate) > 30)
    .map(b => ({ ...b, _days: daysSince(b.deliveredDate) }))
    .sort((a, b) => b._days - a._days)

  const alertCards = apiAlerts.map(a => ({
    id: a.id, _apiId: a._apiId, customer: a.customer, batch: a.batchId,
    type: a.type === 'auto' ? 'overdue' : 'manual',
    msg: a.msg,
    age: a.ts ? (() => {
      const d = Math.floor((Date.now() - a.ts) / 864e5)
      return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
    })() : '—',
    read: a.read,
  }))

  const unread  = alertCards.filter(a => !a.read).length
  const overdue = alertCards.filter(a => a.type === 'overdue').length
  const manual  = alertCards.filter(a => a.type === 'manual').length
  const longest = overdueBatches[0]

  const TABS = [
    { key: 'all',     label: 'All',           count: alertCards.length },
    { key: 'unread',  label: 'Unread',        count: unread },
    { key: 'overdue', label: 'Overdue',       count: overdue },
    { key: 'manual',  label: 'Manual',        count: manual },
  ]

  const visible = alertCards.filter(a => {
    if (filter === 'unread')  return !a.read
    if (filter === 'overdue') return a.type === 'overdue'
    if (filter === 'manual')  return a.type === 'manual'
    return true
  })

  async function handleMarkRead(localId) {
    const a = apiAlerts.find(x => x.id === localId)
    if (a?._apiId) { try { await markAlertRead(a._apiId, false) } catch {} }
    setApiAlerts(p => p.map(x => x.id === localId ? { ...x, read: true } : x))
    if (onTopbarUpdate) onTopbarUpdate({ alerts: Math.max(0, unread - 1) })
  }
  async function handleMarkAll() {
    try { await markAlertRead(0, true); toast('All alerts marked as read', 'success') } catch {}
    setApiAlerts(p => p.map(a => ({ ...a, read: true })))
    if (onTopbarUpdate) onTopbarUpdate({ alerts: 0 })
  }
  function handleRefresh() { setSpinning(true); setRefreshKey(k => k + 1) }

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)', animation: 'pageIn 0.35s cubic-bezier(0.16,1,0.3,1) both', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5 }}>System</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Alerts &amp; Follow-ups</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={11} strokeWidth={2} /> Auto-generated when bottles are unreturned 30+ days after delivery
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {unread > 0 && (
            <button onClick={handleMarkAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(10,124,82,0.08)', border: '1.5px solid rgba(10,124,82,0.25)', borderRadius: 9, fontSize: 12, fontWeight: 700, color: 'var(--green)', cursor: 'pointer' }}>
              <CheckCircle size={13} strokeWidth={2.5} /> Mark all read
              <span style={{ background: 'rgba(10,124,82,0.15)', borderRadius: 20, padding: '0 6px', fontSize: 10 }}>{unread}</span>
            </button>
          )}
          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#fff', border: '1.5px solid var(--border-dark)', borderRadius: 9, cursor: 'pointer', color: 'var(--text-secondary)', transition: 'transform 0.6s ease', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}>
            <RefreshCw size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <KPI val={alertCards.length}      label="Total Alerts"    color="var(--text-primary)" bg="rgba(14,17,23,0.04)"  border="var(--border)"           icon={Bell} />
        <KPI val={unread}                 label="Unread"          color="var(--red)"          bg="rgba(212,42,42,0.07)" border="rgba(212,42,42,0.2)"     icon={ShieldAlert} />
        <KPI val={overdue}                label="Overdue Alerts"  color="var(--amber)"        bg="rgba(201,122,6,0.07)" border="rgba(201,122,6,0.2)"     icon={AlertTriangle} />
        <KPI val={overdueBatches.length}  label="Overdue Batches" color="var(--blue)"         bg="rgba(31,94,196,0.07)" border="rgba(31,94,196,0.2)"     icon={Package} />
      </div>

      {/* Banner */}
      {overdueBatches.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', marginBottom: 22, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderLeft: '4px solid #dc2626', borderRadius: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} color="#dc2626" strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>{overdueBatches.length} batch{overdueBatches.length > 1 ? 'es' : ''} require immediate attention</div>
            <div style={{ fontSize: 11.5, color: '#b91c1c' }}>Delivered 30+ days ago with bottles still not returned — manual follow-up required.</div>
          </div>
          <button onClick={() => navigate('/batches')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: '#dc2626', cursor: 'pointer', flexShrink: 0 }}>
            View Batches <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* LEFT — alert feed */}
        <div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-deep)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)} style={{ flex: 1, padding: '7px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.18s', background: filter === t.key ? '#fff' : 'transparent', color: filter === t.key ? 'var(--accent)' : 'var(--text-secondary)', boxShadow: filter === t.key ? 'var(--shadow-xs)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {t.label}
                <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: filter === t.key ? 'rgba(232,93,10,0.12)' : 'var(--border-light)', color: filter === t.key ? 'var(--accent)' : 'var(--text-muted)' }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Alert card container */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(14,17,23,0.05)' }}>
            {/* List header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <Bell size={13} color="var(--accent)" strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {filter === 'all' ? 'All Notifications' : TABS.find(t => t.key === filter)?.label}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: unread > 0 ? 'rgba(212,42,42,0.1)' : 'rgba(10,124,82,0.1)', color: unread > 0 ? 'var(--red)' : 'var(--green)' }}>
                {unread > 0 ? `${unread} unread` : 'All read'}
              </span>
            </div>

            {loading && (
              <div style={{ padding: '52px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                <RotateCcw size={20} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3, animation: 'spin 1s linear infinite' }} strokeWidth={1.5} />
                Loading alerts…
              </div>
            )}

            {!loading && visible.length > 0 && visible.map((a, i) => (
              <AlertRow key={a.id} alert={a} idx={i} onMarkRead={handleMarkRead} onView={() => navigate('/batches')} />
            ))}

            {!loading && visible.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 20px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(10,124,82,0.08)', border: '1px solid rgba(10,124,82,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <CheckCircle size={26} color="var(--green)" strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>All clear!</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.6 }}>
                  {filter === 'all' ? 'No alerts at this time. All batches are on track.' : `No ${filter} alerts found.`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — overdue panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Overdue batch list */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(14,17,23,0.05)' }}>
            <div style={{ padding: '12px 16px', background: '#0a0d12', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={13} color="#f87171" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Overdue Batches</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Delivered &gt; 30 days · unreturned</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: overdueBatches.length > 0 ? 'rgba(220,38,38,0.25)' : 'rgba(10,124,82,0.25)', color: overdueBatches.length > 0 ? '#fca5a5' : '#6ee7b7' }}>{overdueBatches.length}</span>
            </div>

            {overdueBatches.length === 0
              ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <CheckCircle size={22} color="var(--green)" strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>No overdue batches</div>
                </div>
              )
              : overdueBatches.map((b, i) => <OverdueCard key={b.id} batch={b} rank={i} />)
            }

            {overdueBatches.length > 0 && (
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                <button onClick={() => navigate('/batches')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: '#fff', border: '1px solid var(--border-dark)', borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  View all in Batches <ChevronRight size={12} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* Longest overdue stat */}
          {longest && (
            <div style={{ padding: '16px 18px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, rgba(220,38,38,0.02) 100%)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <TrendingUp size={12} color="#dc2626" strokeWidth={2} />
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#dc2626' }}>Longest Overdue</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: '#dc2626', lineHeight: 1, letterSpacing: '-1px' }}>
                {longest._days}<span style={{ fontSize: 20, fontWeight: 700 }}>d</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginTop: 6 }}>{longest.id}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 600, marginTop: 3 }}>{longest.customer}</div>
            </div>
          )}

          {/* How alerts work */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(31,94,196,0.04)', border: '1px solid rgba(31,94,196,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Bell size={11} color="var(--blue)" strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue)' }}>How alerts work</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-primary)', lineHeight: 1.65 }}>
              Alerts are <strong>auto-generated</strong> when a delivered batch has unreturned bottles after 30 days. You can also create <strong>manual reminders</strong> from the Batches page.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
