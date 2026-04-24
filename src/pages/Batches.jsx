import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { SAMPLE_TYPES, BATCH_LIFECYCLE, COURIERS, fmtDate, today, daysSince } from '../utils/constants'
import { Modal, SearchBar, SortTh, Pagination, DatePicker } from '../components/UI'
import LabelPrint from '../components/LabelPrint'
import { useScanner, useToast } from '../App'
import {
  Plus, ChevronDown, ChevronRight, Printer, Layers,
  ArrowRight, ArrowLeft, Check, ScanLine, X as XIcon,
  Search, Package, Bell, Camera, Usb,
  ShoppingCart, Truck, Navigation, MapPin,
} from 'lucide-react'
import * as Icons from '../components/Icons'
import {
  getBatches, getBatchDetail, saveBatch, bulkInsertBottles,
  markBottleReturned, reDispatchBottle, scanBottle, getLabelsByTrackerId,
  getTotCustomers, getAssetsByCustomer,
  normaliseApiBatch, normaliseApiBottle,
  STAGE_TO_STATUS, STATUS_DATE_FIELD,
} from '../services/LabTrackApi'

/* ════════════════════════════════════════════════════════════════════
   LIFECYCLE STEPPER — unchanged UI
═══════════════════════════════════════════════════════════════════════ */
const STAGE_ICONS = [
  <ShoppingCart size={10} strokeWidth={2.5} />,
  <Truck        size={10} strokeWidth={2.5} />,
  <Navigation   size={10} strokeWidth={2.5} />,
  <MapPin       size={10} strokeWidth={2.5} />,
]

