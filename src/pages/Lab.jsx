import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { fmtDate, today } from '../utils/constants'
import { SearchBar } from '../components/UI'
import { ScannerPanel } from './Batches'
import { useToast } from '../App'
import { Package, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, ScanLine, FlaskConical, Users, RotateCcw, Layers } from 'lucide-react'
import {
  getBatches, getBatchDetail,
  markBottleReturned, reDispatchBottle,
  normaliseApiBatch, normaliseApiBottle,
} from '../services/LabTrackApi'

/* ── BottleRow — UI unchanged ─────────────────────────────────────── */
function BottleRow({ bottle, batchDelivered, onMarkReturned, onMarkWithCustomer }) {
  const isWithCust   = bottle.status === 'With Customer'
  const isReturned   = bottle.status === 'Returned to Lab'
  const isOrderPlaced = bottle.status === 'Order Placed'
  return (
    <tr>
      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--accent)' }}>{bottle.id}</span></td>
      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--purple)', fontWeight: 700 }}>{bottle.serialNumber || '—'}</span></td>
      <td><div style={{ fontSize: 11.5, fontWeight: 600 }}>{bottle.assetName || '—'}</div></td>
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
          background: isReturned   ? 'rgba(10,124,82,0.1)'  :
                      isWithCust   ? 'rgba(201,122,6,0.1)'  :
                                     'rgba(103,48,194,0.08)',
          color:      isReturned   ? 'var(--green)'         :
                      isWithCust   ? 'var(--amber)'         :
                                     'var(--purple)',
          border:     `1px solid ${isReturned ? 'rgba(10,124,82,0.25)' : isWithCust ? 'rgba(201,122,6,0.25)' : 'rgba(103,48,194,0.2)'}`,
        }}>
          {isReturned   ? <ArrowLeft  size={9} strokeWidth={2.5} /> :
           isWithCust   ? <ArrowRight size={9} strokeWidth={2.5} /> :
                          <Package    size={9} strokeWidth={2.5} />}
          {bottle.status}
        </span>
      </td>
      <td><span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{bottle.dispatchedDate ? fmtDate(bottle.dispatchedDate) : '—'}</span></td>
      <td><span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: isReturned ? 'var(--green)' : 'var(--text-muted)' }}>{bottle.returnedDate ? fmtDate(bottle.returnedDate) : '—'}</span></td>
      <td>
        {/* Actions are only available once the batch has been Delivered */}
        {!batchDelivered
          ? <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting delivery</span>
          : isWithCust
            ? <button className="btn btn-sm btn-primary" style={{ fontSize: 10.5, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => onMarkReturned(bottle)}><ArrowLeft size={11} strokeWidth={2.5} />Mark Returned</button>
            : isReturned
              ? <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><ArrowLeft size={10} strokeWidth={2.5} />Returned</span>
              : <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
        }
      </td>
    </tr>
  )
}

