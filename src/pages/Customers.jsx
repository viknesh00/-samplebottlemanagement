import React, { useState } from 'react'
import { Modal } from '../components/UI'
import * as Icons from '../components/Icons'

function CustomerCard({ customer, batches }) {
  const cBatches  = batches.filter(b => b.customer === customer.name)
  const active    = cBatches.filter(b => b.stage < 8).length
  const issueCount = cBatches.filter(b => b.issues.length > 0).length

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
          {customer.name.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{customer.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {customer.contact} · {customer.city}
          </div>
        </div>
        {issueCount > 0 && (
          <span className="badge badge-red">{issueCount} issue{issueCount > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid-3 mb-4">
        {[
          ['Active',    active,                   'gray'],
          ['Total',     cBatches.length,           'gray'],
          ['Pending ⬡', customer.pendingBottles,   'gray'],
        ].map(([l, v, col]) => (
          <div key={l} style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>✉ {customer.email}</span>
        <span>✆ {customer.phone}</span>
      </div>
      {customer.vat && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          VAT: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{customer.vat}</span>
        </div>
      )}
    </div>
  )
}

const EMPTY_FORM = { name: '', contact: '', email: '', phone: '', city: '', vat: '' }

export default function Customers({ customers, setCustomers, batches }) {
  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState(EMPTY_FORM)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function save() {
    setCustomers(p => [
      ...p,
      { ...form, id: `C${String(p.length + 1).padStart(3, '0')}`, pendingBottles: 0 },
    ])
    setModal(false)
    setForm(EMPTY_FORM)
  }

  const FIELDS = [
    ['name',    'Company Name',   'text'],
    ['contact', 'Contact Person', 'text'],
    ['email',   'Email',          'email'],
    ['phone',   'Phone',          'text'],
    ['city',    'City',           'text'],
    ['vat',   'VAT',          'text'],
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="section-title">Customers</div>
          <div className="section-sub">Manage customer accounts and oil sampling history</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Icons.Plus /> Add Customer
        </button>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        {customers.map(c => (
          <CustomerCard key={c.id} customer={c} batches={batches} />
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add New Customer"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Customer</button>
          </>
        }
      >
        <div className="grid-2">
          {FIELDS.map(([k, l, t]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input type={t} value={form[k]} onChange={e => f(k, e.target.value)} placeholder={l} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
