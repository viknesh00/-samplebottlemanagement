import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtDate, daysSince, BATCH_LIFECYCLE } from '../utils/constants'
import { ScannerPanel } from './Batches'
import {
  Plus, ScanLine, Package, ArrowLeft, ArrowRight,
  TrendingUp, Activity, ChevronRight, Bell, Check,
  Layers, Inbox, RotateCcw,
} from 'lucide-react'
import {
  getDashboard, getAlerts, markAlertRead,
  normaliseApiBatch, normaliseApiAlert,
} from '../services/LabTrackApi'
import { useToast } from '../App'

/* ── Animated counter ─────────────────────────────────────────────── */
function CountUp({ value, color }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let s = 0
    const step = Math.max(1, Math.ceil(value / 20))
    const t = setInterval(() => {
      s = Math.min(s + step, value); setN(s)
      if (s >= value) clearInterval(t)
    }, 25)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{n}</span>
}

/* ── KPI card ─────────────────────────────────────────────────────── */
function KPICard({ value, label, sub, color, bg, border, icon: Icon, onClick, delay = 0 }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: `1px solid ${border}`, borderRadius: 14, padding: '18px 20px',
      cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden',
      transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 3px rgba(14,17,23,0.05)',
      animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,17,23,0.1)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(14,17,23,0.05)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ position: 'absolute', right: -4, top: 10, opacity: 0.05 }}><Icon size={64} strokeWidth={1} color={color} /></div>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={17} color={color} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px', marginBottom: 5 }}>
        <CountUp value={value} color={color} />
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 9.5, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  )
}

function StagePill({ stage }) {
  const s = BATCH_LIFECYCLE[stage ?? 0]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.short}
    </span>
  )
}

function BatchRow({ batch, bottles, onNavigate }) {
  // Support both camelCase (live API) and PascalCase (legacy)
  const withCust = batch.withCustomerCount ?? batch.WithCustomerCount ?? 0
  const returned = batch.returnedCount     ?? batch.ReturnedCount     ?? 0
  const total    = batch.totalBottles      ?? batch.TotalBottles      ?? 0
  const pct      = total > 0 ? Math.round((returned / total) * 100) : 0
  const allDone  = withCust === 0 && total > 0

  return (
    <div onClick={onNavigate}
      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 28px', alignItems: 'center', gap: 10, padding: '11px 18px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', transition: 'background 0.13s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#faf8f5'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: 'var(--accent)' }}>{(batch.batchCode ?? batch.BatchCode)}</span>
          <StagePill stage={['Order Placed','Dispatched','In Transit','Delivered'].indexOf((batch.batchStatus ?? batch.BatchStatus))} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{((batch.customerName ?? batch.CustomerName) || '')}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{total}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{withCust}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{returned}</div>
      </div>
      <div>
        {allDone
          ? <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3 }}><Check size={10} strokeWidth={3} />Done</span>
          : <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ flex: 1, height: 4, background: '#e9e5de', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)' }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', minWidth: 24, textAlign: 'right' }}>{pct}%</span>
            </div>
        }
      </div>
      <ChevronRight size={13} color="var(--border-dark)" />
    </div>
  )
}

