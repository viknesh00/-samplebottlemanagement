import React, { useRef, useState, useEffect } from 'react'
import { X, Printer, Package, Tag, Layers } from 'lucide-react'
import { fmtDate } from '../utils/constants'

const VPS_LOGO = 'https://vpsveritas.com//themes/custom/vps/images/logo.svg'

/* ════════════════════════════════════════════════════════════════════
   BARCODE — JsBarcode renders crisp inline SVG vector paths.
   After render we force width:'100%' so it never overflows or clips.
═══════════════════════════════════════════════════════════════════════ */
function Barcode({ value, height = 64, barWidth = 1.4, showText = true, fontSize = 11 }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current || !value) return
    const draw = () => {
      try {
        window.JsBarcode(ref.current, value, {
          format:       'CODE128',
          width:        barWidth,   // bar-unit width in px — keep ≤ 1.6 for thermal
          height,
          displayValue: showText,
          fontSize,
          textMargin:   3,
          margin:       6,          // quiet-zone on each side — scanners need this
          background:   '#ffffff',
          lineColor:    '#000000',
        })
        // Force the SVG to fill its container width without clipping
        if (ref.current) {
          ref.current.style.width  = '100%'
          ref.current.style.height = 'auto'
          ref.current.removeAttribute('width')
        }
      } catch (e) { console.error('Barcode error', e) }
    }

    if (window.JsBarcode) {
      draw()
    } else {
      const s = document.createElement('script')
      s.src    = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
      s.onload = draw
      document.head.appendChild(s)
    }
  }, [value, height, barWidth, showText, fontSize])

  return (
    <svg
      ref={ref}
      style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
    />
  )
}

