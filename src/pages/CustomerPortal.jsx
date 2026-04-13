import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from '../components/UI'
import * as Icons from '../components/Icons'
import {
  ScanBarcode,
  Usb,
  Camera,
  CameraOff,
} from 'lucide-react'
import { COURIERS, SAMPLE_TYPES, fmtDate, today, uid, bottleStats, BOTTLE_STATUSES } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useBatchRequests } from '../App'

const STATUS_COLORS = {
  'Empty':        { bg:'#f3f4f6', color:'#6b7280', border:'#e5e7eb' },
  'Collected':    { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  'Sent to VPS':  { bg:'#fffbeb', color:'#d97706', border:'#fde68a' },
  'In Lab':       { bg:'#f5f3ff', color:'#7c3aed', border:'#ddd6fe' },
  'Tested':       { bg:'#ecfeff', color:'#0891b2', border:'#a5f3fc' },
  'Report Ready': { bg:'#f0fdf4', color:'#059669', border:'#a7f3d0' },
}

// ── ZXing loader (lazy, cached) ───────────────────────────────────────────────
let zxingReaderCache = null
async function getZxingReader() {
  if (zxingReaderCache) return zxingReaderCache
  // Dynamically import ZXing from CDN — works in all modern browsers including Windows Chrome
  const { BrowserMultiFormatReader, NotFoundException } = await import(
    'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.4/esm/index.min.js'
  )
  zxingReaderCache = { BrowserMultiFormatReader, NotFoundException }
  return zxingReaderCache
}

// ── Barcode Scanner Component ─────────────────────────────────────────────────
// Supports: USB/Bluetooth HID scanners (keyboard wedge) and camera scanning
// Camera scanning uses native BarcodeDetector where available (Android/macOS Chrome),
// and falls back to ZXing on Windows Chrome and other unsupported platforms.
function BarcodeInput({ value, onChange, placeholder, bottleNum }) {
  const inputRef = useRef(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [scanStatus, setScanStatus] = useState('') // e.g. "Scanning with ZXing…"
  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const scanTimerRef = useRef(null)
  const zxingReaderRef = useRef(null) // holds active ZXing reader instance

  // USB/HID barcode scanners type very fast (< 50ms between chars) and end with Enter
  const barcodeBuffer = useRef('')
  const lastKeyTime   = useRef(0)

  const handleKeyDown = useCallback((e) => {
    if (!scannerActive) return
    const now = Date.now()
    const delta = now - lastKeyTime.current
    lastKeyTime.current = now

    if (e.key === 'Enter') {
      if (barcodeBuffer.current.trim()) {
        onChange(barcodeBuffer.current.trim())
        barcodeBuffer.current = ''
        setScannerActive(false)
      }
      e.preventDefault()
      return
    }

    if (delta < 60 && e.key.length === 1) {
      barcodeBuffer.current += e.key
      e.preventDefault()
    } else {
      barcodeBuffer.current = e.key.length === 1 ? e.key : ''
    }
  }, [scannerActive, onChange])

  async function startCamera() {
    setCameraError('')
    setScanStatus('')
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setCameraActive(true)

      // Wait for videoRef to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          videoRef.current.onloadedmetadata = () => startScanLoop()
        }
      }, 150)
    } catch (err) {
      setCameraError('Camera not available. Please use a USB scanner or type the barcode manually.')
    }
  }

  function stopCamera() {
    // Stop native scan loop
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current)
      scanTimerRef.current = null
    }
    // Stop ZXing reader if active
    if (zxingReaderRef.current) {
      try { zxingReaderRef.current.reset() } catch {}
      zxingReaderRef.current = null
    }
    // Stop media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setScanStatus('')
  }

  // ── Scan loop: native BarcodeDetector → ZXing fallback ───────────────────
  async function startScanLoop() {
    if (!videoRef.current) return

    // ── Path A: Native BarcodeDetector (Android Chrome, macOS Chrome, ChromeOS) ──
    if ('BarcodeDetector' in window) {
      let detector
      try {
        detector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'data_matrix', 'pdf417']
        })
        setScanStatus('Scanning…')
      } catch {
        // BarcodeDetector constructor failed — fall through to ZXing
      }

      if (detector) {
        const video = videoRef.current
        async function tick() {
          if (!streamRef.current || !videoRef.current) return
          if (video.readyState < 2) {
            scanTimerRef.current = setTimeout(tick, 250)
            return
          }
          try {
            const barcodes = await detector.detect(video)
            if (barcodes.length > 0) {
              onChange(barcodes[0].rawValue)
              stopCamera()
              return
            }
          } catch { /* frame not ready */ }
          scanTimerRef.current = setTimeout(tick, 250)
        }
        scanTimerRef.current = setTimeout(tick, 300)
        return
      }
    }

    // ── Path B: ZXing fallback (Windows Chrome, Firefox, Safari, etc.) ──────
    setScanStatus('Loading scanner library…')
    try {
      const { BrowserMultiFormatReader } = await getZxingReader()
      if (!streamRef.current) return // camera was stopped while loading

      setScanStatus('Scanning with ZXing…')
      const codeReader = new BrowserMultiFormatReader()
      zxingReaderRef.current = codeReader

      // decodeFromStream continuously reads frames — resolves on first decode
      const result = await codeReader.decodeFromStream(
        streamRef.current,
        videoRef.current,
        (result, err) => {
          if (result) {
            onChange(result.getText())
            stopCamera()
          }
          // err here is just "no barcode in this frame" — not a real error
        }
      )
    } catch (err) {
      // Only show error if camera is still active (user didn't manually stop)
      if (streamRef.current) {
        setCameraError(
          'Barcode detection failed. Try better lighting, hold the barcode steadier, or use a USB scanner.'
        )
      }
    }
  }

  // Simulate a camera scan (demo / dev mode)
  function simulateCameraScan() {
    const fakeBarcode = `BTL-${String(bottleNum).padStart(3,'0')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`
    onChange(fakeBarcode)
    stopCamera()
  }

  useEffect(() => {
    if (scannerActive) {
      inputRef.current?.focus()
      barcodeBuffer.current = ''
    }
  }, [scannerActive])

  useEffect(() => () => stopCamera(), [])

  return (
    <div style={{marginBottom:6}}>
      <div style={{position:'relative',display:'flex',gap:6}}>
        {/* Text input with scanner icon */}
        <div style={{position:'relative',flex:1}}>
          <div style={{
            position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
            color: scannerActive ? 'var(--accent)' : 'var(--text-muted)',
            pointerEvents:'none', transition:'color 0.2s',
          }}>
            <ScanBarcode size={14} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => { onChange(e.target.value); barcodeBuffer.current = '' }}
            onKeyDown={handleKeyDown}
            placeholder={scannerActive ? '🔴 Scanner active — scan now or type…' : placeholder}
            style={{
              marginBottom:0, fontSize:12, paddingLeft:32, paddingRight:8,
              fontFamily:'var(--font-mono)',
              background: scannerActive ? 'rgba(232,93,10,0.05)' : '#fafafa',
              border: scannerActive ? '1.5px solid var(--accent)' : undefined,
              transition:'all 0.2s',
            }}
          />
        </div>

        {/* USB Scanner button */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setScannerActive(p=>!p); if (cameraActive) stopCamera() }}
          title={scannerActive ? 'Click when done scanning' : 'Activate USB/Bluetooth scanner mode'}
          style={{
            padding:'0 10px', borderRadius:'var(--r-sm)',
            border: `1.5px solid ${scannerActive ? 'var(--accent)' : 'var(--border)'}`,
            background: scannerActive ? 'var(--accent)' : '#fff',
            color: scannerActive ? '#fff' : 'var(--text-muted)',
            cursor:'pointer', fontSize:11, fontWeight:600, whiteSpace:'nowrap',
            display:'flex', alignItems:'center', gap:4, transition:'all 0.15s', flexShrink:0,
          }}
        >
          <Usb size={12} strokeWidth={2.5} />
          {scannerActive ? 'Scanning…' : 'Scan'}
        </button>

        {/* Camera button */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            if (cameraActive) { stopCamera() } else { startCamera(); setScannerActive(false) }
          }}
          title="Scan barcode with camera"
          style={{
            padding:'0 10px', borderRadius:'var(--r-sm)',
            border: `1.5px solid ${cameraActive ? 'var(--blue)' : 'var(--border)'}`,
            background: cameraActive ? 'var(--blue)' : '#fff',
            color: cameraActive ? '#fff' : 'var(--text-muted)',
            cursor:'pointer', fontSize:11, fontWeight:600,
            display:'flex', alignItems:'center', gap:4, transition:'all 0.15s', flexShrink:0,
          }}
        >
          {cameraActive
            ? <CameraOff size={12} strokeWidth={2.5} />
            : <Camera size={12} strokeWidth={2.5} />
          }
          {cameraActive ? 'Stop' : 'Cam'}
        </button>
      </div>

      {/* USB scanner mode hint */}
      {scannerActive && (
        <div style={{
          fontSize:11, color:'var(--accent)', marginTop:4, padding:'6px 10px',
          background:'rgba(232,93,10,0.06)', borderRadius:6,
          display:'flex', alignItems:'center', gap:6,
          animation:'slideUp 0.2s ease both',
        }}>
          <span style={{fontSize:14}}>📡</span>
          Point your USB/Bluetooth scanner at the barcode on the bottle and pull the trigger. The ID will auto-fill.
        </div>
      )}

      {/* Camera view */}
      {cameraActive && (
        <div
          style={{
            marginTop:8, borderRadius:'var(--r)', overflow:'hidden',
            border:'2px solid var(--blue)', position:'relative',
            background:'#000',
          }}
          onClick={e => e.stopPropagation()}
        >
          <video
            ref={videoRef}
            style={{width:'100%', display:'block', maxHeight:280, objectFit:'contain'}}
            playsInline muted
          />

          {/* Scan overlay */}
          <div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', pointerEvents:'none',
          }}>
            <div style={{
              width:220, height:80, border:'2px solid rgba(255,255,255,0.7)', borderRadius:6,
              boxShadow:'0 0 0 2000px rgba(0,0,0,0.35)',
              position:'relative',
            }}>
              <div style={{
                position:'absolute', top:'50%', left:0, right:0, height:2,
                background:'rgba(255,0,0,0.7)', transform:'translateY(-50%)',
                animation:'scanLine 1.5s ease-in-out infinite',
              }}/>
            </div>
            {scanStatus && (
              <div style={{
                fontSize:11, color:'rgba(255,255,255,0.9)', marginTop:8,
                fontWeight:600, background:'rgba(0,0,0,0.4)',
                padding:'3px 10px', borderRadius:20,
              }}>
                {scanStatus}
              </div>
            )}
            {!scanStatus && (
              <div style={{fontSize:11,color:'rgba(255,255,255,0.85)',marginTop:8,fontWeight:600}}>
                Hold barcode steady inside frame — scanning automatically…
              </div>
            )}
          </div>

          {/* Demo capture button */}
          <button
            onClick={e => { e.stopPropagation(); simulateCameraScan() }}
            style={{
              position:'absolute', bottom:8, right:8,
              padding:'6px 14px', borderRadius:20,
              background:'var(--blue)', color:'#fff',
              border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
              boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            ✓ Capture
          </button>
        </div>
      )}

      {cameraError && (
        <div style={{fontSize:11, color:'var(--red)', marginTop:4}}>{cameraError}</div>
      )}
    </div>
  )
}

