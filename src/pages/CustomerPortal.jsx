import React, { useState, useMemo } from 'react'
import { Modal } from '../components/UI'
import * as Icons from '../components/Icons'
import { COURIERS, fmtDate, today, uid, bottleStats, BOTTLE_STATUSES } from '../data/mockData'

// ── Bottle status color map ───────────────────────────────────────────────────
const STATUS_COLORS = {
  'Empty':        { bg:'#f3f4f6', color:'#6b7280', border:'#e5e7eb' },
  'Collected':    { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  'Sent to VPS':  { bg:'#fffbeb', color:'#d97706', border:'#fde68a' },
  'In Lab':       { bg:'#f5f3ff', color:'#7c3aed', border:'#ddd6fe' },
  'Tested':       { bg:'#ecfeff', color:'#0891b2', border:'#a5f3fc' },
  'Report Ready': { bg:'#f0fdf4', color:'#059669', border:'#a7f3d0' },
}

// ── Collect Bottles Modal (customer marks empty bottles as collected) ──────────
function CollectModal({ batch, bottles, onClose, onSubmit }) {
  const emptyBottles = bottles.filter(b => b.batchId === batch.id && b.status === 'Empty')
  const [selected, setSelected] = useState([])
  const [locations, setLocations] = useState({})
  const [globalLoc, setGlobalLoc] = useState('')

  function toggle(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x!==id) : [...p, id])
  }
  function setLoc(id, val) { setLocations(p => ({...p, [id]: val})) }
  function applyGlobal() {
    if (!globalLoc.trim()) return
    const newLocs = {}
    selected.forEach(id => { newLocs[id] = globalLoc })
    setLocations(p => ({...p, ...newLocs}))
  }

  const allHaveLocation = selected.length > 0 && selected.every(id => (locations[id] || '').trim())

  function submit() {
    onSubmit(selected, locations)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Mark Bottles as Collected — ${batch.id}`} large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!allHaveLocation}>
            🧪 Mark {selected.length} Bottle{selected.length!==1?'s':''} Collected
          </button>
        </>
      }
    >
      <div className="alert alert-blue" style={{marginBottom:16}}>
        <Icons.Flask/>
        <span style={{fontSize:12.5}}>Select the bottles you have collected samples from and enter the collection location for each.</span>
      </div>

      {emptyBottles.length === 0 && (
        <div style={{textAlign:'center',padding:'32px',color:'var(--text-muted)'}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div>All bottles have been collected!</div>
        </div>
      )}

      {selected.length > 0 && (
        <div style={{padding:'12px 14px',background:'#faf8f5',borderRadius:'var(--r)',border:'1px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-muted)',marginBottom:8}}>Same location for all selected?</div>
          <div style={{display:'flex',gap:8}}>
            <input type="text" value={globalLoc} onChange={e=>setGlobalLoc(e.target.value)} placeholder="e.g. Transformer Bay A, Cooling Side" style={{flex:1,marginBottom:0}} onKeyDown={e=>{if(e.key==='Enter')applyGlobal()}}/>
            <button className="btn btn-ghost btn-sm" onClick={applyGlobal}>Apply to All</button>
          </div>
        </div>
      )}

      <div style={{maxHeight:400,overflowY:'auto',paddingRight:4}}>
        {emptyBottles.map(bottle => {
          const isSel = selected.includes(bottle.id)
          return (
            <div key={bottle.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:'var(--r)',marginBottom:6,border:`1.5px solid ${isSel?'rgba(212,82,12,0.3)':'var(--border)'}`,background:isSel?'rgba(212,82,12,0.04)':'#fff',cursor:'pointer',transition:'all 0.12s'}} onClick={()=>toggle(bottle.id)}>
              <input type="checkbox" checked={isSel} onChange={()=>{}} style={{width:'auto',accentColor:'var(--orange)',marginTop:3,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:isSel?6:0,fontFamily:'var(--font-mono)',color:'var(--orange)'}}>Bottle #{bottle.bottleNum}</div>
                {isSel && (
                  <input type="text" value={locations[bottle.id]||''} onChange={e=>{e.stopPropagation();setLoc(bottle.id,e.target.value)}} onClick={e=>e.stopPropagation()} placeholder="Collection location (required)…" style={{marginBottom:0,fontSize:12.5}}/>
                )}
              </div>
              {isSel && <span style={{color:locations[bottle.id]?.trim()?'var(--green)':'var(--amber)',fontSize:16,marginTop:2}}>{ locations[bottle.id]?.trim()?'✓':'!'}</span>}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

// ── Send to VPS Modal (customer ships collected bottles back) ──────────────────
function SendModal({ batch, bottles, onClose, onSubmit }) {
  const collectedBottles = bottles.filter(b => b.batchId === batch.id && b.status === 'Collected')
  const [selected, setSelected] = useState(collectedBottles.map(b=>b.id))
  const [form, setForm] = useState({ courier:'BlueDart', awb:'', sentDate:today() })
  const up = (k,v) => setForm(p=>({...p,[k]:v}))

  function submit() {
    if (!form.awb.trim() || selected.length===0) return
    onSubmit(selected, form)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Send Bottles to VPS Lab — ${batch.id}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={selected.length===0 || !form.awb.trim()}>
            📦 Send {selected.length} Bottle{selected.length!==1?'s':''} to VPS
          </button>
        </>
      }
    >
      <div className="alert alert-orange mb-4">
        <Icons.Info/>
        <span style={{fontSize:12.5}}>{collectedBottles.length} collected bottle{collectedBottles.length!==1?'s':''} ready to ship. Deselect any you are not sending yet.</span>
      </div>

      <div style={{maxHeight:200,overflowY:'auto',marginBottom:16,border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px'}}>
        {collectedBottles.map(b=>(
          <div key={b.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:'var(--r)',marginBottom:4,background:selected.includes(b.id)?'rgba(212,82,12,0.05)':'#fff',border:`1px solid ${selected.includes(b.id)?'rgba(212,82,12,0.2)':'var(--border)'}`,cursor:'pointer'}} onClick={()=>setSelected(p=>p.includes(b.id)?p.filter(x=>x!==b.id):[...p,b.id])}>
            <input type="checkbox" checked={selected.includes(b.id)} onChange={()=>{}} style={{width:'auto',accentColor:'var(--orange)'}}/>
            <span className="mono" style={{fontSize:12,color:'var(--orange)',fontWeight:600}}>Bottle #{b.bottleNum}</span>
            <span style={{fontSize:11,color:'var(--text-muted)',flex:1}}>{b.location||'—'}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Courier</label>
          <select value={form.courier} onChange={e=>up('courier',e.target.value)}>
            {COURIERS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>AWB / Tracking Number *</label>
          <input type="text" value={form.awb} onChange={e=>up('awb',e.target.value)} placeholder="Courier tracking number"/>
        </div>
        <div className="form-group">
          <label>Sent Date</label>
          <input type="date" value={form.sentDate} onChange={e=>up('sentDate',e.target.value)}/>
        </div>
      </div>
    </Modal>
  )
}

// ── Bottle Grid component ─────────────────────────────────────────────────────
function BottleGrid({ batchId, bottles }) {
  const bb = bottles.filter(b => b.batchId === batchId)
  if (!bb.length) return null

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(90px, 1fr))',gap:6}}>
        {bb.map(b => {
          const sc = STATUS_COLORS[b.status] || STATUS_COLORS['Empty']
          return (
            <div key={b.id} title={`Bottle #${b.bottleNum}: ${b.status}${b.location?` — ${b.location}`:''}`} style={{padding:'8px 6px',borderRadius:'var(--r)',background:sc.bg,border:`1.5px solid ${sc.border}`,textAlign:'center',cursor:'default'}}>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:sc.color,fontWeight:700,marginBottom:3}}>#{b.bottleNum}</div>
              <div style={{fontSize:9,color:sc.color,fontWeight:600,lineHeight:1.2}}>{b.status}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stat chips for a batch ────────────────────────────────────────────────────
function BatchBottleStats({ batchId, bottles }) {
  const s = bottleStats(batchId, bottles)
  const chips = [
    { label:'Empty',        val:s.empty,       color:'var(--text-secondary)', cls:'chip-gray',    show:s.empty>0 },
    { label:'Collected',    val:s.collected,   color:'var(--blue)',           cls:'chip-blue',    show:s.collected>0 },
    { label:'In Transit',   val:s.inTransit,   color:'var(--amber)',          cls:'chip-amber',   show:s.inTransit>0 },
    { label:'In Lab',       val:s.inLab,       color:'var(--purple)',         cls:'chip-purple',  show:s.inLab>0 },
    { label:'Tested',       val:s.tested,      color:'var(--teal)',           cls:'chip-teal',    show:s.tested>0 },
    { label:'Report Ready', val:s.reportReady, color:'var(--green)',          cls:'chip-green',   show:s.reportReady>0 },
  ].filter(c=>c.show)
  return (
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
      {chips.map(c=>(
        <div key={c.label} className={`metric-chip ${c.cls}`}>
          <div className="metric-chip-dot" />
          <span className="metric-chip-val">{c.val}</span>
          <span className="metric-chip-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main CustomerPortal ───────────────────────────────────────────────────────
export default function CustomerPortal({ batches, setBatches, bottles, setBottles, lockedCustomer=null }) {
  const allCustomers = [...new Set(batches.map(b=>b.customer))]
  const [selected, setSelected] = useState(lockedCustomer || allCustomers[0] || '')
  const [collectModal, setCollectModal] = useState(null)
  const [sendModal, setSendModal] = useState(null)
  const [expandedBatch, setExpandedBatch] = useState(null)

  const activeCustomer = lockedCustomer || selected
  const myBatches = batches.filter(b=>b.customer===activeCustomer)

  function acknowledgeReceipt(batchId) {
    setBatches(p=>p.map(b=>b.id===batchId ? {...b, stage:1, receivedDate:today()} : b))
    // Create empty bottles for this batch
    const batch = batches.find(b=>b.id===batchId)
    if (batch) {
      const newBottles = Array.from({length:batch.qty}, (_,i)=>({
        id:`${batchId}-B${String(i+1).padStart(2,'0')}`,
        batchId, bottleNum:i+1, status:'Empty',
        location:'', collectedDate:null, sentDate:null,
        receivedByLabDate:null, testedDate:null,
        reportId:null, technician:null,
        viscosity:null, moisture:null, acidity:null,
        result:null, recommendation:null,
      }))
      setBottles(p=>[...newBottles,...p])
    }
  }

  function handleCollect(bottleIds, locations) {
    setBottles(p=>p.map(b=>bottleIds.includes(b.id) ? {...b, status:'Collected', location:locations[b.id]||b.location, collectedDate:today()} : b))
  }

  function handleSend(bottleIds, form, batchId) {
    setBottles(p=>p.map(b=>bottleIds.includes(b.id) ? {...b, status:'Sent to VPS', sentDate:form.sentDate, courier:form.courier, awb:form.awb} : b))
    // Also update batch-level return shipment details so Lab inbound shows correct courier/AWB
    if (batchId) {
      setBatches(p=>p.map(b=>b.id===batchId ? {...b, returnCourier:form.courier, returnAwb:form.awb, returnSentDate:form.sentDate} : b))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Customer Portal</div>
        <div className="section-sub">{lockedCustomer ? `Your active batches — ${lockedCustomer}` : 'Simulate customer-facing portal'}</div>
      </div>

      {!lockedCustomer && (
        <div className="alert alert-orange mb-5">
          <Icons.Info/>
          <div>Admin view — switch customers below. In production each customer logs in separately.</div>
        </div>
      )}

      {!lockedCustomer && (
        <div className="form-group" style={{maxWidth:340,marginBottom:28}}>
          <label>Viewing as Customer</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            {allCustomers.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {myBatches.length===0 && (
        <div className="card"><div className="empty-state"><Icons.Bottle/><p>No batches for {activeCustomer}</p></div></div>
      )}

      {myBatches.map(b => {
        const s = bottleStats(b.id, bottles)
        const isExpanded = expandedBatch === b.id
        const hasEmpty     = s.empty > 0
        const hasCollected = s.collected > 0

        return (
          <div className="card mb-4" key={b.id}>
            {/* Batch header */}
            <div className="flex justify-between items-start mb-3" style={{flexWrap:'wrap',gap:10}}>
              <div>
                <div className="mono" style={{fontSize:11,color:'var(--orange)',marginBottom:3,fontWeight:600}}>{b.id}</div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:17}}>{b.qty} Sample Bottles</div>
                <div style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{b.sampleType} · {b.courier} · {b.awb}</div>
              </div>

              {b.stage===0 ? (
                <div style={{padding:'8px 14px',borderRadius:'var(--r)',background:'#fef3c7',border:'1.5px solid #fde68a'}}>
                  <div style={{fontSize:10,color:'#78350f',fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,marginBottom:2}}>ACTION REQUIRED</div>
                  <div style={{fontSize:13,fontWeight:700,color:'#b45309'}}>Please acknowledge receipt</div>
                </div>
              ) : (
                <div style={{padding:'8px 14px',borderRadius:'var(--r)',background:'#f0fdf4',border:'1px solid #a7f3d0'}}>
                  <div style={{fontSize:10,color:'#065f46',fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,marginBottom:2}}>BATCH STATUS</div>
                  <div style={{fontSize:13,fontWeight:700,color:'#059669'}}>✓ Received {fmtDate(b.receivedDate)}</div>
                </div>
              )}
            </div>

            {/* Batch-level step (simple 2-step) */}
            {b.stage === 0 && (
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,padding:'12px 16px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'var(--r)'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'var(--amber)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,flexShrink:0}}>1</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>Bottles dispatched by VPS Lab</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{fmtDate(b.dispatched)} · {b.courier} · {b.awb}</div>
                </div>
                <div style={{width:40,height:2,background:'var(--border)'}}/>
                <div style={{width:32,height:32,borderRadius:'50%',background:'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:14,flexShrink:0}}>2</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>Awaiting your confirmation…</div>
              </div>
            )}

            {/* Bottle stats (after received) */}
            {b.stage === 1 && <BatchBottleStats batchId={b.id} bottles={bottles}/>}

            {/* Actions */}
            <div className="flex gap-3" style={{flexWrap:'wrap',marginBottom:b.stage===1&&s.total>0?12:0}}>
              {b.stage===0 && (
                <button className="btn btn-primary" onClick={()=>acknowledgeReceipt(b.id)}>
                  ✓ Acknowledge Receipt of {b.qty} Bottles
                </button>
              )}
              {b.stage===1 && hasEmpty && (
                <button className="btn btn-primary" onClick={()=>setCollectModal(b)}>
                  🧪 Mark Bottles as Collected ({s.empty} empty)
                </button>
              )}
              {b.stage===1 && hasCollected && (
                <button className="btn btn-ghost" style={{borderColor:'var(--amber)',color:'#b45309'}} onClick={()=>setSendModal(b)}>
                  📦 Send to VPS Lab ({s.collected} ready)
                </button>
              )}
              {b.stage===1 && s.reportReady>0 && (
                <span className="badge badge-green" style={{padding:'8px 14px',fontSize:13}}>
                  ✓ {s.reportReady} Report{s.reportReady!==1?'s':''} Ready
                </span>
              )}
            </div>

            {/* Expandable bottle grid */}
            {b.stage===1 && s.total>0 && (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={()=>setExpandedBatch(isExpanded?null:b.id)}
                  style={{marginBottom:isExpanded?12:0}}
                >
                  {isExpanded?'▲ Hide':'▼ Show'} all {s.total} bottles
                </button>
                {isExpanded && <BottleGrid batchId={b.id} bottles={bottles}/>}
              </>
            )}

            {b.issues?.length>0 && (
              <div style={{marginTop:12}}>
                {b.issues.map((iss,i)=>(
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
        <CollectModal batch={collectModal} bottles={bottles} onClose={()=>setCollectModal(null)} onSubmit={handleCollect}/>
      )}
      {sendModal && (
        <SendModal batch={sendModal} bottles={bottles} onClose={()=>setSendModal(null)} onSubmit={(ids,form)=>handleSend(ids,form,sendModal.id)}/>
      )}
    </div>
  )
}