/* ════════════════════════════════════════════════════════════════════
   SCISSOR CUT LINE — real dashed border, prints correctly on all
   printers (gradient-based lines do NOT print on most drivers).
═══════════════════════════════════════════════════════════════════════ */
function CutLine() {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      height:         20,
      flexShrink:     0,
      background:     '#fff',
      padding:        '0 10px',
      position:       'relative',
    }}>
      {/* Left dash */}
      <div style={{ flex: 1, borderTop: '1.8px dashed #555' }} />
      {/* Scissors icon */}
      <span style={{
        fontSize:   14,
        color:      '#333',
        lineHeight: 1,
        padding:    '0 6px',
        background: '#fff',
        position:   'relative',
        zIndex:     1,
        fontWeight: 700,
      }}>✂</span>
      {/* Right dash */}
      <div style={{ flex: 1, borderTop: '1.8px dashed #555' }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   LABEL HALF — one half of the 4×6 bottle label
   Bold weights everywhere — thermal needs ≥ 700 weight to print dark.
═══════════════════════════════════════════════════════════════════════ */
function LabelHalf({ bottle, customer, copyType }) {
  return (
    <div style={{
      width:       '100%',
      flex:        1,
      display:     'flex',
      flexDirection: 'column',
      background:  '#ffffff',
      fontFamily:  "'Arial Black', 'Arial', sans-serif",
      overflow:    'visible',  /* ← never clip the barcode */
    }}>

      {/* Orange accent strip */}
      <div style={{ height: 7, background: '#e85d0a', flexShrink: 0 }} />

      {/* Header: logo + badge */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        padding:       '7px 12px 6px',
        borderBottom:  '1.5px solid #333',
        flexShrink:    0,
      }}>
        <img
          src={VPS_LOGO} alt="VPS"
          style={{ height: 26, width: 'auto' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{
          fontSize:    8.5,
          fontWeight:  800,
          color:       copyType === 'CUSTOMER COPY' ? '#444' : '#e85d0a',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          border:      `1.5px solid ${copyType === 'CUSTOMER COPY' ? '#555' : '#e85d0a'}`,
          padding:     '2px 7px',
          borderRadius: 4,
        }}>
          {copyType}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ padding: '7px 12px 4px', flexShrink: 0 }}>

        {/* Batch + Serial */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 5 }}>
          <div>
            <div style={{ fontSize: 7.5, fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 1 }}>BATCH</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#111', fontFamily: 'monospace' }}>{bottle.batchId}</div>
          </div>
          <div style={{ width: 1, height: 32, background: '#bbb', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 7.5, fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 1 }}>SERIAL NUMBER</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#e85d0a', fontFamily: 'monospace', lineHeight: 1 }}>
                {bottle.serialNumber || '—'}
              </span>
              {bottle.bottleNum != null && (
                <span style={{ fontSize: 9, fontWeight: 800, color: '#555', fontFamily: 'monospace' }}>
                  #{String(bottle.bottleNum).padStart(3, '0')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 7.5, fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 1 }}>CUSTOMER</div>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {customer.split(' ').slice(0, 5).join(' ')}
          </div>
        </div>

        {/* Asset */}
        <div>
          <div style={{ fontSize: 7.5, fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 1 }}>ASSET</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {bottle.assetName || 'Unknown Asset'}
          </div>
        </div>
      </div>

      {/* Barcode — full width, never clipped */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '4px 10px 8px',
        overflow:       'visible',
      }}>
        <Barcode
          value={bottle.id}
          height={58}
          barWidth={1.4}
          showText={true}
          fontSize={9}
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   BOTTLE LABEL — 4" × 6" thermal
   Two halves: top = customer reference, bottom = bottle sticker
═══════════════════════════════════════════════════════════════════════ */
function BottleLabel({ bottle, customer }) {
  return (
    <div className="vps-label" style={{
      display:         'flex',
      flexDirection:   'column',
      width:           '4in',
      height:          '6in',
      border:          '1px solid #ccc',
      overflow:        'visible',
      background:      '#ffffff',
      pageBreakAfter:  'always',
      breakAfter:      'page',
      pageBreakInside: 'avoid',
      breakInside:     'avoid',
    }}>
      {/* Top half */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
        <LabelHalf bottle={bottle} customer={customer} copyType="CUSTOMER COPY" />
      </div>

      {/* Cut line — real dashed border, prints on all drivers */}
      <CutLine />

      {/* Bottom half */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
        <LabelHalf bottle={bottle} customer={customer} copyType="BOTTLE STICKER" />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   BATCH BOX LABEL — 4" × 6" portrait thermal
═══════════════════════════════════════════════════════════════════════ */
function BatchBoxLabel({ batch, bottleCount }) {
  const dispDate = fmtDate(batch.dispatchedDate || batch.orderDate)

  return (
    <div className="vps-label" style={{
      width:           '4in',
      height:          '6in',
      background:      '#ffffff',
      border:          '2.5px solid #111',
      overflow:        'hidden',
      fontFamily:      "'Arial Black', 'Arial', sans-serif",
      display:         'flex',
      flexDirection:   'column',
      pageBreakAfter:  'always',
      breakAfter:      'page',
      pageBreakInside: 'avoid',
      breakInside:     'avoid',
    }}>

      {/* Top orange band */}
      <div style={{ height: 10, background: '#e85d0a', flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        padding:       '10px 14px 9px',
        borderBottom:  '2px solid #111',
        gap:           12,
        flexShrink:    0,
      }}>
        <img
          src={VPS_LOGO} alt="VPS"
          style={{ height: 34, width: 'auto' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#333', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>
            VPS VERITAS · LAB SAMPLE BOX
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#555', fontFamily: 'monospace' }}>vpsveritas.com</div>
        </div>
        <div style={{ border: '1.5px solid #555', borderRadius: 5, padding: '4px 9px', textAlign: 'center' }}>
          <div style={{ fontSize: 7.5, fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Sample Type</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#111', fontFamily: 'monospace' }}>{batch.sampleType || '—'}</div>
        </div>
      </div>

      {/* Batch ID hero */}
      <div style={{
        padding:      '12px 14px 10px',
        borderBottom: '1.5px solid #e5e7eb',
        background:   '#fffaf7',
        flexShrink:   0,
      }}>
        <div style={{ fontSize: 8, fontWeight: 900, color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 5 }}>
          BATCH REFERENCE
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#e85d0a', fontFamily: 'monospace', letterSpacing: '0.5px', lineHeight: 1 }}>
          {batch.id}
        </div>
      </div>

      {/* Customer + details */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
        <div style={{ marginBottom: 7 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>Customer</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1.2 }}>
            {batch.customer?.split(' ').slice(0, 6).join(' ')}
          </div>
        </div>

        {batch.address && (
          <div style={{ marginBottom: 7 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Delivery Address</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#222', lineHeight: 1.4 }}>{batch.address}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
          {[
            ['Total Bottles', `${bottleCount} bottles`, '#e85d0a'],
            ['Courier',       batch.courierService || '—', '#111'],
            ['Tracking No.',  batch.trackingNumber || '—', '#111'],
            ['Date',          dispDate || '—', '#111'],
          ].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ fontSize: 7.5, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: c, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
            </div>
          ))}
        </div>

        {batch.notes && (
          <div style={{ marginTop: 8, padding: '6px 9px', background: '#f3f4f6', border: '1px solid #ddd', borderRadius: 5, fontSize: 9.5, fontWeight: 700, color: '#333', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 900, color: '#111' }}>Notes: </span>{batch.notes}
          </div>
        )}
      </div>

      {/* Barcode centrepiece */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '10px 18px',
        background:     '#fafafa',
        borderBottom:   '2px solid #111',
      }}>
        <div style={{ fontSize: 8.5, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, textAlign: 'center' }}>
          Scan to Identify Batch
        </div>
        <div style={{
          background:   '#fff',
          padding:      '8px 10px',
          borderRadius: 7,
          border:       '1.5px solid #ddd',
          width:        '100%',
          display:      'flex',
          justifyContent: 'center',
        }}>
          <Barcode value={batch.id} height={88} barWidth={1.6} showText={true} fontSize={11} />
        </div>
        <div style={{ marginTop: 12, padding: '7px 16px', background: '#111', borderRadius: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center' }}>
            FRAGILE · SAMPLES INSIDE
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#111', padding: '7px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          VPS LabTrack · {batch.id}
        </div>
        <div style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          VPS Veritas
        </div>
      </div>

      {/* Bottom orange band */}
      <div style={{ height: 8, background: '#e85d0a', flexShrink: 0 }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   PRINT HELPER — 4in × 6in page, zero margin, JsBarcode included
   so barcodes survive the innerHTML transfer to print window.
═══════════════════════════════════════════════════════════════════════ */
function printWindow(html, title) {
  const win = window.open('', '_blank', 'width=500,height=720')
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: 'Arial Black', Arial, sans-serif; }
    .vps-label { page-break-after: always; break-after: page; page-break-inside: avoid; break-inside: avoid; }
    svg { display: block; width: 100% !important; height: auto !important; overflow: visible !important; }
    @page { size: 4in 6in; margin: 0mm; }
    @media print { html, body { width: 4in; height: 6in; } }
  </style>
</head>
<body onload="
  /* Re-render barcodes from data-value attr as a safety net */
  if(window.JsBarcode){
    document.querySelectorAll('svg[data-rendered]').forEach(function(svg){});
  }
  setTimeout(function(){ window.print(); window.close(); }, 600);
">${html}</body>
</html>`)
  win.document.close()
}

/* ════════════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════════════════ */
export default function LabelPrint({ batch, bottles, onClose }) {
  const allRef   = useRef()
  const batchRef = useRef()
  const [activeTab, setActiveTab] = useState('batch')
  const [singleIdx, setSingleIdx] = useState(0)

  const batchBottles  = bottles.filter(b => b.batchId === batch.id)
  const shortCustomer = batch.customer?.split(' ').slice(0, 3).join(' ') || '—'

  const tabs = [
    { key: 'batch',  label: 'Box Label',                            icon: <Layers  size={12} />, desc: '4×6 label — paste on top of the dispatch box' },
    { key: 'all',    label: `All Bottles (${batchBottles.length})`, icon: <Tag     size={12} />, desc: 'One 4×6 label per bottle — two halves with cut line' },
    { key: 'single', label: 'Single Bottle',                        icon: <Package size={12} />, desc: 'Print one selected bottle label' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 16px', overflowY: 'auto',
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 620,
        boxShadow: '0 40px 80px rgba(0,0,0,0.30)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 22px',
          background: 'linear-gradient(135deg,#0a0d12 0%,#1a1f2e 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(232,93,10,0.2)', border: '1px solid rgba(232,93,10,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Printer size={18} color="#e85d0a" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Label Print — {batch.id}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
                {shortCustomer} · {batchBottles.length} bottles · 4″×6″ thermal
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, cursor: 'pointer', color: '#fff',
          }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: activeTab === t.key ? '2px solid #e85d0a' : '2px solid transparent',
              color: activeTab === t.key ? '#e85d0a' : '#6b7280', marginBottom: -1,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '5px 22px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 10.5, color: '#9ca3af' }}>
          {tabs.find(t => t.key === activeTab)?.desc}
        </div>

        {/* ── BATCH BOX LABEL ── */}
        {activeTab === 'batch' && (
          <>
            <div style={{ padding: '20px 22px', maxHeight: '64vh', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center', width: '4in' }}>
                <div ref={batchRef}>
                  <BatchBoxLabel batch={batch} bottleCount={batchBottles.length} />
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10.5, color: '#9ca3af', fontFamily: 'monospace' }}>4″ × 6″ · Code 128 · Box-top label</div>
              <button
                onClick={() => printWindow(batchRef.current.innerHTML, `VPS Box Label — ${batch.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#e85d0a', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                <Printer size={14} strokeWidth={2.5} /> Print Box Label
              </button>
            </div>
          </>
        )}

        {/* ── ALL BOTTLE LABELS ── */}
        {activeTab === 'all' && (
          <>
            <div style={{ padding: '12px 14px', maxHeight: '58vh', overflowY: 'auto' }}>
              <div ref={allRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {batchBottles.map(b => (
                  <BottleLabel key={b.id} bottle={b} customer={batch.customer} />
                ))}
              </div>
              {batchBottles.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No bottles in this batch.</div>
              )}
            </div>
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10.5, color: '#9ca3af', fontFamily: 'monospace' }}>{batchBottles.length} × 4″×6″ · Code 128</div>
              <button
                onClick={() => printWindow(allRef.current.innerHTML, `VPS Bottle Labels — ${batch.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#e85d0a', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                <Printer size={14} strokeWidth={2.5} /> Print All Labels
              </button>
            </div>
          </>
        )}

        {/* ── SINGLE BOTTLE ── */}
        {activeTab === 'single' && (
          <>
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', flexShrink: 0 }}>Select Bottle:</label>
              <select
                value={singleIdx}
                onChange={e => setSingleIdx(+e.target.value)}
                style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
              >
                {batchBottles.map((b, i) => (
                  <option key={b.id} value={i}>
                    {b.id} — {b.serialNumber || 'No Serial'} — {b.assetName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {batchBottles[singleIdx] && (
              <div style={{ padding: '16px 22px', maxHeight: '58vh', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div id={`sl-${batchBottles[singleIdx].id}`} style={{ width: '4in' }}>
                  <BottleLabel bottle={batchBottles[singleIdx]} customer={batch.customer} />
                </div>
              </div>
            )}

            <div style={{ padding: '12px 22px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10.5, color: '#9ca3af', fontFamily: 'monospace' }}>Single bottle · 4″×6″ · Code 128</div>
              <button
                onClick={() => {
                  const el = document.getElementById(`sl-${batchBottles[singleIdx].id}`)
                  if (el) printWindow(el.outerHTML, `VPS Label — ${batchBottles[singleIdx].id}`)
                }}
                disabled={!batchBottles[singleIdx]}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                  background: '#e85d0a', border: 'none', borderRadius: 9,
                  color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  opacity: batchBottles[singleIdx] ? 1 : 0.5,
                }}
              >
                <Printer size={14} strokeWidth={2.5} /> Print This Label
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}