/* ── BatchGroup — loads bottles from API on expand ────────────────── */
function BatchGroup({ batch, onBottleUpdated }) {
  const [expanded,  setExpanded]  = useState(false)
  const [bottles,   setBottles]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const toast = useToast()

  // Counts — only count "With Customer" once batch is Dispatched or later (stage >= 1).
  // An Order Placed batch has not yet been sent, so no bottles are "with customer" yet.
  const isDispatched = (batch.stage ?? 0) >= 1
  const withCust = expanded
    ? (isDispatched ? bottles.filter(b => b.status === 'With Customer').length : 0)
    : (isDispatched ? (batch._withCust ?? 0) : 0)
  const returned = expanded ? bottles.filter(b => b.status === 'Returned to Lab').length : (batch._returned ?? 0)
  const total    = expanded ? bottles.length : (batch.qty ?? 0)
  const pct      = total > 0 ? Math.round((returned / total) * 100) : 0
  // 'All returned' only makes sense once batch has been Delivered (stage 3)
  // and all bottles have been sent out (withCust was > 0 at some point)
  const isDelivered = (batch.stage ?? 0) === 3
  const allDone  = isDelivered && withCust === 0 && returned > 0

  async function loadBottles() {
    if (!batch._apiId) return
    setLoading(true)
    try {
      const res = await getBatchDetail(batch._apiId)
      const _bottles = res?.data?.bottles ?? res?.data?.Bottles ?? []
      if (_bottles.length >= 0) {
        setBottles(_bottles.map(r => ({ ...normaliseApiBottle(r), batchId: batch.id })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  function toggle() {
    if (!expanded) loadBottles()
    setExpanded(p => !p)
  }

  async function handleMarkReturned(bottle) {
    try {
      await markBottleReturned(bottle._apiId, bottle._trackerId)
      setBottles(p => p.map(b => b.id === bottle.id ? { ...b, status: 'Returned to Lab', returnedDate: today() } : b))
      toast(`✓ ${bottle.id} returned to lab`, 'success')
      if (onBottleUpdated) onBottleUpdated()
    } catch (e) { toast(e.message || 'Failed', 'error') }
  }

  async function handleMarkWithCustomer(bottle) {
    try {
      await reDispatchBottle(bottle._apiId, bottle._trackerId)
      setBottles(p => p.map(b => b.id === bottle.id ? { ...b, status: 'With Customer', returnedDate: null } : b))
      toast(`↗ ${bottle.id} re-dispatched`, 'info')
      if (onBottleUpdated) onBottleUpdated()
    } catch (e) { toast(e.message || 'Failed', 'error') }
  }

  return (
    <div className="card" style={{ marginBottom: 10, overflow: 'hidden', padding: 0 }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        {expanded ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--accent)' }}>{batch.id}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{batch.customer}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {batch.stage === 0 ? `Order Placed ${fmtDate(batch.orderDate)}` :
             batch.stage === 1 ? `Dispatched ${fmtDate(batch.dispatchedDate)}` :
             batch.stage === 2 ? `In Transit ${fmtDate(batch.transitDate || batch.dispatchedDate)}` :
             `Delivered ${fmtDate(batch.deliveredDate)}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {allDone && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(10,124,82,0.1)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(10,124,82,0.2)' }}>✓ All returned</span>}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { val: withCust, label: 'With Cust.', color: 'var(--amber)', bg: 'rgba(201,122,6,0.08)', border: 'rgba(201,122,6,0.18)' },
              { val: returned, label: 'Returned',   color: 'var(--green)', bg: 'rgba(10,124,82,0.08)', border: 'rgba(10,124,82,0.18)' },
              { val: total,    label: 'Total',       color: 'var(--text-primary)', bg: 'rgba(14,17,23,0.04)', border: 'var(--border)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 10px', borderRadius: 8, background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontSize: 7.5, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 1, opacity: 0.8 }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>Return rate</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: allDone ? 'var(--green)' : 'var(--text-secondary)' }}>{pct}%</span>
            </div>
            <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: allDone ? 'var(--green)' : 'var(--accent)', borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        loading
          ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Loading bottles…</div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Bottle ID', 'Serial No.', 'Asset', 'Status', 'Dispatched', 'Returned', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {bottles.map(bottle => (
                    <BottleRow key={bottle.id} bottle={bottle}
                      batchDelivered={isDelivered}
                      onMarkReturned={handleMarkReturned}
                      onMarkWithCustomer={handleMarkWithCustomer}
                    />
                  ))}
                  {bottles.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No bottles in this batch</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   MAIN LAB PAGE — API-wired, UI unchanged
═══════════════════════════════════════════════════════════════════════ */
export default function Lab({ onTopbarUpdate }) {
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [showScan,  setShowScan]  = useState(false)
  const [batches,   setBatches]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [localBottles, setLocalBottles] = useState([]) // for scanner panel only

  // Reloadable — called after bottle status changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBatches({ pageSize: 200 })
      const _data = Array.isArray(res?.data?.data) ? res.data.data
                  : Array.isArray(res?.data?.Data) ? res.data.Data
                  : Array.isArray(res?.data)       ? res.data : []
      const norm = _data.map(r => ({
        ...normaliseApiBatch(r),
        _withCust: r.withCustomerCount ?? r.WithCustomerCount ?? 0,
        _returned: r.returnedCount     ?? r.ReturnedCount     ?? 0,
      }))
      setBatches(norm)
      if (onTopbarUpdate) onTopbarUpdate({
        withCustomer: norm.reduce((s, b) => s + ((b.stage ?? 0) >= 1 ? b._withCust : 0), 0),
        inLab:        norm.reduce((s, b) => s + b._returned, 0),
      })
    } catch { /* silent */ }
    setLoading(false)
  }, [onTopbarUpdate])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const res = await getBatches({ pageSize: 200 })
        if (cancelled) return
        const _list = Array.isArray(res?.data?.data) ? res.data.data
                    : Array.isArray(res?.data?.Data) ? res.data.Data
                    : Array.isArray(res?.data)       ? res.data
                    : []
        const norm = _list.map(r => ({
          ...normaliseApiBatch(r),
          _withCust: r.withCustomerCount ?? r.WithCustomerCount ?? 0,
          _returned: r.returnedCount     ?? r.ReturnedCount     ?? 0,
        }))
        setBatches(norm)
        if (onTopbarUpdate) onTopbarUpdate({
          withCustomer: norm.reduce((s, b) => s + b._withCust, 0),
          inLab:        norm.reduce((s, b) => s + b._returned, 0),
        })
      } catch { /* silent */ }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, []) // runs exactly once

  const totalBottles  = batches.reduce((s, b) => s + (b.qty || 0), 0)
  // Only count "With Customer" for batches that are Dispatched or later (stage >= 1)
  const withCustomer  = batches.reduce((s, b) => s + ((b.stage ?? 0) >= 1 ? (b._withCust || 0) : 0), 0)
  const returnedToLab = batches.reduce((s, b) => s + (b._returned || 0), 0)

  const filtered = useMemo(() => {
    let list = batches
    if (filter === 'with_customer') list = list.filter(b => (b._withCust || 0) > 0)
    if (filter === 'returned')      list = list.filter(b => (b._returned || 0) > 0)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(b => b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q))
    }
    return list
  }, [batches, filter, search])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">Lab Management</div>
          <div className="page-header-title">Bottle Tracking</div>
          <div className="page-header-sub">Track every bottle — with customer vs returned to lab</div>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowScan(p => !p)} style={{ color: showScan ? 'var(--blue)' : undefined, borderColor: showScan ? 'var(--blue)' : undefined }}>
          <ScanLine size={13} strokeWidth={2} /> {showScan ? 'Hide' : 'Show'} Scanner
        </button>
      </div>

      {showScan && <div style={{ marginBottom: 20 }}><ScannerPanel bottles={localBottles} setBottles={setLocalBottles} batches={batches} onClose={() => setShowScan(false)} /></div>}

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { value: totalBottles,  label: 'Total Bottles',   sub: 'All batches',          color: 'var(--accent)', bg: 'rgba(232,93,10,0.08)',  border: 'rgba(232,93,10,0.2)',  Icon: FlaskConical },
          { value: withCustomer,  label: 'With Customer',   sub: 'Awaiting return',      color: 'var(--amber)',  bg: 'rgba(201,122,6,0.08)',  border: 'rgba(201,122,6,0.2)',  Icon: Users        },
          { value: returnedToLab, label: 'Returned to Lab', sub: 'Back in lab',          color: 'var(--green)',  bg: 'rgba(10,124,82,0.08)',  border: 'rgba(10,124,82,0.2)',  Icon: RotateCcw    },
          { value: batches.length,label: 'Batches',         sub: 'With tracked bottles', color: 'var(--blue)',   bg: 'rgba(31,94,196,0.08)',  border: 'rgba(31,94,196,0.2)',  Icon: Layers       },
        ].map(({ value, label, sub, color, bg, border, Icon }) => (
          <div key={label} style={{ flex: '1 1 130px', background: '#fff', border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 4px rgba(14,17,23,0.05)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
            <div style={{ position: 'absolute', right: 6, top: 12, opacity: 0.05, pointerEvents: 'none' }}><Icon size={52} strokeWidth={1} color={color} /></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={14} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2, color: 'var(--text-secondary)' }}>{label}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200 }}><SearchBar value={search} onChange={setSearch} placeholder="Search batch ID or customer…" /></div>
        <div className="tab-bar">
          {[
            { key: 'all',           label: 'All',          count: batches.length },
            { key: 'with_customer', label: 'With Customer', count: withCustomer  },
            { key: 'returned',      label: 'Returned',      count: returnedToLab },
          ].map(t => (
            <button key={t.key} className={`tab${filter === t.key ? ' active' : ''}`} onClick={() => setFilter(t.key)}>
              {t.label}<span className={filter === t.key ? 'tab-count' : 'tab-count-inactive'}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</div>}
      {!loading && filtered.map(b => <BatchGroup key={b.id} batch={b} onBottleUpdated={load} />)}
      {!loading && filtered.length === 0 && (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Package size={34} style={{ margin: '0 auto 12px', opacity: 0.15, display: 'block', color: 'var(--accent)' }} strokeWidth={1.5} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No bottles found{search ? ` matching "${search}"` : ''}</div>
        </div>
      )}
    </div>
  )
}