function LifecycleStepper({ batch, onAdvance, compact = false }) {
  const stages  = BATCH_LIFECYCLE
  const current = batch.stage ?? 0
  const s = stages[current]
  const canAdvance = onAdvance && current < stages.length - 1
  return (
    <span
      onClick={() => canAdvance && onAdvance(current)}
      title={canAdvance ? `Advance to "${stages[current + 1]?.label}"` : s.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
        background: s.bg, color: s.color, border: `1px solid ${s.color}55`,
        letterSpacing: '0.3px',
        cursor: canAdvance ? 'pointer' : 'default',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { if (canAdvance) e.currentTarget.style.opacity = '0.75' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {STAGE_ICONS[current]}
      {s.label}
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════════
   BOTTLE SCANNER — API-wired, UI unchanged
═══════════════════════════════════════════════════════════════════════ */
export function ScannerPanel({ bottles, setBottles, batches, onClose }) {
  const [mode,    setMode]   = useState('manual')
  const [input,   setInput]  = useState('')
  const [result,  setResult] = useState(null)   // { bottle, batch } — normalised shapes
  const [flash,   setFlash]  = useState(null)
  const inputRef  = useRef()
  const videoRef  = useRef()
  const streamRef = useRef()
  const toast     = useToast()
  const { registerScanListener } = useScanner()

  useEffect(() => { if (mode === 'manual') setTimeout(() => inputRef.current?.focus(), 50) }, [mode])

  // USB scanner global hook — calls API lookup
  useEffect(() => {
    return registerScanListener(code => processCode(code.trim()))
  }, []) // eslint-disable-line

  // Barcode decoding — frame polling via BarcodeDetector (Chrome/Edge native)
  const decoderRef  = useRef(null)
  const animFrameRef = useRef(null)
  const lastCodeRef  = useRef(null) // debounce repeated scans of same code
  const scanCanvas  = useRef(document.createElement('canvas'))

  useEffect(() => {
    if (mode !== 'camera') { stopCamera(); return }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        startBarcodeDecoding()
      })
      .catch(() => { setMode('manual'); showFlash('err', 'Camera not available — using manual mode') })
    return stopCamera
  }, [mode]) // eslint-disable-line

  function startBarcodeDecoding() {
    // Use native BarcodeDetector where available (Chrome 83+, Edge 83+)
    if (!('BarcodeDetector' in window)) {
      showFlash('err', 'Barcode detection not supported in this browser — use USB scanner or manual entry')
      return
    }
    try {
      decoderRef.current = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'itf', 'codabar'],
      })
    } catch { return }

    const canvas = scanCanvas.current
    const ctx    = canvas.getContext('2d')
    let lastScanTime = 0

    async function tick() {
      const video = videoRef.current
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        try {
          const codes = await decoderRef.current.detect(canvas)
          if (codes.length > 0) {
            const raw  = codes[0].rawValue?.trim()
            const now  = Date.now()
            // Debounce: ignore same code within 2.5 s to avoid duplicate API calls
            if (raw && (raw !== lastCodeRef.current || now - lastScanTime > 2500)) {
              lastCodeRef.current = raw
              lastScanTime = now
              processCode(raw)
            }
          }
        } catch { /* decode error — skip frame */ }
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }

  function stopCamera() {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null }
    decoderRef.current  = null
    lastCodeRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }
  function showFlash(type, msg) { setFlash({ type, msg }); setTimeout(() => setFlash(null), 2800) }

  async function processCode(code) {
    if (!code) return
    try {
      const res = await scanBottle(code)
      if (!res?.data) { showFlash('err', `No bottle found: "${code}"`); setResult(null); return }
      const raw    = res.data
      const bottle = normaliseApiBottle(raw)
      // Build a minimal batch object matching the shape BatchRow / ScannerPanel expects
      const batch  = {
        id:       raw.batchCode    ?? raw.BatchCode,
        _apiId:   raw.trackerId    ?? raw.TrackerId,
        customer: raw.customerName ?? raw.CustomerName ?? '',
        stage:    BATCH_LIFECYCLE.findIndex(s => s.label === (raw.batchStatus ?? raw.BatchStatus)) ?? 0,
      }
      bottle.batchId = raw.batchCode ?? raw.BatchCode
      setResult({ bottle, batch })
      setInput(code)
    } catch {
      showFlash('err', `No bottle found: "${code}"`)
      setResult(null)
    }
  }

  function handleSearch() { processCode(input) }
  function handleKey(e) { if (e.key === 'Enter') handleSearch() }

  async function handleAction(action) {
    if (!result?.bottle || action !== 'return') return
    const { bottle } = result
    try {
      await markBottleReturned(bottle._apiId, bottle._trackerId)
      toast(`✓ ${bottle.id} returned to lab`, 'success')
      // Update the result panel status immediately so user sees the change
      setResult(prev => prev ? { ...prev, bottle: { ...prev.bottle, status: 'Returned to Lab', returnedDate: new Date().toISOString() } } : null)
      setBottles(p => p.map(b => b.id === bottle.id ? { ...b, status: 'Returned to Lab' } : b))
    } catch (e) {
      toast(e.message || 'Action failed', 'error')
    }
    if (mode === 'manual') inputRef.current?.focus()
  }

  const statusIs = s => result?.bottle?.status === s

  // ── render (identical to original) ──────────────────────────────────
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(14,17,23,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#0a0d12', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(232,93,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScanLine size={15} color="#e85d0a" strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Bottle Scanner</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>USB barcode scanner · camera · manual entry</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, cursor: 'pointer', color: '#fff', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[
            { key: 'manual', label: 'USB / Manual', icon: <Usb size={12} strokeWidth={2} /> },
            { key: 'camera', label: 'Camera',       icon: <Camera size={12} strokeWidth={2} /> },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8,
              border: `1.5px solid ${mode === m.key ? '#FF4717' : '#1A1A31'}`,
              background: mode === m.key ? '#FF4717' : '#fff',
              color: mode === m.key ? '#fff' : '#1A1A31',
              fontWeight: 700, fontSize: 11.5, cursor: 'pointer', transition: 'all 0.18s',
            }}>{m.icon} {m.label}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#1A1A31', background: 'rgba(26,26,49,0.06)', border: '1px solid rgba(26,26,49,0.18)', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
            <ScanLine size={11} strokeWidth={2} /> USB scanner always active
          </div>
        </div>

        {mode === 'manual' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: `2px solid ${flash?.type === 'err' ? 'var(--red)' : flash?.type === 'ok' ? 'var(--green)' : 'var(--border-dark)'}`, borderRadius: 10, padding: '0 12px', transition: 'border-color 0.2s' }}>
              <Search size={14} color="var(--text-muted)" strokeWidth={2} />
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Type Bottle ID or Serial Number then press Enter…"
                style={{ border: 'none', outline: 'none', fontSize: 13, padding: '10px 0', width: '100%', background: 'transparent', boxShadow: 'none', fontFamily: 'var(--font-mono)' }} />
              {input && <button onClick={() => { setInput(''); setResult(null); inputRef.current?.focus() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><XIcon size={13} /></button>}
            </div>
            <button onClick={handleSearch} style={{ padding: '0 18px', background: '#FF4717', color: '#fff', border: '1.5px solid #FF4717', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Search</button>
          </div>
        )}

        {mode === 'camera' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000', aspectRatio: '16/9', maxHeight: 220 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '8%', right: '8%', height: 2, background: 'linear-gradient(90deg, transparent, #e85d0a, transparent)', boxShadow: '0 0 10px #e85d0a', animation: 'scanLine 2s ease-in-out infinite' }} />
                <div style={{ position:'absolute', top:10, left:10, width:20, height:20, borderTop:'2.5px solid #e85d0a', borderLeft:'2.5px solid #e85d0a' }} />
                <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderTop:'2.5px solid #e85d0a', borderRight:'2.5px solid #e85d0a' }} />
                <div style={{ position:'absolute', bottom:10, left:10, width:20, height:20, borderBottom:'2.5px solid #e85d0a', borderLeft:'2.5px solid #e85d0a' }} />
                <div style={{ position:'absolute', bottom:10, right:10, width:20, height:20, borderBottom:'2.5px solid #e85d0a', borderRight:'2.5px solid #e85d0a' }} />
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              {('BarcodeDetector' in window)
                ? 'Point camera at bottle barcode to scan — hold steady for best results'
                : '⚠ Barcode detection not supported in this browser — switch to USB / Manual mode'}
            </div>
          </div>
        )}

        {flash && (
          <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: 12.5, fontWeight: 600,
            background: flash.type === 'ok' ? 'rgba(10,124,82,0.08)' : 'rgba(212,42,42,0.08)',
            color: flash.type === 'ok' ? 'var(--green)' : 'var(--red)',
            border: `1px solid ${flash.type === 'ok' ? 'rgba(10,124,82,0.2)' : 'rgba(212,42,42,0.2)'}`,
          }}>{flash.type === 'ok' ? '✓' : '✗'} {flash.msg}</div>
        )}

        {result && (
          <div style={{ borderRadius: 10, border: '1.5px solid var(--border)', overflow: 'hidden', animation: 'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div style={{ padding: '11px 14px', background: '#0a0d12', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={14} color="#e85d0a" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#fff' }}>{result.bottle.id}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{result.bottle.serialNumber || '—'} · {result.bottle.assetName || '—'}</div>
              </div>
              {/* Status badge — colour-coded per bottle status */}
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: statusIs('Returned to Lab') ? 'rgba(10,124,82,0.25)'
                          : statusIs('With Customer')   ? 'rgba(201,122,6,0.25)'
                          :                               'rgba(103,48,194,0.25)',
                color:      statusIs('Returned to Lab') ? '#4ade80'
                          : statusIs('With Customer')   ? '#fbbf24'
                          :                               '#c084fc',
              }}>{result.bottle.status}</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
              {[
                ['Batch',       result.batch?.id],
                ['Batch Status', result.batch ? (['Order Placed','Dispatched','In Transit','Delivered'][result.batch.stage] ?? '—') : '—'],
                ['Customer',    result.batch?.customer],
                ['Dispatched',  result.bottle.dispatchedDate ? fmtDate(result.bottle.dispatchedDate) : '—'],
                ['Returned',    result.bottle.returnedDate   ? fmtDate(result.bottle.returnedDate)   : '—'],
              ].map(([l, v]) => (
                <div key={l}><span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{l}:</span> <strong>{v || '—'}</strong></div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: '#f9fafb', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              {statusIs('With Customer') && (
                <button onClick={() => handleAction('return')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: '#FF4717', color: '#fff', border: '1.5px solid #FF4717', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  <ArrowLeft size={13} strokeWidth={2.5} /> Mark Returned to Lab
                </button>
              )}
              {statusIs('Returned to Lab') && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'rgba(10,124,82,0.08)', border: '1.5px solid rgba(10,124,82,0.25)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>
                  <ArrowLeft size={13} strokeWidth={2.5} /> Already Returned to Lab
                </div>
              )}
              {statusIs('Order Placed') && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'rgba(103,48,194,0.06)', border: '1.5px solid rgba(103,48,194,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#6730c2' }}>
                  <Package size={13} strokeWidth={2} /> Not yet delivered to customer
                </div>
              )}
              <button onClick={() => { setResult(null); setInput(''); inputRef.current?.focus() }} style={{ padding: '9px 14px', background: '#fff', border: '1.5px solid #1A1A31', borderRadius: 8, fontWeight: 600, fontSize: 11.5, cursor: 'pointer', color: '#1A1A31' }}>Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



/* ════════════════════════════════════════════════════════════════════
   BATCH FORM — unchanged UI; save calls API
═══════════════════════════════════════════════════════════════════════ */
function AssetDropdown({ value, options, onSelect }) {
  const [search, setSearch] = useState(value || '')
  const [open,   setOpen]   = useState(false)
  const wrapRef  = useRef()
  const inputRef = useRef()

  useEffect(() => { if (!value) setSearch('') }, [value])
  useEffect(() => {
    function handle(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options
  }, [options, search])

  function handleSelect(opt) {
    setSearch(opt.label)
    setOpen(false)
    onSelect(opt)
  }

  const isSelected = options.some(o => o.label === search)
  const ORANGE = '#FF4717'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${open ? ORANGE : '#d2cec6'}`,
        borderRadius: 7, background: '#fff', transition: 'border-color 0.15s',
      }}>
        <Search size={12} color={open ? ORANGE : 'var(--text-muted)'} strokeWidth={2} style={{ flexShrink: 0, marginLeft: 8 }} />
        <input
          ref={inputRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); if (!e.target.value) onSelect(null) }}
          onFocus={() => setOpen(true)}
          placeholder="Search asset…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, padding: '6px 8px', background: 'transparent', fontWeight: 400, color: 'var(--text-primary)', minWidth: 0 }}
        />
        {search && (
          <button onMouseDown={e => { e.preventDefault(); setSearch(''); onSelect(null); inputRef.current?.focus(); setOpen(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', paddingRight: 6, flexShrink: 0 }}>
            <XIcon size={11} />
          </button>
        )}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0, zIndex: 300,
          background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9,
          boxShadow: '0 8px 24px rgba(14,17,23,0.13)', maxHeight: 200, overflowY: 'auto',
          animation: 'popIn 0.14s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>No assets found</div>
          )}
          {filtered.map((opt, i) => (
            <div key={opt.key ?? i}
              onMouseDown={e => { e.preventDefault(); handleSelect(opt) }}
              style={{
                padding: '8px 13px', cursor: 'pointer', fontSize: 12.5,
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 1,
                background: opt.label === search ? `${ORANGE}0e` : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (opt.label !== search) e.currentTarget.style.background = '#f8f9fa' }}
              onMouseLeave={e => { if (opt.label !== search) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontWeight: 600, color: opt.label === search ? ORANGE : 'var(--text-primary)' }}>{opt.label}</span>
              {opt.serial && <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{opt.serial}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AssetRow({ item, onRemove, onChange, assetOptions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(103,48,194,0.03)', border: '1px solid rgba(103,48,194,0.13)', borderRadius: 8 }}>
      <AssetDropdown
        value={item.assetName}
        options={assetOptions}
        onSelect={opt => {
          if (opt) onChange({ assetName: opt.label, serialNumber: opt.serial || '', assetKey: opt.key ?? null })
          else     onChange({ assetName: '', serialNumber: '', assetKey: null })
        }}
      />
      <input type="text" value={item.serialNumber} onChange={e => onChange({ serialNumber: e.target.value })} placeholder="Serial No."
        style={{ width: 100, flexShrink: 0, fontSize: 12, padding: '6px 9px', fontFamily: 'var(--font-mono)', borderRadius: 7, border: '1.5px solid rgba(103,48,194,0.25)', background: item.serialNumber ? 'rgba(10,124,82,0.04)' : '#fff', color: 'inherit', fontWeight: 700 }} />
      <input type="number" min={1} max={200} value={item.qty}
        onChange={e => onChange({ qty: e.target.value === '' ? '' : Math.max(1, +e.target.value) })} placeholder="#"
        style={{ width: 60, flexShrink: 0, fontSize: 13, padding: '6px 9px', textAlign: 'center', fontWeight: 700 }} />
      <button onClick={onRemove} style={{ flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,42,42,0.06)', border: '1px solid rgba(212,42,42,0.18)', borderRadius: 6, cursor: 'pointer', color: 'var(--red)' }}>
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function CustomerSearchDropdown({ value, customerKey, onChange, onSelect }) {
  const [customers,     setCustomers]     = useState([])
  const [search,        setSearch]        = useState(value || '')
  const [open,          setOpen]          = useState(false)
  const [loadingList,   setLoadingList]   = useState(false)
  const wrapRef  = useRef()
  const inputRef = useRef()
  const toast    = useToast()

  // Load customer list once on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingList(true)
      try {
        const res = await getTotCustomers()
        if (!cancelled) {
          const list = (Array.isArray(res?.data) ? res.data : []).map(c => ({ CustomerKey: c.customerKey ?? c.CustomerKey, CustomerName: c.customerName ?? c.CustomerName }))
          setCustomers(list)
        }
      } catch { if (!cancelled) toast('Failed to load customers', 'error') }
      if (!cancelled) setLoadingList(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Keep search text in sync if parent clears the value
  useEffect(() => { if (!value) setSearch('') }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? customers.filter(c => c.CustomerName?.toLowerCase().includes(q)) : customers
  }, [customers, search])

  function handleSelect(c) {
    setSearch(c.CustomerName)
    setOpen(false)
    onSelect(c.CustomerName, c.CustomerKey)
  }

  function handleInput(e) {
    setSearch(e.target.value)
    onChange(e.target.value)   // allow free-type fallback
    setOpen(true)
    if (!e.target.value) onSelect('', null)
  }

  const ORANGE = '#FF4717'
  const isSelected = !!customerKey

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${open ? ORANGE : '#d2cec6'}`,
        borderRadius: 8, background: '#fff', transition: 'border-color 0.18s',
        boxShadow: open ? `0 0 0 3px ${ORANGE}18` : 'none',
      }}>
        <div style={{ paddingLeft: 10, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Search size={13} color={open ? ORANGE : 'var(--text-muted)'} strokeWidth={2} />
        </div>
        <input
          ref={inputRef}
          autoFocus
          value={search}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={loadingList ? 'Loading customers…' : 'Search customer…'}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 13,
            padding: '9px 10px', background: 'transparent',
            fontWeight: 400,
            color: 'var(--text-primary)',
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); onSelect('', null); inputRef.current?.focus(); setOpen(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', paddingRight: 8, flexShrink: 0 }}
          ><XIcon size={12} /></button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(14,17,23,0.12)', overflow: 'hidden',
          animation: 'popIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both',
          maxHeight: 220, overflowY: 'auto',
        }}>
          {loadingList && (
            <div style={{ padding: '14px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading customers…
            </div>
          )}
          {!loadingList && filtered.length === 0 && (
            <div style={{ padding: '14px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              No customers found
            </div>
          )}
          {!loadingList && filtered.map((c, i) => {
            const isActive = c.CustomerKey === customerKey
            return (
              <div
                key={c.CustomerKey ?? i}
                onMouseDown={e => { e.preventDefault(); handleSelect(c) }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 400,
                  background: isActive ? `${ORANGE}0e` : 'transparent',
                  color: isActive ? ORANGE : 'var(--text-primary)',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8f9fa' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span>{c.CustomerName}</span>
                {isActive && <Check size={12} color={ORANGE} strokeWidth={3} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BatchForm({ onSave, onClose }) {
  const STEPS = [
    { n: 1, label: 'Customer & Contact' },
    { n: 2, label: 'Assets & Bottles'   },
    { n: 3, label: 'Order Details'      },
    { n: 4, label: 'Courier & Shipment' },
  ]
  const ORANGE = '#FF4717'
  const DARK   = '#1A1A31'
  const toast  = useToast()
  const [step,           setStep]           = useState(0)
  const [saving,         setSaving]         = useState(false)
  const [loadingAssets,  setLoadingAssets]  = useState(false)
  const [availableAssets,setAvailableAssets]= useState([])   // options for asset dropdown
  const [form,           setForm]           = useState({
    customer: '', customerKey: null,
    contact: '', address: '', notes: '',
    orderDate: today(), sampleType: 'Transformer Oil',
    courierService: '', trackingNumber: '', assetItems: [],
  })
  const up    = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const total = form.assetItems.reduce((s, i) => s + (+i.qty || 0), 0)

  // Build dropdown options from availableAssets
  const assetOptions = useMemo(() =>
    availableAssets.map(a => ({
      key:    a.transformerKey  ?? a.TransformerKey,
      label:  a.tranformerName  ?? a.TranformerName  ?? a.transformerName ?? a.TransformerName ?? '',
      serial: a.serialNo        ?? a.SerialNo        ?? '',
    })).filter(o => o.label),
  [availableAssets])

  // When a customer is selected: fetch their assets as OPTIONS only; keep assetItems empty
  async function handleCustomerSelect(customerName, customerKey) {
    setForm(p => ({ ...p, customer: customerName, customerKey, assetItems: [] }))
    setAvailableAssets([])
    if (!customerKey) return
    setLoadingAssets(true)
    try {
      const res    = await getAssetsByCustomer(customerKey)
      const assets = Array.isArray(res?.data) ? res.data : []
      setAvailableAssets(assets)
      if (assets.length > 0) toast(`${assets.length} asset${assets.length > 1 ? 's' : ''} available for ${customerName}`, 'success')
    } catch {
      toast('Could not load assets for this customer', 'error')
    }
    setLoadingAssets(false)
  }

  function addItem()        { setForm(p => ({ ...p, assetItems: [...p.assetItems, { id: Date.now(), assetName: '', serialNumber: '', qty: 1 }] })) }
  function removeItem(idx)  { setForm(p => ({ ...p, assetItems: p.assetItems.filter((_, i) => i !== idx) })) }
  function updateItem(idx, patch) { setForm(p => ({ ...p, assetItems: p.assetItems.map((item, i) => i === idx ? { ...item, ...patch } : item) })) }

  const stepValid = [
    form.customer.trim().length > 0,
    form.assetItems.length > 0 && form.assetItems.every(i => i.assetName && +i.qty > 0),
    true, true,
  ]
  const canFinish = stepValid[0] && stepValid[1]

  async function handleSave() {
    if (!canFinish) return
    setSaving(true)
    try {
      // 1) Create the batch
      const batchPayload = {
        Id:              null,
        BatchStatus:     'Order Placed',
        OrderPlacedDate: form.orderDate,
        CustomerKey:     form.customerKey ?? null,
        CustomerName:    form.customer,
        ContactPerson:   form.contact,
        DeliveryAddress: form.address,
        Notes:           form.notes,
        SampleType:      form.sampleType,
        CourierName:     form.courierService,
        TrackingNumber:  form.trackingNumber,
        TotalBottles:    total,
        WithCustomerCount: 0,
        ReturnedCount:   0,
        Assets: JSON.stringify(form.assetItems.map(ai => ({
          AssetKey:    ai.assetKey ?? null,
          AssetName:   ai.assetName,
          BottleCount: +ai.qty,
        }))),
      }
      const batchRes = await saveBatch(batchPayload)
      const rawBatch = Array.isArray(batchRes?.data) ? batchRes.data[0] : batchRes?.data
      if (!rawBatch?.id && !rawBatch?.Id) throw new Error('Batch save failed')

      // 2) Bulk-insert bottles
      const bottleList = form.assetItems.flatMap(ai =>
        Array.from({ length: +ai.qty }, () => ({
          AssetKey:     ai.assetKey ?? null,
          AssetName:    ai.assetName,
          SerialNumber: ai.serialNumber,
        }))
      )
      await bulkInsertBottles(rawBatch.id ?? rawBatch.Id, bottleList)

      // 3) Normalise and enrich with form data the SP response may not have
      const normBatch = normaliseApiBatch(rawBatch)
      // Enrich with known values from the form (SP returns 0 counts at insert time)
      normBatch.qty        = total
      normBatch.withCust   = total   // all bottles start "With Customer" on dispatch
      normBatch.returned   = 0
      normBatch.assetCount = form.assetItems.length
      normBatch.assetItems = form.assetItems.map(ai => ({
        assetKey:     ai.assetKey ?? null,
        assetName:    ai.assetName,
        serialNumber: ai.serialNumber ?? '',
        qty:          +ai.qty,
      }))
      onSave(normBatch)
      toast('Batch created!', 'success')
      onClose()
    } catch (e) {
      toast(e.message || 'Failed to create batch', 'error')
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Step indicator bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, padding: '0 2px' }}>
        {STEPS.map((st, i) => {
          const done   = i < step
          const active = i === step
          return (
            <React.Fragment key={st.n}>
              <div onClick={() => done && setStep(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: done ? 'pointer' : 'default', flex: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? ORANGE : active ? '#fff' : '#f1f3f5',
                  border: `2px solid ${done || active ? ORANGE : '#dde1e7'}`,
                  boxShadow: active ? `0 0 0 4px ${ORANGE}22` : 'none', transition: 'all 0.2s' }}>
                  {done ? <Check size={13} color="#fff" strokeWidth={3} /> : <span style={{ fontSize: 11, fontWeight: 800, color: active ? ORANGE : '#adb5bd' }}>{st.n}</span>}
                </div>
                <span style={{ fontSize: 9, fontWeight: active || done ? 700 : 500, color: active ? ORANGE : done ? '#6b7280' : '#adb5bd', whiteSpace: 'nowrap' }}>{st.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? ORANGE : '#e5e7eb', margin: '0 4px', marginBottom: 22, borderRadius: 2, transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div style={{ minHeight: 230 }}>
        {step === 0 && (
          <div>
            <div className="grid-2">
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Customer Name *</label>
                <CustomerSearchDropdown
                  value={form.customer}
                  customerKey={form.customerKey}
                  onChange={v => up('customer', v)}
                  onSelect={handleCustomerSelect}
                />
              </div>
              <div className="form-group"><label>Contact Person</label><input type="text" value={form.contact} onChange={e => up('contact', e.target.value)} placeholder="Contact name" /></div>
            </div>
            <div className="form-group"><label>Delivery Address</label><textarea value={form.address} onChange={e => up('address', e.target.value)} placeholder="Street, City, Postcode, Country" style={{ height: 72, resize: 'vertical' }} /></div>
          </div>
        )}
        {step === 1 && (
          <div>
            {loadingAssets ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                <div style={{ marginBottom: 8, fontSize: 22 }}>⏳</div>
                Loading assets for <strong>{form.customer}</strong>…
              </div>
            ) : (
              <>
                {availableAssets.length > 0 && (
                  <div style={{ padding: '7px 12px', borderRadius: 8, marginBottom: 10, fontSize: 11.5, fontWeight: 600, background: 'rgba(31,94,196,0.05)', color: '#1f5ec4', border: '1px solid rgba(31,94,196,0.18)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Search size={11} strokeWidth={2.5} />
                    {availableAssets.length} assets available — search and select from the dropdown, serial number auto-fills
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
                  {form.assetItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                      No assets added yet — click below to add one
                    </div>
                  )}
                  {form.assetItems.map((item, idx) => (
                    <AssetRow
                      key={item.id}
                      item={item}
                      assetOptions={assetOptions}
                      onRemove={() => removeItem(idx)}
                      onChange={p => updateItem(idx, p)}
                    />
                  ))}
                </div>
                <button onClick={addItem} style={{ width: '100%', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--bg)', border: `1.5px dashed ${ORANGE}55`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: ORANGE }}>
                  <Plus size={13} strokeWidth={2.5} /> Add Asset
                </button>
                {total > 0 && <div style={{ marginTop: 10, textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: ORANGE }}>{total} bottles total</div>}
              </>
            )}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="grid-2">
              <div className="form-group"><label>Sample Type</label><select value={form.sampleType} onChange={e => up('sampleType', e.target.value)}>{SAMPLE_TYPES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Order Date</label><DatePicker value={form.orderDate} onChange={v => up('orderDate', v)} /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Special instructions…" style={{ height: 64, resize: 'vertical' }} /></div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label>Courier Service</label>
                <select value={form.courierService} onChange={e => up('courierService', e.target.value)}>
                  <option value="">Select courier…</option>
                  {(COURIERS||[]).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tracking Number</label>
                <input type="text" value={form.trackingNumber} onChange={e => up('trackingNumber', e.target.value)} placeholder="e.g. BD-123456789" style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
            <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 8 }}>Batch Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                {[['Customer', form.customer||'—'], ['Contact', form.contact||'—'], ['Bottles', `${total}`], ['Sample Type', form.sampleType], ['Order Date', form.orderDate]].map(([l,v]) => (
                  <div key={l}><span style={{ color: 'var(--text-muted)' }}>{l}: </span><strong>{v}</strong></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', paddingTop: 18, marginTop: 8, borderTop: '1px solid var(--border)' }}>
        <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:'#fff', border:`1.5px solid ${DARK}`, borderRadius:8, color:DARK, fontWeight:700, fontSize:12.5, cursor:'pointer' }}>
          {step === 0 ? 'Cancel' : <><ArrowLeft size={13} /> Back</>}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {step < STEPS.length - 1
            ? <button onClick={() => setStep(s => s + 1)} disabled={!stepValid[step] || (step === 0 && loadingAssets)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:ORANGE, border:`1.5px solid ${ORANGE}`, borderRadius:8, color:'#fff', fontWeight:700, fontSize:12.5, cursor:(stepValid[step] && !(step === 0 && loadingAssets))?'pointer':'not-allowed', opacity:(stepValid[step] && !(step === 0 && loadingAssets))?1:0.5 }}>
                Next <ArrowRight size={13} />
              </button>
            : <button onClick={handleSave} disabled={!canFinish || saving}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:ORANGE, border:`1.5px solid ${ORANGE}`, borderRadius:8, color:'#fff', fontWeight:700, fontSize:12.5, cursor:canFinish&&!saving?'pointer':'not-allowed', opacity:canFinish&&!saving?1:0.5 }}>
                <Plus size={14} strokeWidth={2} /> {saving ? 'Saving…' : `Create Batch (${total} bottles)`}
              </button>
          }
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   BATCH DETAIL MODAL — API-wired for advance + markAll
═══════════════════════════════════════════════════════════════════════ */
function BatchDetailModal({ batch, bottles, loading, onClose, onAdvanceStage, onMarkAllReturned }) {
  if (!batch) return null
  // Prefer detail-loaded bottle counts; fall back to API list counts from batch header
  const bbs      = bottles.filter(b => b.batchId === batch.id)
  const total    = bbs.length    || batch.qty      || 0
  const withCust = bbs.length > 0
    ? bbs.filter(b => b.status === 'With Customer').length
    : (batch.withCust ?? 0)
  const returned = bbs.length > 0
    ? bbs.filter(b => b.status === 'Returned to Lab').length
    : (batch.returned ?? 0)
  const pct      = total > 0 ? Math.round((returned / total) * 100) : 0
  const stageKeys   = ['orderDate','dispatchedDate','transitDate','deliveredDate']
  const stageLabels = ['Order Placed','Dispatched','In Transit','Delivered']

  return (
    <Modal open onClose={onClose} title={`${batch.id} — Details${loading ? " (loading…)" : ""}`} large>
      <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 12 }}>Batch Lifecycle — click current stage to advance</div>
        <LifecycleStepper batch={batch} onAdvance={stage => { onAdvanceStage(batch.id, stage); onClose() }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 10 }}>
          {stageLabels.map((l, i) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 700, color: i <= batch.stage ? BATCH_LIFECYCLE[i].color : 'var(--text-muted)' }}>{batch[stageKeys[i]] ? fmtDate(batch[stageKeys[i]]) : '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
        {[['Total', total, 'var(--accent)'], ['With Customer', withCust, 'var(--amber)'], ['Returned', returned, 'var(--green)']].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 4, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>

      {batch.assetItems?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--purple)', marginBottom: 8 }}>Assets in Batch</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {batch.assetItems.map((ai, i) => (
              <div key={i} style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--accent)', fontWeight: 700 }}>{ai.serialNumber}</span>
                <span style={{ color: 'var(--text-muted)', margin: '0 5px' }}>·</span>
                <span style={{ fontWeight: 600 }}>{ai.assetName}</span>
                <span style={{ marginLeft: 5, padding: '0 5px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: 'rgba(232,93,10,0.1)', color: 'var(--accent)' }}>{ai.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: 12.5, marginBottom: 14 }}>
        {[['Customer', batch.customer], ['Contact', batch.contact], ['Sample Type', batch.sampleType || '—'],
          ['Courier', batch.courierService || '—'], ['Tracking No.', batch.trackingNumber || '—']].map(([l, v]) => (
          <div key={l}><div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{l}</div>
            <strong style={{ fontFamily: l === 'Tracking No.' ? 'var(--font-mono)' : 'inherit', fontSize: l === 'Tracking No.' ? 11.5 : 'inherit' }}>{v}</strong>
          </div>
        ))}
        {batch.address && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Delivery Address</div><span style={{ color: 'var(--text-secondary)' }}>{batch.address}</span></div>}
        {batch.notes  && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Notes</div><span style={{ color: 'var(--text-secondary)' }}>{batch.notes}</span></div>}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ padding:'8px 18px', background:'#fff', border:'1.5px solid #1A1A31', borderRadius:8, color:'#1A1A31', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>Close</button>
        {withCust > 0 && (
          <button onClick={() => { onMarkAllReturned(batch.id); onClose() }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:'#FF4717', border:'1.5px solid #FF4717', borderRadius:8, color:'#fff', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>
            <ArrowLeft size={13} strokeWidth={2} /> Mark All {withCust} Returned
          </button>
        )}
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════════════
   MAIN BATCHES PAGE — API-wired, identical UI
═══════════════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'all',     label: 'All'         },
  { key: 'ordered', label: 'Order Placed' },
  { key: 'transit', label: 'In Transit'  },
  { key: 'done',    label: 'Delivered'   },
]

export default function Batches({ onTopbarUpdate }) {
  const [batches,       setBatches]       = useState([])
  const [bottles,       setBottles]       = useState([])

  const toast = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [viewBatch,  setViewBatch]  = useState(null)
  const [viewLoading,setViewLoading]= useState(false)
  const [printBatch, setPrintBatch] = useState(null)
  const [printLabels,setPrintLabels]= useState(null)   // label data from API
  const [showScan,   setShowScan]   = useState(false)
  // ── Server-side pagination state ──────────────────────────────────
  const [pageSize,    setPageSize]    = useState(15)
  const [page,        setPage]        = useState(1)
  const [totalCount,  setTotalCount]  = useState(0)
  const [search,      setSearch]      = useState('')
  const [tab,         setTab]         = useState('all')
  const [loading,     setLoading]     = useState(false)
  const [sortKey,     setSortKey]     = useState('orderDate')
  const [sortDir,     setSortDir]     = useState('desc')

  // Map tab key → BatchStatus string the API understands
  const TAB_STATUS = { all: '', ordered: 'Order Placed', transit: 'In Transit', done: 'Delivered' }

  // ── Unified loader — called any time page / pageSize / search / tab changes ─
  const loadBatches = useCallback(async (opts = {}) => {
    const p   = opts.page     ?? page
    const ps  = opts.pageSize ?? pageSize
    const q   = opts.search   ?? search
    const t   = opts.tab      ?? tab
    setLoading(true)
    try {
      const res = await getBatches({
        page:        p,
        pageSize:    ps,
        searchText:  q,
        batchStatus: TAB_STATUS[t] ?? '',
      })
      const envelope  = res?.data
      const list      = Array.isArray(envelope?.data)  ? envelope.data
                      : Array.isArray(envelope?.Data)  ? envelope.Data
                      : Array.isArray(envelope)        ? envelope
                      : []
      const total     = envelope?.totalCount ?? envelope?.TotalCount ?? list.length
      const norm      = list.map(normaliseApiBatch)
      setBatches(norm)
      setTotalCount(total)
      if (onTopbarUpdate) {
        const withCustomer = norm.reduce((sum, b) => sum + (b.withCust ?? 0), 0)
        onTopbarUpdate({ batches: total, withCustomer })
      }
    } catch (e) { toast(e.message || 'Failed to load batches', 'error') }
    setLoading(false)
  }, [page, pageSize, search, tab, onTopbarUpdate]) // eslint-disable-line

  // Initial load
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const res = await getBatches({ page: 1, pageSize, searchText: '', batchStatus: '' })
        if (cancelled) return
        const envelope = res?.data
        const list     = Array.isArray(envelope?.data) ? envelope.data
                       : Array.isArray(envelope?.Data) ? envelope.Data
                       : Array.isArray(envelope)       ? envelope
                       : []
        const total    = envelope?.totalCount ?? envelope?.TotalCount ?? list.length
        const norm     = list.map(normaliseApiBatch)
        setBatches(norm)
        setTotalCount(total)
        if (onTopbarUpdate) {
          const withCustomer = norm.reduce((sum, b) => sum + (b.withCust ?? 0), 0)
          onTopbarUpdate({ batches: total, withCustomer })
        }
      } catch (e) { if (!cancelled) toast(e.message || 'Failed to load batches', 'error') }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  // Re-fetch whenever page / pageSize / search / tab changes (skip first render handled above)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    loadBatches({ page, pageSize, search, tab })
  }, [page, pageSize, search, tab]) // eslint-disable-line

  // Reset to page 1 when search or tab changes
  useEffect(() => { setPage(1) }, [search, tab])

  // Client-side sort on the currently loaded page
  const paged = useMemo(() => {
    const s = [...batches].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return s
  }, [batches, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Tab counts come from API totalCount (only accurate for the active tab).
  // For inactive tabs keep whatever we last knew — just show the active total.
  const counts = {
    all:     tab === 'all'     ? totalCount : batches.length,
    ordered: tab === 'ordered' ? totalCount : batches.filter(b => b.stage === 0).length,
    transit: tab === 'transit' ? totalCount : batches.filter(b => b.stage === 2).length,
    done:    tab === 'done'    ? totalCount : batches.filter(b => b.stage === 3).length,
  }

  // ── Create batch — reload page 1 after insert ────────────────────
  async function createBatch(normBatch) {
    // Optimistic insert so something appears immediately
    setBatches(p => {
      const exists = p.some(b => b.id === normBatch.id)
      return exists ? p : [normBatch, ...p]
    })
    // Then reload from API to get correct assetCount, counts, and all fields
    try {
      await loadBatches({ page: 1 })
      setPage(1)
    } catch { /* keep optimistic state if reload fails */ }
  }

  // ── Advance stage — API call ─────────────────────────────────────────
  async function advanceStage(batchId) {
    const batch = batches.find(b => b.id === batchId)
    if (!batch || batch.stage >= 3) return
    const nextStage  = batch.stage + 1
    const nextStatus = STAGE_TO_STATUS[nextStage]
    const dateField  = STATUS_DATE_FIELD[nextStatus]
    const now        = new Date().toISOString()
    try {
      // Preserve all previously set stage dates so the backend doesn't null them out
      await saveBatch({
        Id:              batch._apiId,
        BatchStatus:     nextStatus,
        OrderPlacedDate: batch.orderDate      || null,
        DispatchedDate:  batch.dispatchedDate || null,
        InTransitDate:   batch.transitDate    || null,
        DeliveredDate:   batch.deliveredDate  || null,
        [dateField]:     now,
      })
      // Optimistic update — also recalculate withCust so the chip updates immediately
      const dateKeys = ['orderDate','dispatchedDate','transitDate','deliveredDate']
      setBatches(p => {
        const next = p.map(b => b.id === batchId
          ? { ...b, stage: nextStage, [dateKeys[nextStage]]: today(),
              withCust: nextStage >= 3 ? (batch.withCust ?? b.withCust ?? 0) : b.withCust }
          : b)
        if (onTopbarUpdate) {
          const withCustomer = next.reduce((sum, b) => sum + (b.withCust ?? 0), 0)
          onTopbarUpdate({ withCustomer })
        }
        return next
      })
      toast(`Advanced to "${nextStatus}"`, 'success')
      loadBatches()
    } catch (e) { toast(e.message || 'Failed to advance batch', 'error') }
  }

  // ── Mark all returned — API call per bottle ──────────────────────────
  async function markAllReturned(batchId) {
    const batch      = batches.find(b => b.id === batchId)
    const batchBottles = bottles.filter(b => b.batchId === batchId && b.status === 'With Customer')
    try {
      await Promise.all(batchBottles.map(b => markBottleReturned(b._apiId, b._trackerId ?? batch?._apiId)))
      setBottles(p => p.map(b => b.batchId === batchId && b.status === 'With Customer'
        ? { ...b, status: 'Returned to Lab', returnedDate: today() } : b))
      toast('All bottles marked returned', 'success')
      loadBatches()
    } catch (e) { toast(e.message || 'Failed to mark returned', 'error') }
  }

  // ── View batch detail — fetch fresh data including assets & all dates ─
  async function handleView(batch) {
    setViewBatch(batch)   // open modal immediately with list data
    setViewLoading(true)
    try {
      const res = await getBatchDetail(batch._apiId)
      const d   = res?.data
      if (!d) return
      const header  = d.batch   ?? d.Batch
      const assets  = Array.isArray(d.assets)  ? d.assets  : Array.isArray(d.Assets)  ? d.Assets  : []
      const bots    = Array.isArray(d.bottles) ? d.bottles : Array.isArray(d.Bottles) ? d.Bottles : []

      // Normalise bottles first so we can derive serial numbers per asset
      const normBots = bots.map(b => {
        const nb = normaliseApiBottle(b)
        nb.batchId = batch.id
        return nb
      })

      // Build assetItems — serial comes from first matching bottle (BatchAssets has no SerialNumber)
      const assetItems = assets.map(a => {
        const aKey  = a.assetKey ?? a.AssetKey ?? null
        const aName = a.assetName ?? a.AssetName ?? ''
        const match = normBots.find(nb =>
          (aKey && nb.assetKey === aKey) ||
          (!aKey && nb.assetName === aName)
        )
        return {
          assetKey:     aKey,
          assetName:    aName,
          serialNumber: match?.serialNumber ?? a.serialNumber ?? a.SerialNumber ?? '',
          qty:          a.bottleCount ?? a.BottleCount ?? 1,
        }
      })

      // Fresh counts from header (most authoritative)
      const freshWithCust = header?.withCustomerCount ?? header?.WithCustomerCount ?? batch.withCust ?? 0
      const freshReturned = header?.returnedCount     ?? header?.ReturnedCount     ?? batch.returned ?? 0
      const freshTotal    = header?.totalBottles      ?? header?.TotalBottles      ?? batch.qty      ?? 0

      const enriched = {
        ...batch,
        assetItems,
        qty:            freshTotal,
        withCust:       freshWithCust,
        returned:       freshReturned,
        dispatchedDate: (header?.dispatchedDate  ?? header?.DispatchedDate)  || batch.dispatchedDate || null,
        transitDate:    (header?.inTransitDate   ?? header?.InTransitDate)   || batch.transitDate    || null,
        deliveredDate:  (header?.deliveredDate   ?? header?.DeliveredDate)   || batch.deliveredDate  || null,
        orderDate:      (header?.orderPlacedDate ?? header?.OrderPlacedDate) || batch.orderDate      || null,
      }

      // Push bottles into local state for detail modal bottle-level display
      if (normBots.length > 0) {
        setBottles(prev => {
          const ids = new Set(normBots.map(b => b.id))
          return [...prev.filter(b => !ids.has(b.id)), ...normBots]
        })
      }

      // Update batch in list so asset count column updates immediately
      setBatches(prev => prev.map(b => b.id === batch.id
        ? { ...b, assetItems, assetCount: assetItems.length, qty: freshTotal, withCust: freshWithCust, returned: freshReturned }
        : b
      ))
      setViewBatch(enriched)
    } catch (e) {
      toast(e.message || 'Could not load batch detail', 'error')
    } finally {
      setViewLoading(false)
    }
  }

  // ── Print labels — fetch from API ────────────────────────────────────
  async function handlePrint(batch) {
    try {
      const res = await getLabelsByTrackerId(batch._apiId)
      // LabelPrint component expects `bottles` in the local shape; map API labels
      const labelBottles = (res?.data || []).map((l, i) => ({
        id:             l.BottleCode      ?? l.bottleCode,
        batchId:        batch.id,
        status:         l.Status          ?? l.status,
        assetName:      l.AssetName       ?? l.assetName       ?? '',
        serialNumber:   l.SerialNumber    ?? l.serialNumber    ?? '',
        dispatchedDate: l.DispatchedDate  ?? l.dispatchedDate  ?? null,
        bottleNum:      i + 1,
      }))
      setPrintBatch(batch)
      setPrintLabels(labelBottles)
    } catch {
      // Fallback: use local bottles if API fails
      setPrintBatch(batch)
      setPrintLabels(bottles.filter(b => b.batchId === batch.id))
    }
  }

  const TH = ({ label, sk }) => <SortTh label={label} sortKey={sk} active={sortKey === sk} dir={sortDir} onSort={toggleSort} />

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">Lab Management</div>
          <div className="page-header-title">Batches & Dispatch</div>
          <div className="page-header-sub">Lifecycle: Order Placed → Dispatched → In Transit → Delivered · Click stage to advance</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowScan(p => !p)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#fff', border:`1.5px solid #1A1A31`, borderRadius:8, color:'#1A1A31', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>
            <ScanLine size={13} strokeWidth={2} /> {showScan ? 'Hide' : 'Show'} Scanner
          </button>
          <button onClick={() => setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#FF4717', border:'1.5px solid #FF4717', borderRadius:8, color:'#fff', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>
            <Plus size={14} strokeWidth={2} /> New Batch
          </button>
        </div>
      </div>

      {showScan && <div style={{ marginBottom: 20 }}><ScannerPanel bottles={bottles} setBottles={setBottles} batches={batches} onClose={() => setShowScan(false)} /></div>}

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { value: counts.all,     label: 'Total Batches',   color: 'var(--accent)', bg: 'rgba(232,93,10,0.08)',   border: 'rgba(232,93,10,0.2)',   Icon: Layers       },
          { value: counts.ordered, label: 'Order Placed',    color: '#6730c2',       bg: 'rgba(103,48,194,0.08)',  border: 'rgba(103,48,194,0.2)',  Icon: ShoppingCart },
          { value: batches.filter(b => b.stage === 1).length, label: 'Dispatched',   color: '#1f5ec4',             bg: 'rgba(31,94,196,0.08)',      border: 'rgba(31,94,196,0.2)',   Icon: Truck        },
          { value: counts.transit, label: 'In Transit',      color: '#c97a06',       bg: 'rgba(201,122,6,0.08)',   border: 'rgba(201,122,6,0.2)',   Icon: Navigation   },
          { value: counts.done,    label: 'Delivered',       color: 'var(--green)',  bg: 'rgba(10,124,82,0.08)',   border: 'rgba(10,124,82,0.2)',   Icon: MapPin       },
        ].map(({ value, label, color, bg, border, Icon }) => (
          <div key={label} style={{ flex: '1 1 110px', background: '#fff', border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 4px rgba(14,17,23,0.05)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
            <div style={{ position: 'absolute', right: 6, top: 12, opacity: 0.05, pointerEvents: 'none' }}><Icon size={52} strokeWidth={1} color={color} /></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={14} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200 }}><SearchBar value={search} onChange={setSearch} placeholder="Search batch ID or customer…" /></div>
        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}<span className={tab === t.key ? 'tab-count' : 'tab-count-inactive'}>{counts[t.key] ?? batches.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead><tr>
            <TH label="Batch ID"    sk="id" />
            <TH label="Customer"    sk="customer" />
            <th>Lifecycle Stage</th>
            <th>Assets</th>
            <th title="Total bottles">Total</th>
            <th title="With customer">With Cust.</th>
            <th title="Returned to lab">Returned</th>
            <th>Return %</th>
            <TH label="Order Date"  sk="orderDate" />
            <TH label="Days"        sk="orderDate" />
            <th>Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading batches…</td></tr>}
            {!loading && paged.map(b => {
              // Use API-supplied counts directly — local bottles[] is not pre-loaded on this page
              const total    = b.qty      || 0
              const withCust = b.withCust ?? 0
              const returned = b.returned ?? 0
              const pct      = total > 0 ? Math.round((returned / total) * 100) : 0
              const days     = b.orderDate ? daysSince(b.orderDate) : 0
              return (
                <tr key={b.id}>
                  <td><span className="mono text-accent" style={{ fontSize: 10.5, fontWeight: 700 }}>{b.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{b.customer}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{b.contact}</div>
                  </td>
                  <td style={{ minWidth: 130 }}>
                    <LifecycleStepper batch={b} onAdvance={() => advanceStage(b.id)} />
                  </td>
                  <td>
                    {(() => {
                      const cnt = b.assetItems?.length > 0 ? b.assetItems.length : (b.assetCount ?? null)
                      return cnt > 0
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(103,48,194,0.08)', color: 'var(--purple)' }}><Layers size={9} strokeWidth={2.5} />{cnt}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    })()}
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>{total}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: withCust > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{withCust}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: returned > 0 ? 'var(--green)' : 'var(--text-muted)' }}>{returned}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 48, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: pct === 100 ? 'var(--green)' : 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  </td>
                  <td><div style={{ fontSize: 11 }}>{fmtDate(b.orderDate)}</div></td>
                  <td><span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: days > 30 ? 'var(--red)' : 'var(--text-muted)' }}>{days}d</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background:'#fff', border:'1.5px solid #1A1A31', borderRadius:6, cursor:'pointer', color:'#1A1A31' }} title="View Details" onClick={() => handleView(b)}><Icons.Eye /></button>
                      <button style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background:'#fff', border:'1.5px solid #FF4717', borderRadius:6, cursor:'pointer', color:'#FF4717' }} title="Print Labels" onClick={() => handlePrint(b)}><Printer size={12} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: 11.5 }}>
                No batches found{search ? ` matching "${search}"` : ''}
              </td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} total={totalCount} pageSize={pageSize} onPageSizeChange={setPageSize} />
      </div>

      {showCreate && <Modal open onClose={() => setShowCreate(false)} title="Create New Batch" large><BatchForm onSave={createBatch} onClose={() => setShowCreate(false)} /></Modal>}
      {viewBatch  && <BatchDetailModal batch={viewBatch} bottles={bottles} loading={viewLoading} onClose={() => setViewBatch(null)} onAdvanceStage={advanceStage} onMarkAllReturned={markAllReturned} />}
      {printBatch && printLabels && <LabelPrint batch={printBatch} bottles={printLabels} onClose={() => { setPrintBatch(null); setPrintLabels(null) }} />}
    </div>
  )
}