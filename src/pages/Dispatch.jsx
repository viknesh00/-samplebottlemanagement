import React, { useState } from 'react'
import { StageBadge, EmptyState, Modal, useSortPage, SortTh, Pagination } from '../components/UI'
import * as Icons from '../components/Icons'

const PAGE_SIZE = 15

// ── Inbound Receipt Modal ─────────────────────────────────────────────────────
function ReceiptModal({ batch, onClose, onConfirm }) {
  const [qtyReceived, setQtyReceived]       = useState(batch.qty)
  const [actualLocation, setActualLocation] = useState('')
  const [issues, setIssues]                 = useState([])
  const [note, setNote]                     = useState('')
  const expectedLocation = batch.location || ''

  function toggleIssue(issue) {
    setIssues(p => p.includes(issue) ? p.filter(i => i !== issue) : [...p, issue])
  }

  function handleConfirm() {
    const allIssues = [...issues]
    if (qtyReceived < batch.qty) {
      const msg = `Insufficient quantity: expected ${batch.qty} bottles, received ${qtyReceived}`
      if (!allIssues.includes(msg)) allIssues.push(msg)
    }
    if (actualLocation.trim() && actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase()) {
      const msg = `Wrong location: expected "${expectedLocation}", samples collected from "${actualLocation.trim()}"`
      if (!allIssues.find(i => i.startsWith('Wrong location'))) allIssues.push(msg)
    }
    if (note.trim()) allIssues.push(`Note: ${note.trim()}`)
    onConfirm(batch.id, allIssues)
    onClose()
  }

  const hasIssue = qtyReceived < batch.qty ||
    (actualLocation.trim() && actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase()) ||
    issues.length > 0

  return (
    <Modal open onClose={onClose} title={`Receive Inbound Samples — ${batch.id}`}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleConfirm}>
          Confirm Receipt {hasIssue ? '& Flag Issues' : ''}
        </button>
      </>}>
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'12px 14px', marginBottom:20 }}>
        <div style={{ fontWeight:600, marginBottom:4 }}>{batch.customer}</div>
        <div style={{ fontSize:12.5, color:'var(--text-muted)', display:'flex', gap:16 }}>
          <span>Sent: <strong style={{ color:'var(--text-secondary)' }}>{batch.qty} bottles</strong></span>
          <span>Expected location: <strong style={{ color:'var(--text-secondary)' }}>{expectedLocation || 'Not specified'}</strong></span>
        </div>
      </div>

      <div style={{ border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--border)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>1</span>
          Quantity Verification
        </div>
        <div className="grid-2" style={{ gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Bottles Sent</label>
            <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'8px 12px', fontSize:13.5, color:'var(--text-secondary)' }}>{batch.qty}</div>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>
              Bottles Actually Received <span style={{ color:'var(--red)' }}>*</span>
            </label>
            <input type="number" min={0} max={batch.qty + 10} value={qtyReceived}
              onChange={e => setQtyReceived(+e.target.value)}
              style={{ width:'100%', background: qtyReceived < batch.qty ? 'rgba(239,68,68,0.06)' : 'var(--surface)',
                border:`1px solid ${qtyReceived < batch.qty ? 'var(--red)' : 'var(--border)'}`,
                borderRadius:'var(--radius)', padding:'8px 12px', fontSize:13.5, color:'var(--text-primary)', outline:'none' }} />
          </div>
        </div>
        {qtyReceived < batch.qty && (
          <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, fontSize:12.5, color:'var(--red)', display:'flex', gap:6, alignItems:'center' }}>
            <Icons.Warn />
            <span><strong>Insufficient quantity</strong> — {batch.qty - qtyReceived} bottle{batch.qty - qtyReceived > 1 ? 's' : ''} missing. This will be auto-flagged.</span>
          </div>
        )}
      </div>

      <div style={{ border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--border)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>2</span>
          Collection Location Verification
        </div>
        <div className="form-group" style={{ marginBottom:8 }}>
          <label style={{ fontSize:12, color:'var(--text-muted)' }}>Actual location written on bottle label / accompanying form</label>
          <input type="text" value={actualLocation} onChange={e => setActualLocation(e.target.value)}
            placeholder={`Expected: ${expectedLocation || 'not specified'}`}
            style={{ width:'100%', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'8px 12px', fontSize:13.5, color:'var(--text-primary)', outline:'none', marginTop:4 }} />
        </div>
        {actualLocation.trim() && actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase() && (
          <div style={{ padding:'8px 12px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, fontSize:12.5, color:'var(--red)', display:'flex', gap:6, alignItems:'center' }}>
            <Icons.Warn />
            <span><strong>Location mismatch</strong> — sample collected from a different location than instructed. This will be auto-flagged.</span>
          </div>
        )}
      </div>

      <div style={{ border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--border)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>3</span>
          Additional Issues (optional)
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {['Bottles damaged or leaking','Samples appear contaminated','Labels missing or unreadable','Samples collected from wrong equipment type','Container seals broken'].map(issue => (
            <label key={issue} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 10px', borderRadius:8,
              background: issues.includes(issue) ? 'rgba(239,68,68,0.06)' : 'transparent',
              border:`1px solid ${issues.includes(issue) ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`, transition:'all .15s' }}>
              <input type="checkbox" checked={issues.includes(issue)} onChange={() => toggleIssue(issue)} style={{ width:'auto', accentColor:'var(--red)' }} />
              <span style={{ fontSize:13, color: issues.includes(issue) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{issue}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label style={{ fontSize:12, color:'var(--text-muted)' }}>Additional note (optional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any other observations on receipt…"
          style={{ width:'100%', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'var(--radius)', padding:'8px 12px', fontSize:13.5, color:'var(--text-primary)', outline:'none', resize:'vertical', minHeight:60, marginTop:4 }} />
      </div>

      {hasIssue && (
        <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, fontSize:12.5, color:'var(--red)' }}>
          <div style={{ fontWeight:600, marginBottom:6 }}>⚑ Issues that will be flagged on this batch:</div>
          <ul style={{ paddingLeft:16, lineHeight:1.8 }}>
            {qtyReceived < batch.qty && <li>Insufficient quantity ({qtyReceived}/{batch.qty} bottles received)</li>}
            {actualLocation.trim() && actualLocation.trim().toLowerCase() !== expectedLocation.trim().toLowerCase() && <li>Wrong collection location</li>}
            {issues.map(i => <li key={i}>{i}</li>)}
            {note.trim() && <li>Note added</li>}
          </ul>
        </div>
      )}
    </Modal>
  )
}

// ── Main Dispatch Page ────────────────────────────────────────────────────────
export default function Dispatch({ batches, setBatches }) {
  const [tab, setTab]           = useState('outbound')
  const [receiving, setReceiving] = useState(null)

  const outbound = batches.filter(b => b.stage <= 1)
  const inbound  = batches.filter(b => b.stage >= 4 && b.stage <= 5)

  // Sort + paginate outbound
  const { paged: outPaged, sortKey: outSK, sortDir: outSD, toggleSort: outTS, page: outPage, setPage: setOutPage, totalPages: outTP } =
    useSortPage(outbound, { key: 'id', dir: 'asc' }, PAGE_SIZE)

  // Sort + paginate inbound
  const { paged: inPaged, sortKey: inSK, sortDir: inSD, toggleSort: inTS, page: inPage, setPage: setInPage, totalPages: inTP } =
    useSortPage(inbound, { key: 'id', dir: 'asc' }, PAGE_SIZE)

  function mark(id, stage) {
    setBatches(p => p.map(b => b.id === id ? { ...b, stage } : b))
  }

  function confirmReceipt(id, newIssues) {
    setBatches(p => p.map(b => {
      if (b.id !== id) return b
      return { ...b, stage: 6, issues: [...(b.issues || []), ...newIssues] }
    }))
  }

  const OutTH = ({ label, sk }) => <SortTh label={label} sortKey={sk} active={outSK===sk} dir={outSD} onSort={outTS} />
  const InTH  = ({ label, sk }) => <SortTh label={label} sortKey={sk} active={inSK===sk}  dir={inSD}  onSort={inTS}  />

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Dispatch &amp; Logistics</div>
        <div className="section-sub">Manage courier movements — outbound empty bottles &amp; inbound sample returns</div>
      </div>

      <div className="tab-bar">
        {['outbound', 'inbound'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'inbound' && inbound.length > 0 && <span className="nav-badge" style={{ marginLeft:8 }}>{inbound.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'outbound' && (
        <>
          <div className="alert alert-teal mb-4">
            <div style={{ width:16, height:16, flexShrink:0 }}><Icons.Truck /></div>
            <div><strong>Outbound:</strong> Empty bottles being sent from VPS Lab to customers. Mark as dispatched after courier pickup.</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <OutTH label="Batch"    sk="id" />
                  <OutTH label="Customer" sk="customer" />
                  <OutTH label="Qty"      sk="qty" />
                  <OutTH label="Courier"  sk="courier" />
                  <OutTH label="AWB"      sk="awb" />
                  <th>Stage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {outPaged.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily:'monospace', fontSize:12.5, color:'var(--orange)' }}>{b.id}</td>
                    <td style={{ fontWeight:500 }}>{b.customer}</td>
                    <td>{b.qty}</td>
                    <td>{b.courier}</td>
                    <td style={{ fontFamily:'monospace', fontSize:12.5 }}>{b.awb || '—'}</td>
                    <td><StageBadge stage={b.stage} /></td>
                    <td>
                      {b.stage === 0 && <button className="btn btn-primary btn-sm" onClick={() => mark(b.id, 1)}>Mark Dispatched</button>}
                      {b.stage === 1 && <span className="badge badge-gray">Awaiting receipt</span>}
                    </td>
                  </tr>
                ))}
                {!outPaged.length && <tr><td colSpan={7}><EmptyState icon={Icons.Truck} message="No outbound dispatches pending" /></td></tr>}
              </tbody>
            </table>
            <Pagination page={outPage} totalPages={outTP} onPage={setOutPage} total={outbound.length} pageSize={outPageSize} onPageSizeChange={setOutPageSize} />
          </div>
        </>
      )}

      {tab === 'inbound' && (
        <>
          <div className="alert alert-amber mb-4">
            <div style={{ width:16, height:16, flexShrink:0 }}><Icons.Warn /></div>
            <div><strong>Inbound:</strong> Click <strong>"Receive &amp; Inspect"</strong> to log the physical receipt. You will be prompted to verify bottle count and collection location — any discrepancy is automatically flagged.</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <InTH label="Batch"             sk="id" />
                  <InTH label="Customer"          sk="customer" />
                  <InTH label="Qty Sent"          sk="qty" />
                  <th>Expected Location</th>
                  <th>Existing Issues</th>
                  <th>Stage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inPaged.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily:'monospace', fontSize:12.5, color:'var(--orange)' }}>{b.id}</td>
                    <td style={{ fontWeight:500 }}>{b.customer}</td>
                    <td>{b.qty}</td>
                    <td style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12.5, color:'var(--text-muted)' }}>
                      {b.location || <span style={{ color:'var(--red)', fontStyle:'italic' }}>Not specified</span>}
                    </td>
                    <td>
                      {b.issues.length > 0
                        ? <span className="badge badge-red">{b.issues.length} issue{b.issues.length > 1 ? 's' : ''}</span>
                        : <span className="badge badge-gray">None</span>}
                    </td>
                    <td><StageBadge stage={b.stage} /></td>
                    <td>
                      {b.stage === 5 && <button className="btn btn-primary btn-sm" onClick={() => setReceiving(b)}>Receive &amp; Inspect</button>}
                      {b.stage === 4 && <span className="badge badge-gray">In transit</span>}
                    </td>
                  </tr>
                ))}
                {!inPaged.length && <tr><td colSpan={7}><EmptyState icon={Icons.Bottle} message="No inbound returns currently" /></td></tr>}
              </tbody>
            </table>
            <Pagination page={inPage} totalPages={inTP} onPage={setInPage} total={inbound.length} pageSize={inPageSize} onPageSizeChange={setInPageSize} />
          </div>
        </>
      )}

      {receiving && (
        <ReceiptModal batch={receiving} onClose={() => setReceiving(null)} onConfirm={confirmReceipt} />
      )}
    </div>
  )
}
