import React, { useState } from 'react'
import { Modal, SearchBar } from '../components/UI'
import { uid } from '../data/mockData'
import * as Icons from '../components/Icons'

function CustomerForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name:'', contact:'', email:'', phone:'', city:'' })
  const up = (k,v) => setForm(p=>({...p,[k]:v}))
  function save() {
    if(!form.name.trim()) return
    onSave({ id:uid('C'), ...form })
    onClose()
  }
  return (
    <>
      <div className="grid-2">
        <div className="form-group"><label>Company Name *</label><input type="text" value={form.name} onChange={e=>up('name',e.target.value)} placeholder="Company name"/></div>
        <div className="form-group"><label>Contact Person</label><input type="text" value={form.contact} onChange={e=>up('contact',e.target.value)} placeholder="Full name"/></div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>up('email',e.target.value)} placeholder="email@company.com"/></div>
        <div className="form-group"><label>Phone</label><input type="text" value={form.phone} onChange={e=>up('phone',e.target.value)} placeholder="+91 99000 00000"/></div>
        <div className="form-group"><label>City</label><input type="text" value={form.city} onChange={e=>up('city',e.target.value)} placeholder="City"/></div>
      </div>
      <div className="flex gap-3 justify-between mt-4">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}><Icons.Plus/> Add Customer</button>
      </div>
    </>
  )
}

export default function Customers({ customers, setCustomers, batches, bottles }) {
  const [search, setSearch]         = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = customers.filter(c=>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.city||'').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">Management</div>
        <div className="page-header-title">Customers</div>
          <div className="page-header-sub">Customer accounts, contacts, and bottle activity</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Icons.Plus/> Add Customer</button>
      </div>

      {/* Summary */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 12px',background:'var(--surface)',border:'var(--rule)',borderRadius:'var(--r-xs)'}}>
          <span style={{fontWeight:800,fontSize:15,fontFamily:'var(--font-display)',color:'var(--accent)'}}>{customers.length}</span>
          <span style={{fontSize:10.5,color:'var(--text-muted)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Total Customers</span>
        </div>
      </div>

      <div style={{marginBottom:14}}><SearchBar value={search} onChange={setSearch} placeholder="Search customers…"/></div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>City</th>
              <th>Batches</th>
              <th>Empty</th>
              <th>In Transit</th>
              <th>In Lab</th>
              <th>Rpt Ready</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const cBatches  = batches.filter(b=>b.customer===c.name)
              const cBottles  = bottles.filter(b=>cBatches.some(bt=>bt.id===b.batchId))
              const empty     = cBottles.filter(b=>b.status==='Empty').length
              const inTransit = cBottles.filter(b=>b.status==='Sent to VPS').length
              const inLab     = cBottles.filter(b=>b.status==='In Lab').length
              const repReady  = cBottles.filter(b=>b.status==='Report Ready').length
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{fontWeight:600,fontSize:12.5}}>{c.name}</div>
                    <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{c.id}</div>
                  </td>
                  <td>
                    <div style={{fontSize:12}}>{c.contact||'—'}</div>
                    <div style={{fontSize:10.5,color:'var(--text-muted)'}}>{c.email||''}</div>
                  </td>
                  <td style={{fontSize:12}}>{c.city||'—'}</td>
                  <td><span style={{fontWeight:800,fontSize:14,fontFamily:'var(--font-display)',color:'var(--accent)'}}>{cBatches.length}</span></td>
                  <td><span style={{fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)',color:'#6b7280'}}>{empty}</span></td>
                  <td><span style={{fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)',color:'var(--amber)'}}>{inTransit}</span></td>
                  <td><span style={{fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)',color:'var(--purple)'}}>{inLab}</span></td>
                  <td><span style={{fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)',color:'var(--green)'}}>{repReady}</span></td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{textAlign:'center',padding:'32px',color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:12}}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal open onClose={()=>setShowCreate(false)} title="Add Customer">
          <CustomerForm onSave={c=>setCustomers(p=>[...p,c])} onClose={()=>setShowCreate(false)}/>
        </Modal>
      )}
    </div>
  )
}