// ── Collect Bottles Modal ─────────────────────────────────────────────────────
function CollectModal({ batch, bottles, onClose, onSubmit }) {
  const emptyBottles = bottles.filter(b => b.batchId === batch.id && b.status === 'Empty')
  const [selected, setSelected] = useState([])
  const [locations, setLocations] = useState({})
  const [bottleIds, setBottleIds] = useState({})
  const [globalLoc, setGlobalLoc] = useState('')

  function toggle(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }
  function setLoc(id, val) { setLocations(p => ({ ...p, [id]: val })) }
  function applyGlobal() {
    if (!globalLoc.trim()) return
    const m = {}
    selected.forEach(id => { m[id] = globalLoc })
    setLocations(p => ({ ...p, ...m }))
  }

  const allHaveLocation = selected.length > 0 && selected.every(id => (locations[id] || '').trim())

  return (
    <Modal open onClose={onClose} title={`Mark Bottles as Collected — ${batch.id}`} large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => { onSubmit(selected, locations, bottleIds); onClose() }}
            disabled={!allHaveLocation}
          >
            🧪 Mark {selected.length} Bottle{selected.length !== 1 ? 's' : ''} Collected
          </button>
        </>
      }
    >
      <div className="alert alert-blue" style={{marginBottom:16}}>
        <Icons.Flask/>
        <span style={{fontSize:12.5}}>
          Select bottles, scan or enter the Bottle ID (barcode), and fill the collection location.
          USB/Bluetooth scanners work automatically — just focus the field and scan.
          Camera scanning works on all platforms including Windows Chrome.
        </span>
      </div>

      {emptyBottles.length === 0 && (
        <div style={{textAlign:'center', padding:'32px', color:'var(--text-muted)'}}>
          <div style={{fontSize:32, marginBottom:8}}>✅</div>
          <div>All bottles have been collected!</div>
        </div>
      )}

      {selected.length > 0 && (
        <div style={{padding:'12px 14px', background:'#faf8f5', borderRadius:'var(--r)', border:'1px solid var(--border)', marginBottom:14}}>
          <div style={{fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:8}}>Same location for all selected?</div>
          <div style={{display:'flex', gap:8}}>
            <input
              type="text"
              value={globalLoc}
              onChange={e => setGlobalLoc(e.target.value)}
              placeholder="e.g. Transformer Bay A, Cooling Side"
              style={{flex:1, marginBottom:0}}
              onKeyDown={e => { if (e.key === 'Enter') applyGlobal() }}
            />
            <button className="btn btn-ghost btn-sm" onClick={applyGlobal}>Apply to All</button>
          </div>
        </div>
      )}

      <div style={{maxHeight:460, overflowY:'auto', paddingRight:4}}>
        {emptyBottles.map(bottle => {
          const isSel = selected.includes(bottle.id)
          return (
            <div key={bottle.id}
              style={{
                padding:'10px 12px', borderRadius:'var(--r)', marginBottom:6,
                border:`1.5px solid ${isSel ? 'rgba(212,82,12,0.3)' : 'var(--border)'}`,
                background: isSel ? 'rgba(212,82,12,0.04)' : '#fff',
                transition:'all 0.12s',
              }}
            >
              <div
                style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:isSel ? 10 : 0}}
                onClick={() => toggle(bottle.id)}
              >
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => {}}
                  style={{width:'auto', accentColor:'var(--orange)', flexShrink:0}}
                />
                <div style={{flex:1}}>
                  <span style={{fontSize:12, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--orange)'}}>
                    Bottle #{bottle.bottleNum}
                  </span>
                  {bottleIds[bottle.id] && (
                    <span style={{fontSize:10.5, color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginLeft:10}}>
                      ID: {bottleIds[bottle.id]}
                    </span>
                  )}
                </div>
                {isSel && (
                  <span style={{color: locations[bottle.id]?.trim() ? 'var(--green)' : 'var(--amber)', fontSize:16}}>
                    {locations[bottle.id]?.trim() ? '✓' : '!'}
                  </span>
                )}
              </div>

              {isSel && (
                <div style={{display:'flex', flexDirection:'column', gap:6, paddingLeft:22}}>
                  {/* Bottle ID + Barcode Scanner */}
                  <div>
                    <div style={{fontSize:10.5, fontWeight:600, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.5px'}}>
                      Bottle ID / Barcode
                    </div>
                    <BarcodeInput
                      value={bottleIds[bottle.id] || ''}
                      onChange={val => setBottleIds(p => ({ ...p, [bottle.id]: val }))}
                      placeholder="Scan barcode or type Bottle ID (optional)…"
                      bottleNum={bottle.bottleNum}
                    />
                  </div>
                  {/* Location */}
                  <div>
                    <div style={{fontSize:10.5, fontWeight:600, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.5px'}}>
                      Collection Location *
                    </div>
                    <input
                      type="text"
                      value={locations[bottle.id] || ''}
                      onChange={e => { e.stopPropagation(); setLoc(bottle.id, e.target.value) }}
                      onClick={e => e.stopPropagation()}
                      placeholder="e.g. Transformer Bay A — Cooling Unit 3"
                      style={{marginBottom:0, fontSize:12.5}}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

// ── Send to VPS Modal ─────────────────────────────────────────────────────────
function SendModal({ batch, bottles, onClose, onSubmit }) {
  const collectedBottles = bottles.filter(b => b.batchId === batch.id && b.status === 'Collected')
  const [selected, setSelected] = useState(collectedBottles.map(b => b.id))
  const [form, setForm] = useState({ courier:'BlueDart', awb:'', sentDate:today() })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal open onClose={onClose} title={`Send Bottles to VPS Lab — ${batch.id}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => { onSubmit(selected, form); onClose() }}
            disabled={selected.length === 0 || !form.awb.trim()}
          >
            📦 Send {selected.length} Bottle{selected.length !== 1 ? 's' : ''} to VPS
          </button>
        </>
      }
    >
      <div className="alert alert-orange mb-4">
        <Icons.Info/>
        <span style={{fontSize:12.5}}>{collectedBottles.length} collected bottle{collectedBottles.length !== 1 ? 's' : ''} ready to ship.</span>
      </div>

      <div style={{maxHeight:200, overflowY:'auto', marginBottom:16, border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'8px'}}>
        {collectedBottles.map(b => (
          <div
            key={b.id}
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
              borderRadius:'var(--r)', marginBottom:4,
              background: selected.includes(b.id) ? 'rgba(212,82,12,0.05)' : '#fff',
              border:`1px solid ${selected.includes(b.id) ? 'rgba(212,82,12,0.2)' : 'var(--border)'}`,
              cursor:'pointer',
            }}
            onClick={() => setSelected(p => p.includes(b.id) ? p.filter(x => x !== b.id) : [...p, b.id])}
          >
            <input type="checkbox" checked={selected.includes(b.id)} onChange={() => {}} style={{width:'auto', accentColor:'var(--orange)'}}/>
            <span className="mono" style={{fontSize:12, color:'var(--orange)', fontWeight:600}}>Bottle #{b.bottleNum}</span>
            {b.bottleBarcode && <span style={{fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)'}}>· {b.bottleBarcode}</span>}
            <span style={{fontSize:11, color:'var(--text-muted)', flex:1}}>{b.location || '—'}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Courier</label>
          <select value={form.courier} onChange={e => up('courier', e.target.value)}>
            {COURIERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>AWB / Tracking Number *</label>
          <input type="text" value={form.awb} onChange={e => up('awb', e.target.value)} placeholder="Courier tracking number"/>
        </div>
        <div className="form-group">
          <label>Sent Date</label>
          <input type="date" value={form.sentDate} onChange={e => up('sentDate', e.target.value)}/>
        </div>
      </div>
    </Modal>
  )
}

// ── Bottle Grid ───────────────────────────────────────────────────────────────
function BottleGrid({ batchId, bottles }) {
  const bb = bottles.filter(b => b.batchId === batchId)
  if (!bb.length) return null
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:6}}>
      {bb.map(b => {
        const sc = STATUS_COLORS[b.status] || STATUS_COLORS['Empty']
        return (
          <div
            key={b.id}
            title={`Bottle #${b.bottleNum}: ${b.status}${b.location ? ` — ${b.location}` : ''}`}
            style={{padding:'8px 6px', borderRadius:'var(--r)', background:sc.bg, border:`1.5px solid ${sc.border}`, textAlign:'center'}}
          >
            <div style={{fontSize:10, fontFamily:'var(--font-mono)', color:sc.color, fontWeight:700, marginBottom:3}}>#{b.bottleNum}</div>
            <div style={{fontSize:9, color:sc.color, fontWeight:600, lineHeight:1.2}}>{b.status}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Batch Bottle Stats ────────────────────────────────────────────────────────
function BatchBottleStats({ batchId, bottles }) {
  const s = bottleStats(batchId, bottles)
  return (
    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
      {[
        {label:'Empty',       val:s.empty,       cls:'chip-gray',   show:s.empty > 0},
        {label:'Collected',   val:s.collected,   cls:'chip-blue',   show:s.collected > 0},
        {label:'In Transit',  val:s.inTransit,   cls:'chip-amber',  show:s.inTransit > 0},
        {label:'In Lab',      val:s.inLab,       cls:'chip-purple', show:s.inLab > 0},
        {label:'Tested',      val:s.tested,      cls:'chip-teal',   show:s.tested > 0},
        {label:'Report Ready',val:s.reportReady, cls:'chip-green',  show:s.reportReady > 0},
      ].filter(c => c.show).map(c => (
        <div key={c.label} className={`metric-chip ${c.cls}`}>
          <div className="metric-chip-dot"/>
          <span className="metric-chip-val">{c.val}</span>
          <span className="metric-chip-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Request Batch Modal ───────────────────────────────────────────────────────
function RequestBatchModal({ lockedCustomer, onClose, onSubmit }) {
  const [form, setForm] = React.useState({
    sampleType:'Transformer Oil', qty:12, location:'', notes:'', priority:'normal', urgentReason:'',
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function submit() {
    if (!form.location.trim()) return
    const today2 = new Date().toISOString().slice(0, 10)
    onSubmit({ ...form, customer:lockedCustomer, requestedDate:today2, id:`REQ-${Date.now()}`, status:'Pending' })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Request New Sample Batch from VPS Lab"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!form.location.trim()}>
            📋 Submit Request
          </button>
        </>
      }
    >
      <div className="alert alert-blue" style={{marginBottom:20}}>
        <Icons.Flask/>
        <span style={{fontSize:12.5}}>VPS Lab will review your request and dispatch bottles within 1–2 business days.</span>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>Sample Type *</label>
          <select value={form.sampleType} onChange={e => up('sampleType', e.target.value)}>
            {SAMPLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Number of Bottles *</label>
          <input type="number" min={1} max={100} value={form.qty} onChange={e => up('qty', +e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => up('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Collection Location / Site *</label>
        <input type="text" value={form.location} onChange={e => up('location', e.target.value)} placeholder="e.g. Transformer Bay A, Substation 2"/>
      </div>
      {form.priority === 'urgent' && (
        <div className="form-group">
          <label>Urgency Reason</label>
          <input type="text" value={form.urgentReason} onChange={e => up('urgentReason', e.target.value)} placeholder="Brief reason…"/>
        </div>
      )}
      <div className="form-group">
        <label>Additional Notes</label>
        <textarea value={form.notes} onChange={e => up('notes', e.target.value)} rows={3}/>
      </div>
    </Modal>
  )
}

// ── Main CustomerPortal ───────────────────────────────────────────────────────
export default function CustomerPortal({ batches, setBatches, bottles, setBottles, lockedCustomer=null }) {
  const { user } = useAuth()
  const { batchRequests, setBatchRequests } = useBatchRequests()

  const allCustomers = [...new Set(batches.map(b => b.customer))]
  const [selected, setSelected] = useState(lockedCustomer || allCustomers[0] || '')
  const [collectModal, setCollectModal] = useState(null)
  const [sendModal, setSendModal] = useState(null)
  const [expandedBatch, setExpandedBatch] = useState(null)
  const [requestModal, setRequestModal] = useState(false)

  const activeCustomer = lockedCustomer || selected
  const myBatches = batches.filter(b => b.customer === activeCustomer)

  const myPendingRequests  = batchRequests.filter(r => r.customer === activeCustomer && r.status === 'Pending')
  const myApprovedRequests = batchRequests.filter(r => r.customer === activeCustomer && r.status === 'Approved')

  function acknowledgeReceipt(batchId) {
    setBatches(p => p.map(b => b.id === batchId ? { ...b, stage:1, receivedDate:today() } : b))
    const batch = batches.find(b => b.id === batchId)
    if (batch) {
      const newBottles = Array.from({ length:batch.qty }, (_, i) => ({
        id:`${batchId}-B${String(i+1).padStart(2,'0')}`,
        batchId, bottleNum:i+1, status:'Empty',
        location:'', collectedDate:null, sentDate:null,
        receivedByLabDate:null, testedDate:null,
        reportId:null, technician:null,
        viscosity:null, moisture:null, acidity:null,
        result:null, recommendation:null, bottleBarcode:null,
      }))
      setBottles(p => [...newBottles, ...p])
      setBatchRequests(p => p.map(r => r.batchId === batchId ? { ...r, status:'Fulfilled' } : r))
    }
  }

  function handleCollect(bottleIds, locations, barcodes) {
    setBottles(p => p.map(b => bottleIds.includes(b.id)
      ? { ...b, status:'Collected', location:locations[b.id] || b.location, collectedDate:today(), bottleBarcode:barcodes?.[b.id] || null }
      : b
    ))
  }

  function handleSend(bottleIds, form, batchId) {
    setBottles(p => p.map(b => bottleIds.includes(b.id)
      ? { ...b, status:'Sent to VPS', sentDate:form.sentDate, courier:form.courier, awb:form.awb }
      : b
    ))
    if (batchId) {
      setBatches(p => p.map(b => b.id === batchId
        ? { ...b, returnCourier:form.courier, returnAwb:form.awb, returnSentDate:form.sentDate }
        : b
      ))
    }
  }

  const hasPendingRequest = myPendingRequests.length > 0

  function handleRequest(req) {
    setBatchRequests(p => [...p, req])
  }

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12}}>
        <div>
          <div className="page-header-tag">Batches</div>
          <div className="page-header-title">My Batches &amp; Samples</div>
          <div className="page-header-sub">{lockedCustomer ? `Active batches — ${lockedCustomer}` : 'Simulate customer-facing portal'}</div>
        </div>
        {lockedCustomer && (
          myPendingRequests.length > 0 ? (
            <div style={{
              display:'flex', alignItems:'center', gap:10, padding:'9px 16px',
              borderRadius:'var(--r-sm)', background:'rgba(201,122,6,0.08)',
              border:'1.5px solid rgba(201,122,6,0.25)', color:'var(--amber)',
              fontSize:12, fontWeight:600,
            }}>
              <span style={{fontSize:15}}>⏳</span> Request pending approval
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setRequestModal(true)}>
              <Icons.Plus/> Request New Batch
            </button>
          )
        )}
      </div>

      {!lockedCustomer && (
        <div className="alert alert-orange mb-5">
          <Icons.Info/>
          <div>Admin view — switch customers below. In production each customer logs in separately.</div>
        </div>
      )}

      {!lockedCustomer && (
        <div className="form-group" style={{maxWidth:340, marginBottom:28}}>
          <label>Viewing as Customer</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {allCustomers.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Pending requests banner */}
      {myPendingRequests.length > 0 && (
        <div style={{padding:'12px 16px', borderRadius:'var(--r)', background:'#fffbeb', border:'1.5px solid #fde68a', marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:18}}>⏳</span>
          <div>
            <div style={{fontWeight:700, fontSize:13, color:'#92400e'}}>{myPendingRequests.length} batch request{myPendingRequests.length > 1 ? 's' : ''} awaiting VPS Lab approval</div>
            <div style={{fontSize:12, color:'#a16207', marginTop:1}}>{myPendingRequests.map(r => `${r.qty}× ${r.sampleType}`).join(' · ')}</div>
          </div>
        </div>
      )}

      {myApprovedRequests.length > 0 && (
        <div style={{padding:'12px 16px', borderRadius:'var(--r)', background:'#f0fdf4', border:'1.5px solid #a7f3d0', marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:18}}>✅</span>
          <div style={{fontWeight:700, fontSize:13, color:'#065f46'}}>Your batch request has been approved! Bottles are being dispatched — please acknowledge below when received.</div>
        </div>
      )}

      {myBatches.length === 0 && (
        <div className="card"><div className="empty-state"><Icons.Bottle/><p>No batches dispatched yet for {activeCustomer}</p></div></div>
      )}

      {myBatches.map(b => {
        const s = bottleStats(b.id, bottles)
        const isExpanded = expandedBatch === b.id

        return (
          <div className="card mb-4" key={b.id}>
            <div className="flex justify-between items-start mb-3" style={{flexWrap:'wrap', gap:10}}>
              <div>
                <div className="mono" style={{fontSize:11, color:'var(--orange)', marginBottom:3, fontWeight:600}}>{b.id}</div>
                <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:17}}>{b.qty} Sample Bottles</div>
                <div style={{fontSize:12, color:'var(--text-muted)', marginTop:3}}>{b.sampleType} · {b.courier} · {b.awb}</div>
              </div>
              {b.stage === 0 ? (
                <div style={{padding:'8px 14px', borderRadius:'var(--r)', background:'#fef3c7', border:'1.5px solid #fde68a'}}>
                  <div style={{fontSize:10, color:'#78350f', fontWeight:700, textTransform:'uppercase', letterSpacing:0.6, marginBottom:2}}>ACTION REQUIRED</div>
                  <div style={{fontSize:13, fontWeight:700, color:'#b45309'}}>Please acknowledge receipt</div>
                </div>
              ) : (
                <div style={{padding:'8px 14px', borderRadius:'var(--r)', background:'#f0fdf4', border:'1px solid #a7f3d0'}}>
                  <div style={{fontSize:10, color:'#065f46', fontWeight:700, textTransform:'uppercase', letterSpacing:0.6, marginBottom:2}}>BATCH STATUS</div>
                  <div style={{fontSize:13, fontWeight:700, color:'#059669'}}>✓ Received {fmtDate(b.receivedDate)}</div>
                </div>
              )}
            </div>

            {b.stage === 0 && (
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'12px 16px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'var(--r)'}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, flexShrink:0}}>1</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, fontSize:13}}>Bottles dispatched by VPS Lab</div>
                  <div style={{fontSize:12, color:'var(--text-muted)'}}>{fmtDate(b.dispatched)} · {b.courier} · {b.awb}</div>
                </div>
                <div style={{width:40, height:2, background:'var(--border)'}}/>
                <div style={{width:32, height:32, borderRadius:'50%', background:'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:14, flexShrink:0}}>2</div>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>Awaiting your confirmation…</div>
              </div>
            )}

            {b.stage === 1 && <BatchBottleStats batchId={b.id} bottles={bottles}/>}

            <div className="flex gap-3" style={{flexWrap:'wrap', marginBottom:b.stage===1 && s.total > 0 ? 12 : 0}}>
              {b.stage === 0 && (
                <button className="btn btn-primary" onClick={() => acknowledgeReceipt(b.id)}>
                  ✓ Acknowledge Receipt of {b.qty} Bottles
                </button>
              )}
              {b.stage === 1 && s.empty > 0 && (
                <button className="btn btn-primary" onClick={() => setCollectModal(b)}>
                  🧪 Mark Bottles as Collected ({s.empty} empty)
                </button>
              )}
              {b.stage === 1 && s.collected > 0 && (
                <button className="btn btn-ghost" style={{borderColor:'var(--amber)', color:'#b45309'}} onClick={() => setSendModal(b)}>
                  📦 Send to VPS Lab ({s.collected} ready)
                </button>
              )}
              {b.stage === 1 && s.reportReady > 0 && (
                <span className="badge badge-green" style={{padding:'8px 14px', fontSize:13}}>
                  ✓ {s.reportReady} Report{s.reportReady !== 1 ? 's' : ''} Ready
                </span>
              )}
            </div>

            {b.stage === 1 && s.total > 0 && (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setExpandedBatch(isExpanded ? null : b.id)}
                  style={{marginBottom: isExpanded ? 12 : 0}}
                >
                  {isExpanded ? '▲ Hide' : '▼ Show'} all {s.total} bottles
                </button>
                {isExpanded && <BottleGrid batchId={b.id} bottles={bottles}/>}
              </>
            )}

            {b.issues?.length > 0 && (
              <div style={{marginTop:12}}>
                {b.issues.map((iss, i) => (
                  <div key={i} className="alert alert-red" style={{marginBottom:6}}>
                    <Icons.Warn/><span style={{fontSize:12.5}}>{iss}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {collectModal && (
        <CollectModal
          batch={collectModal}
          bottles={bottles}
          onClose={() => setCollectModal(null)}
          onSubmit={handleCollect}
        />
      )}
      {sendModal && (
        <SendModal
          batch={sendModal}
          bottles={bottles}
          onClose={() => setSendModal(null)}
          onSubmit={(ids, form) => handleSend(ids, form, sendModal.id)}
        />
      )}
      {requestModal && lockedCustomer && !hasPendingRequest && (
        <RequestBatchModal
          lockedCustomer={lockedCustomer}
          onClose={() => setRequestModal(false)}
          onSubmit={handleRequest}
        />
      )}
    </div>
  )
}