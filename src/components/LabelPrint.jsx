import React, { useRef, useState } from 'react'
import { X, Printer, Package, Tag, Layers } from 'lucide-react'
import { fmtDate } from '../utils/constants'

const VPS_LOGO = 'https://vpsveritas.com//themes/custom/vps/images/logo.svg'

function barcodeUrl(value) {
  return `https://barcodeapi.org/api/128/${encodeURIComponent(value)}`
}

/* ════════════════════════════════════════════════════════════════════
   BOTTLE LABEL — compact, cut-and-stick on bottle
═══════════════════════════════════════════════════════════════════════ */
function LabelHalf({ bottle, customer }) {
  const shortCustomer = customer.split(' ').slice(0,4).join(' ')
  return (
    <div style={{ display:'flex', alignItems:'stretch', width:'100%', height:100, background:'#ffffff', fontFamily:"'Arial',sans-serif", overflow:'hidden' }}>
      <div style={{ width:4, background:'#e85d0a', flexShrink:0 }}/>
      <div style={{ width:72, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8px 6px', flexShrink:0, borderRight:'1px solid #e5e7eb' }}>
        <img src={VPS_LOGO} alt="VPS" style={{ width:54, height:'auto', display:'block' }} onError={e=>{e.target.style.display='none'}}/>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'8px 10px', gap:4, overflow:'hidden', minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
          <span style={{ fontSize:8, fontWeight:700, color:'#9ca3af', textTransform:'uppercase' }}>BATCH:</span>
          <span style={{ fontSize:10, fontWeight:800, color:'#374151', fontFamily:'monospace' }}>{bottle.batchId}</span>
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
          <span style={{ fontSize:8, fontWeight:700, color:'#9ca3af', textTransform:'uppercase' }}>Serial No:</span>
          <span style={{ fontSize:13, fontWeight:900, color:'#e85d0a', fontFamily:'monospace' }}>{bottle.serialNumber||'—'}</span>
          {bottle.bottleNum != null && (
            <span style={{ fontSize:8, color:'#9ca3af', fontFamily:'monospace', fontWeight:700 }}>#{String(bottle.bottleNum).padStart(3,'0')}</span>
          )}
        </div>
        <div style={{ fontSize:10, fontWeight:700, color:'#111827', textTransform:'uppercase', letterSpacing:'0.2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{shortCustomer}</div>
        <div style={{ fontSize:9, fontWeight:500, color:'#6b7280', lineHeight:1.25, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{bottle.assetName||'Unknown Asset'}</div>
      </div>
      <div style={{ width:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6px 8px', flexShrink:0, borderLeft:'1px solid #e5e7eb', background:'#f9fafb' }}>
        <img src={barcodeUrl(bottle.id)} alt={bottle.id} style={{ height:44, width:'auto', maxWidth:96, display:'block', imageRendering:'crisp-edges' }} onError={e=>{e.target.style.display='none'}}/>
        <div style={{ fontSize:6.5, fontFamily:'monospace', color:'#6b7280', marginTop:3, letterSpacing:'0.2px', textAlign:'center', wordBreak:'break-all', lineHeight:1.3 }}>{bottle.id}</div>
      </div>
    </div>
  )
}

function BottleLabel({ bottle, customer }) {
  return (
    <div className="vps-label" style={{ display:'grid', gridTemplateColumns:'1fr 16px 1fr', width:'100%', height:100, border:'1px solid #d1d5db', borderRadius:6, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', pageBreakInside:'avoid', breakInside:'avoid', background:'#ffffff' }}>
      <LabelHalf bottle={bottle} customer={customer}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fff', position:'relative', flexShrink:0 }}>
        <div style={{ width:1, height:'100%', position:'absolute', backgroundImage:'repeating-linear-gradient(to bottom, #cbd5e1 0px, #cbd5e1 4px, transparent 4px, transparent 9px)' }}/>
        <div style={{ position:'relative', zIndex:1, fontSize:9, color:'#94a3b8', background:'#fff', padding:'1px 0', lineHeight:1 }}>✂</div>
      </div>
      <LabelHalf bottle={bottle} customer={customer}/>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   BATCH LABEL — Large A5 box-top label (148mm × 210mm equivalent)
   Designed to be pasted on TOP of the dispatch box
═══════════════════════════════════════════════════════════════════════ */
function BatchBoxLabel({ batch, bottleCount }) {
  const shortCustomer = batch.customer.split(' ').slice(0,5).join(' ')
  const dispDate = fmtDate(batch.dispatchedDate || batch.orderDate)

  return (
    <div className="vps-label" style={{
      width:'100%',
      maxWidth: 560,
      minHeight: 320,
      background:'#ffffff',
      border:'3px solid #111827',
      borderRadius:12,
      overflow:'hidden',
      fontFamily:"'Arial',sans-serif",
      pageBreakInside:'avoid',
      breakInside:'avoid',
      boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
    }}>
      {/* Top orange band */}
      <div style={{ height:12, background:'#e85d0a', width:'100%' }}/>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', padding:'16px 20px 12px', borderBottom:'2px solid #111827', gap:16 }}>
        <img src={VPS_LOGO} alt="VPS" style={{ height:40, width:'auto' }} onError={e=>{e.target.style.display='none'}}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:'2px', marginBottom:2 }}>VPS VERITAS · LAB SAMPLE BOX</div>
          <div style={{ fontSize:9, color:'#9ca3af', fontFamily:'monospace' }}>vpsveritas.com · laboratory sample tracking</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:9, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>Sample Type</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#374151', fontFamily:'monospace' }}>{batch.sampleType||'—'}</div>
        </div>
      </div>

      {/* Batch ID — large and bold */}
      <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid #e5e7eb', background:'#fffaf7' }}>
        <div style={{ fontSize:8.5, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'2px', marginBottom:8 }}>BATCH REFERENCE NUMBER</div>
        <div style={{ fontSize:40, fontWeight:900, color:'#e85d0a', fontFamily:'monospace', letterSpacing:'1px', lineHeight:1, textShadow:'0 1px 0 rgba(232,93,10,0.15)' }}>{batch.id}</div>
      </div>

      {/* Main content */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 180px', gap:0 }}>
        {/* Info */}
        <div style={{ padding:'14px 20px', borderRight:'1px solid #e5e7eb' }}>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 }}>Customer</div>
            <div style={{ fontSize:14, fontWeight:800, color:'#111827', lineHeight:1.3 }}>{shortCustomer}</div>
          </div>
          {batch.address && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:8, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>Delivery Address</div>
              <div style={{ fontSize:10, fontWeight:600, color:'#374151', lineHeight:1.4 }}>{batch.address}</div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 20px' }}>
            {[
              ['Total Bottles', `${bottleCount} bottles`, '#e85d0a'],
              ['Courier',       batch.courierService||'—','#374151'],
              ['Tracking No.',  batch.trackingNumber||'—','#374151'],
            ].map(([l,v,c])=>(
              <div key={l}>
                <div style={{ fontSize:8, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:11, fontWeight:700, color:c, fontFamily:l==='Total Bottles'||l==='Tracking No.'?'monospace':undefined }}>{v}</div>
              </div>
            ))}
          </div>
          {batch.notes && (
            <div style={{ marginTop:10, padding:'8px 10px', background:'#f3f4f6', borderRadius:6, fontSize:10, color:'#6b7280', lineHeight:1.4 }}>
              <span style={{ fontWeight:700, color:'#374151' }}>Notes: </span>{batch.notes}
            </div>
          )}
        </div>

        {/* Barcode */}
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
          <div style={{ fontSize:8.5, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10, textAlign:'center' }}>Scan to Identify Batch</div>
          <div style={{ background:'#fff', padding:'10px', borderRadius:8, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <img src={barcodeUrl(batch.id)} alt={batch.id} style={{ height:72, width:'auto', maxWidth:140, display:'block', imageRendering:'crisp-edges' }} onError={e=>{e.target.style.display='none'}}/>
          </div>
          <div style={{ fontSize:9, fontFamily:'monospace', color:'#6b7280', marginTop:8, textAlign:'center', fontWeight:700, letterSpacing:'0.5px' }}>{batch.id}</div>
          <div style={{ marginTop:10, padding:'6px 12px', background:'#111827', borderRadius:6 }}>
            <div style={{ fontSize:9, fontWeight:800, color:'#fff', textTransform:'uppercase', letterSpacing:'0.8px', textAlign:'center' }}>FRAGILE · SAMPLES INSIDE</div>
          </div>
        </div>
      </div>

      {/* Footer band */}
      <div style={{ borderTop:'2px solid #111827', background:'#111827', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>Generated by VPS LabTrack · {batch.id}</div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.7)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>VPS Veritas Lab Management</div>
      </div>

      {/* Bottom orange band */}
      <div style={{ height:8, background:'#e85d0a', width:'100%' }}/>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   PRINT HELPER
═══════════════════════════════════════════════════════════════════════ */
function printWindow(html, title, orientation = 'landscape') {
  const win = window.open('','_blank','width=960,height=1200')
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#fff;padding:14px}
    .label-grid{display:flex;flex-direction:column;gap:8px}
    .vps-label{page-break-inside:avoid;break-inside:avoid}
    @page{size:A4 ${orientation};margin:10mm}
    @media print{body{padding:0}.label-grid{gap:5px}}
  </style></head><body>${html}</body></html>`)
  win.document.close(); win.focus()
  setTimeout(()=>{win.print();win.close()},500)
}

/* ════════════════════════════════════════════════════════════════════
   MAIN LABEL PRINT MODAL
═══════════════════════════════════════════════════════════════════════ */
export default function LabelPrint({ batch, bottles, onClose }) {
  const allRef      = useRef()
  const batchRef    = useRef()
  const [activeTab, setActiveTab] = useState('batch') // start on batch label
  const [singleIdx, setSingleIdx] = useState(0)

  const batchBottles  = bottles.filter(b => b.batchId === batch.id)
  const shortCustomer = batch.customer?.split(' ').slice(0,3).join(' ') || '—'

  const tabs = [
    { key:'batch',  label:'Box Label (A5)',        icon:<Layers size={12}/>,  desc:'Paste on top of dispatch box' },
    { key:'all',    label:`Bottle Labels (${batchBottles.length})`, icon:<Tag size={12}/>, desc:'All bottles in batch' },
    { key:'single', label:'Single Bottle',         icon:<Package size={12}/>, desc:'Pick one bottle' },
  ]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px 16px', overflowY:'auto' }}>
      <div style={{ background:'#ffffff', borderRadius:16, width:'100%', maxWidth:720, boxShadow:'0 40px 80px rgba(0,0,0,0.30)', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'16px 22px', background:'linear-gradient(135deg,#0a0d12 0%,#1a1f2e 100%)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'rgba(232,93,10,0.2)', border:'1px solid rgba(232,93,10,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Printer size={18} color="#e85d0a" strokeWidth={2}/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#ffffff' }}>Label Print — {batch.id}</div>
              <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.45)', marginTop:1 }}>{shortCustomer} · {batchBottles.length} bottles</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, cursor:'pointer', color:'#fff' }}>
            <X size={16} strokeWidth={2}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 18px', fontSize:12, fontWeight:600, cursor:'pointer', background:'none', border:'none', borderBottom:activeTab===t.key?'2px solid #e85d0a':'2px solid transparent', color:activeTab===t.key?'#e85d0a':'#6b7280', marginBottom:-1 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding:'6px 22px 2px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', fontSize:10.5, color:'var(--text-muted)' }}>
          {tabs.find(t=>t.key===activeTab)?.desc}
        </div>

        {/* ── BATCH BOX LABEL ── */}
        {activeTab==='batch' && (
          <>
            <div style={{ padding:'20px 22px', maxHeight:'60vh', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ marginBottom:12, fontSize:11.5, color:'var(--text-muted)', textAlign:'center' }}>
                A5-size label — print and paste on <strong>top of the dispatch box</strong>
              </div>
              <div ref={batchRef} style={{ width:'100%', maxWidth:560 }}>
                <BatchBoxLabel batch={batch} bottleCount={batchBottles.length}/>
              </div>
            </div>
            <div style={{ padding:'12px 22px', borderTop:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:10.5, color:'#9ca3af', fontFamily:'monospace' }}>A5 · Code 128 barcode · Box-top label</div>
              <button onClick={()=>printWindow(batchRef.current.innerHTML, `VPS Box Label — ${batch.id}`, 'portrait')} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#e85d0a', border:'none', borderRadius:9, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
                <Printer size={14} strokeWidth={2.5}/> Print Box Label
              </button>
            </div>
          </>
        )}

        {/* ── ALL BOTTLE LABELS ── */}
        {activeTab==='all' && (
          <>
            <div style={{ padding:'8px 22px 2px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 16px 1fr' }}>
                <div style={{ textAlign:'center', fontSize:9.5, color:'#6b7280', fontWeight:600, padding:'5px 0' }}>📋 Customer Reference Copy</div>
                <div/>
                <div style={{ textAlign:'center', fontSize:9.5, color:'#6b7280', fontWeight:600, padding:'5px 0' }}>🏷 Bottle Sticker — cut &amp; paste</div>
              </div>
            </div>
            <div style={{ padding:'14px 16px', maxHeight:'55vh', overflowY:'auto' }}>
              <div ref={allRef} className="label-grid" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {batchBottles.map(b=><BottleLabel key={b.id} bottle={b} customer={batch.customer}/>)}
              </div>
              {batchBottles.length===0 && <div style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>No bottles in this batch.</div>}
            </div>
            <div style={{ padding:'12px 22px', borderTop:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:10.5, color:'#9ca3af', fontFamily:'monospace' }}>{batchBottles.length} labels · Code 128 barcode</div>
              <button onClick={()=>printWindow(allRef.current.innerHTML, `VPS Bottle Labels — ${batch.id}`)} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#e85d0a', border:'none', borderRadius:9, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
                <Printer size={14} strokeWidth={2.5}/> Print All Labels
              </button>
            </div>
          </>
        )}

        {/* ── SINGLE BOTTLE ── */}
        {activeTab==='single' && (
          <>
            <div style={{ padding:'14px 22px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:10 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', flexShrink:0 }}>Select Bottle:</label>
              <select value={singleIdx} onChange={e=>setSingleIdx(+e.target.value)} style={{ flex:1, fontSize:12.5, padding:'6px 10px', borderRadius:6, border:'1px solid #d1d5db' }}>
                {batchBottles.map((b,i)=><option key={b.id} value={i}>{b.id} — {b.serialNumber||'No Serial No.'} — {b.assetName||'Unknown'}</option>)}
              </select>
            </div>
            {batchBottles[singleIdx] && (
              <div style={{ padding:'20px 22px', maxHeight:'55vh', overflowY:'auto' }}>
                <div id={`sl-${batchBottles[singleIdx].id}`} className="label-grid" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <BottleLabel bottle={batchBottles[singleIdx]} customer={batch.customer}/>
                </div>
              </div>
            )}
            <div style={{ padding:'12px 22px', borderTop:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:10.5, color:'#9ca3af', fontFamily:'monospace' }}>Single bottle · Code 128</div>
              <button onClick={()=>{const el=document.getElementById(`sl-${batchBottles[singleIdx].id}`);if(el)printWindow(el.outerHTML,`VPS Label — ${batchBottles[singleIdx].id}`)}} disabled={!batchBottles[singleIdx]} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#e85d0a', border:'none', borderRadius:9, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', opacity:batchBottles[singleIdx]?1:0.5 }}>
                <Printer size={14} strokeWidth={2.5}/> Print This Label
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