function NotifItem({ notif, onDismiss }) {
  const isAuto = notif.type === 'auto'
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: isAuto ? 'rgba(212,42,42,0.1)' : 'rgba(201,122,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={12} color={isAuto ? 'var(--red)' : 'var(--amber)'} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {notif.customer}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)' }}>{notif.batchId}</span>
          <span style={{ fontSize: 8.5, padding: '1px 6px', borderRadius: 8, background: isAuto ? 'rgba(212,42,42,0.1)' : 'rgba(201,122,6,0.1)', color: isAuto ? 'var(--red)' : 'var(--amber)', fontWeight: 700, textTransform: 'uppercase' }}>{isAuto ? 'Auto' : 'Manual'}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4 }}>{notif.msg}</div>
        <div style={{ fontSize: 9.5, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{new Date(notif.ts).toLocaleString()}</div>
      </div>
      <button onClick={() => onDismiss(notif.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 3, borderRadius: 4, display: 'flex', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>✕</button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   - Fetches its own data once on mount (no App.jsx double-fetch)
   - Pushes topbar counts up via onTopbarUpdate
═══════════════════════════════════════════════════════════════════════ */
export default function Dashboard({ onTopbarUpdate }) {
  const navigate = useNavigate()
  const toast    = useToast()

  const [showScan,       setShowScan]       = useState(false)
  const [kpi,            setKpi]            = useState(null)
  const [recentBatches,  setRecentBatches]  = useState([])
  const [overdue,        setOverdue]        = useState([])
  const [notifications,  setNotifications]  = useState([])
  const [loading,        setLoading]        = useState(true)

  // Single load on mount — no repeated calls
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [dashRes, alertRes] = await Promise.all([
          getDashboard(),
          getAlerts(false),
        ])

        if (cancelled) return

        if (dashRes?.data) {
          setKpi(dashRes.data.kpi ?? null)
          setRecentBatches(dashRes.data.recent ?? [])
          setOverdue(dashRes.data.overdue ?? [])

          // Push counts to topbar
          const k = dashRes.data.kpi
          if (k && onTopbarUpdate) {
            onTopbarUpdate({
              batches:      k.totalBatches  ?? 0,
              withCustomer: k.withCustomer  ?? 0,
              inLab:        k.returned      ?? 0,
            })
          }
        }

        if (alertRes?.data?.alerts) {
          const norm = alertRes.data.alerts.map(normaliseApiAlert)
          setNotifications(norm)
          if (onTopbarUpdate) onTopbarUpdate({ alerts: alertRes.data.unreadCount ?? norm.filter(n => !n.read).length })
        }
      } catch (e) {
        if (!cancelled) console.error('[Dashboard] load failed:', e)
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true } // cleanup prevents state update after unmount
  }, []) // empty deps — runs exactly once

  const kpiVal = (key, fallback = 0) => kpi?.[key] ?? fallback
  const totalBottles   = kpiVal('totalBottles')
  const withCustomer   = kpiVal('withCustomer')
  const returnedToLab  = kpiVal('returned')
  const totalBatches   = kpiVal('totalBatches')
  const returnRate     = totalBottles > 0 ? Math.round((returnedToLab / totalBottles) * 100) : 0
  const unread         = notifications.filter(n => !n.read).length

  // Dummy bottles array for ScannerPanel (it's local-state only on dashboard)
  const [localBottles, setLocalBottles] = useState([])

  async function dismissNotif(localId) {
    const notif = notifications.find(n => n.id === localId)
    if (notif?._apiId) {
      try { await markAlertRead(notif._apiId, false) } catch { /* silent */ }
    }
    setNotifications(p => p.filter(n => n.id !== localId))
    if (onTopbarUpdate) onTopbarUpdate({ alerts: Math.max(0, unread - 1) })
  }

  async function markAllRead() {
    try { await markAlertRead(0, true) } catch { /* silent */ }
    setNotifications(p => p.map(n => ({ ...n, read: true })))
    if (onTopbarUpdate) onTopbarUpdate({ alerts: 0 })
  }

  function clearAll() {
    setNotifications([])
    if (onTopbarUpdate) onTopbarUpdate({ alerts: 0 })
  }

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)', animation: 'pageIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5 }}>VPS LabTrack</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Lab Management Dashboard</div>
          <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 4 }}>Bottle dispatch & return · Order → Dispatched → In Transit → Delivered</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowScan(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showScan ? 'rgba(31,94,196,0.08)' : 'var(--bg)', border: `1px solid ${showScan ? 'rgba(31,94,196,0.3)' : 'var(--border-dark)'}`, borderRadius: 9, color: showScan ? 'var(--blue)' : 'var(--text-secondary)', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', transition: 'all 0.18s' }}>
            <ScanLine size={13} strokeWidth={2} /> Show Scanner
          </button>
        </div>
      </div>

      {showScan && <div style={{ marginBottom: 20 }}><ScannerPanel bottles={localBottles} setBottles={setLocalBottles} batches={[]} onClose={() => setShowScan(false)} /></div>}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPICard value={totalBatches}  label="Total Batches"   sub="All dispatched"        color="var(--accent)" bg="rgba(232,93,10,0.08)"  border="rgba(232,93,10,0.2)"  icon={Package}    onClick={() => navigate('/batches')} delay={0}   />
        <KPICard value={totalBottles}  label="Total Bottles"   sub="Across all batches"    color="var(--blue)"   bg="rgba(31,94,196,0.08)"  border="rgba(31,94,196,0.2)"  icon={Layers}     onClick={() => navigate('/lab')}     delay={60}  />
        <KPICard value={withCustomer}  label="With Customer"   sub="Awaiting return"       color="var(--amber)"  bg="rgba(201,122,6,0.08)"  border="rgba(201,122,6,0.2)"  icon={ArrowRight}  onClick={() => navigate('/lab')}     delay={120} />
        <KPICard value={returnedToLab} label="Returned to Lab" sub={`${returnRate}% rate`} color="var(--green)"  bg="rgba(10,124,82,0.08)"  border="rgba(10,124,82,0.2)"  icon={ArrowLeft}   onClick={() => navigate('/lab')}     delay={180} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, marginBottom: 18 }}>

        {/* Batch table */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(14,17,23,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(232,93,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={13} color="var(--accent)" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Batch Tracking</div>
                <div style={{ fontSize: 9.5, color: 'var(--text-primary)' }}>Live stage · dispatch · return status</div>
              </div>
            </div>
            <button onClick={() => navigate('/batches')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'var(--bg)', border: '1px solid var(--border-dark)', borderRadius: 7, fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              View All <ChevronRight size={11} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 28px', gap: 10, padding: '7px 18px', background: '#12171e' }}>
            {['Batch / Stage', 'Total', 'With Cust.', 'Returned', 'Return %', ''].map((h, i) => (
              <div key={h} style={{ fontSize: 8, fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', textAlign: i > 0 && i < 4 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {loading && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-primary)', fontSize: 12 }}>Loading…</div>}
          {!loading && recentBatches.map(b => <BatchRow key={b.Id || b.BatchCode} batch={b} onNavigate={() => navigate('/batches')} />)}
          {!loading && recentBatches.length === 0 && (
            <div style={{ padding: '44px', textAlign: 'center' }}>
              <Inbox size={28} style={{ margin: '0 auto 10px', opacity: 0.15, display: 'block' }} strokeWidth={1.5} />
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>No batches yet. Create your first batch.</div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bottle overview */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(14,17,23,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Bottle Overview</div>
            {[
              { label: 'With Customer',  value: withCustomer,  color: 'var(--amber)', bg: 'rgba(201,122,6,0.08)' },
              { label: 'Returned to Lab',value: returnedToLab, color: 'var(--green)', bg: 'rgba(10,124,82,0.08)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: s.bg, marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--text-primary)', marginBottom: 4 }}>
                <span>Return Rate</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)' }}>{returnRate}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${returnRate}%`, background: 'var(--green)', borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
              </div>
            </div>
          </div>

          {/* Pending returns */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(14,17,23,0.05)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={12} color="var(--amber)" strokeWidth={2} />
              Pending Returns
            </div>
            {overdue.length > 0
              ? overdue.slice(0, 5).map(o => (
                  <div key={o.id ?? o.Id ?? o.batchCode ?? (o.batchCode ?? o.BatchCode)} onClick={() => navigate('/batches')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: 'rgba(212,42,42,0.04)', border: '1px solid rgba(212,42,42,0.15)', marginBottom: 7, cursor: 'pointer' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{(o.batchCode ?? o.BatchCode)}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{o.customerName ?? o.CustomerName ?? ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>{(o.withCustomerCount ?? o.WithCustomerCount)}</div>
                      <div style={{ fontSize: 8.5, color: 'var(--red)', textTransform: 'uppercase', marginTop: 1 }}>Overdue</div>
                    </div>
                  </div>
                ))
              : (
                <div style={{ textAlign: 'center', padding: '18px', color: 'var(--text-primary)', fontSize: 11 }}>
                  <Check size={16} style={{ margin: '0 auto 6px', display: 'block' }} color="var(--green)" strokeWidth={2} />
                  All bottles returned
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Notifications panel */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(14,17,23,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: unread > 0 ? 'rgba(212,42,42,0.08)' : 'rgba(10,124,82,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={13} color={unread > 0 ? 'var(--red)' : 'var(--green)'} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Notifications</div>
          {unread > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 9.5, fontWeight: 800, padding: '2px 7px' }}>{unread} new</span>}
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', flex: 1 }}>
            Auto-triggered when bottles not returned 30+ days after delivery
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(10,124,82,0.07)', border: '1px solid rgba(10,124,82,0.2)', borderRadius: 7, fontSize: 10.5, fontWeight: 600, color: 'var(--green)', cursor: 'pointer' }}>
                <Check size={10} strokeWidth={2.5} /> Mark read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border-dark)', borderRadius: 7, fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <RotateCcw size={10} strokeWidth={2} /> Clear all
              </button>
            )}
          </div>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {notifications.length > 0
            ? [...notifications].sort((a, b) => b.ts - a.ts).map(n => <NotifItem key={n.id} notif={n} onDismiss={dismissNotif} />)
            : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(10,124,82,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={18} color="var(--green)" strokeWidth={2} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>No Notifications</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 340, lineHeight: 1.5 }}>
                  Auto-alerts fire when a delivered batch has bottles not returned after 30 days.
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
