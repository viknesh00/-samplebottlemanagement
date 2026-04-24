import React, { useState } from 'react'
import { Modal, SearchBar, useSortPage, SortTh, Pagination } from '../components/UI'
import { uid, uidAsset, SAMPLE_TYPES } from '../utils/constants'
import * as Icons from '../components/Icons'
import {
  Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight,
  Building2, Layers, Key, User, Mail, Phone, MapPin,
} from 'lucide-react'

const PAGE_SIZE = 15

// ── Individual Asset Row ──────────────────────────────────────────────────────
function AssetRow({ asset, onRemove, onChange }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 110px 160px 28px',
      gap: 8, alignItems: 'center',
      padding: '9px 12px',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
    }}>
      <div className="form-group" style={{ margin: 0 }}>
        <input
          type="text"
          value={asset.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Asset / Equipment name"
          style={{ fontSize: 12.5, padding: '5px 9px' }}
        />
      </div>
      <div className="form-group" style={{ margin: 0 }}>
        <input
          type="text"
          value={asset.serialNumber}
          onChange={e => onChange('serialNumber', e.target.value)}
          placeholder="Serial Number"
          style={{ fontSize: 12, padding: '5px 9px', fontFamily: 'var(--font-mono)' }}
        />
      </div>
      <div className="form-group" style={{ margin: 0 }}>
        <select
          value={asset.sampleType}
          onChange={e => onChange('sampleType', e.target.value)}
          style={{ fontSize: 12, padding: '5px 9px' }}
        >
          {SAMPLE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <button
        onClick={onRemove}
        style={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(212,42,42,0.06)', border: '1px solid rgba(212,42,42,0.2)',
          borderRadius: 'var(--r-xs)', cursor: 'pointer', color: 'var(--red)', flexShrink: 0,
        }}
      >
        <Trash2 size={13} strokeWidth={2} />
      </button>
    </div>
  )
}

// ── Customer Form (create/edit) ───────────────────────────────────────────────
function CustomerForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || {
    name: '', contact: '', email: '', phone: '', city: '', password: '', assets: [],
  })
  const [showPwd, setShowPwd] = useState(false)
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function addAsset() {
    setForm(p => ({
      ...p,
      assets: [...p.assets, {
        id: uidAsset(), name: '', serialNumber: '', sampleType: 'Transformer Oil', location: '',
      }],
    }))
  }

  function removeAsset(idx) {
    setForm(p => ({ ...p, assets: p.assets.filter((_, i) => i !== idx) }))
  }

  function updateAsset(idx, field, value) {
    setForm(p => ({
      ...p,
      assets: p.assets.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }))
  }

  function save() {
    if (!form.name.trim()) return
    onSave({ id: initial?.id || uid('C'), ...form })
    onClose()
  }

  const labelStyle = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5,
  }

  return (
    <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: 2 }}>
      {/* Section: Company info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 12px', background: 'rgba(232,93,10,0.05)', borderRadius: 'var(--r)',
        border: '1px solid rgba(232,93,10,0.15)',
      }}>
        <Building2 size={14} color="var(--accent)" strokeWidth={2} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Company Details
        </span>
      </div>

      <div className="grid-2">
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}><Building2 size={11} /> Company Name *</label>
          <input type="text" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Full company / organisation name" />
        </div>
        <div className="form-group">
          <label style={labelStyle}><User size={11} /> Contact Person</label>
          <input type="text" value={form.contact} onChange={e => up('contact', e.target.value)} placeholder="Primary contact name" />
        </div>
        <div className="form-group">
          <label style={labelStyle}><MapPin size={11} /> City</label>
          <input type="text" value={form.city} onChange={e => up('city', e.target.value)} placeholder="City" />
        </div>
        <div className="form-group">
          <label style={labelStyle}><Mail size={11} /> Email</label>
          <input type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="email@company.com" />
        </div>
        <div className="form-group">
          <label style={labelStyle}><Phone size={11} /> Phone</label>
          <input type="text" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+44 7700 000000" />
        </div>
      </div>

      {/* Section: Portal password */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4,
        padding: '8px 12px', background: 'rgba(31,94,196,0.05)', borderRadius: 'var(--r)',
        border: '1px solid rgba(31,94,196,0.15)',
      }}>
        <Key size={14} color="var(--blue)" strokeWidth={2} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Customer Portal Access
        </span>
      </div>

      <div className="form-group">
        <label style={labelStyle}><Key size={11} /> Portal Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => up('password', e.target.value)}
            placeholder="Set login password for customer portal"
            style={{ paddingRight: 38 }}
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2,
              display: 'flex', alignItems: 'center',
            }}
          >
            {showPwd ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          Customer uses their company email + this password to log into the VPS portal.
        </div>
      </div>

      {/* Section: Assets */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4,
        padding: '8px 12px', background: 'rgba(103,48,194,0.05)', borderRadius: 'var(--r)',
        border: '1px solid rgba(103,48,194,0.15)',
      }}>
        <Layers size={14} color="var(--purple)" strokeWidth={2} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Assets / Equipment
        </span>
        <span style={{
          marginLeft: 4, fontSize: 9.5, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
          background: 'rgba(103,48,194,0.1)', color: 'var(--purple)',
        }}>{form.assets.length}</span>
      </div>

      {form.assets.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 160px 28px',
            gap: 8, padding: '4px 12px', marginBottom: 4,
          }}>
            {['Asset Name', 'Serial No.', 'Sample Type', ''].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {form.assets.map((asset, idx) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onRemove={() => removeAsset(idx)}
                onChange={(field, value) => updateAsset(idx, field, value)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={addAsset}
        style={{
          width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, background: 'var(--bg)', border: '1.5px dashed var(--border-dark)',
          borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          color: 'var(--text-muted)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <Plus size={13} strokeWidth={2.5} /> Add Asset / Equipment
      </button>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>
          <Plus size={14} strokeWidth={2.5} /> {initial ? 'Save Changes' : 'Create Customer'}
        </button>
      </div>
    </div>
  )
}

// ── Asset Detail Panel (expandable) ──────────────────────────────────────────
function CustomerRow({ c, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = { 'Transformer Oil':'var(--amber)', 'Turbine Oil':'var(--blue)', 'Gear Oil':'var(--purple)', 'Lubricant Oil':'var(--teal)', 'Hydraulic Oil':'var(--red)', 'Coolant':'var(--green)' }

  return (
    <>
      <tr
        onClick={() => setExpanded(p => !p)}
        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <td style={{ padding: '11px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {expanded ? <ChevronDown size={12} color="var(--text-muted)" /> : <ChevronRight size={12} color="var(--text-muted)" />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{c.name}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{c.id}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '11px 14px' }}>
          <div style={{ fontSize: 12 }}>{c.contact || '—'}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{c.email || ''}</div>
        </td>
        <td style={{ padding: '11px 14px', fontSize: 12 }}>{c.city || '—'}</td>
        <td style={{ padding: '11px 14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: 'rgba(103,48,194,0.08)', color: 'var(--purple)',
            border: '1px solid rgba(103,48,194,0.18)',
          }}>
            <Layers size={10} strokeWidth={2.5} /> {c.assets?.length || 0}
          </span>
        </td>
        <td style={{ padding: '11px 14px' }}><span style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{c._batches}</span></td>
        <td style={{ padding: '11px 14px' }}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', color: '#6b7280' }}>{c._empty}</span></td>
        <td style={{ padding: '11px 14px' }}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{c._inTransit}</span></td>
        <td style={{ padding: '11px 14px' }}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>{c._inLab}</span></td>
        <td style={{ padding: '11px 14px' }}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{c._repReady}</span></td>
        <td style={{ padding: '11px 14px' }}>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            title="Edit Customer"
            onClick={e => { e.stopPropagation(); onEdit(c) }}
          >
            <Icons.Eye />
          </button>
        </td>
      </tr>
      {expanded && c.assets && c.assets.length > 0 && (
        <tr style={{ background: 'var(--bg)' }}>
          <td colSpan={10} style={{ padding: '0 14px 14px 40px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--purple)', marginBottom: 8, marginTop: 6 }}>
              Assets / Equipment ({c.assets.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {c.assets.map(a => (
                <div key={a.id} style={{
                  padding: '8px 12px', borderRadius: 'var(--r)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  minWidth: 200, flex: '1 1 200px', maxWidth: 280,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)', letterSpacing: '0.5px',
                    }}>{a.serialNumber}</span>
                    <span style={{
                      fontSize: 8.5, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                      color: statusColor[a.sampleType] || 'var(--text-muted)',
                      background: `${statusColor[a.sampleType] || 'var(--text-muted)'}15`,
                      border: `1px solid ${statusColor[a.sampleType] || 'var(--border)'}30`,
                    }}>{a.sampleType}</span>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{a.name}</div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
      {expanded && (!c.assets || c.assets.length === 0) && (
        <tr style={{ background: 'var(--bg)' }}>
          <td colSpan={10} style={{ padding: '10px 14px 14px 40px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No assets registered for this customer.</div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Customers Page ───────────────────────────────────────────────────────
export default function Customers({ customers, setCustomers, batches, bottles }) {
  const [search, setSearch]       = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [pageSize, setPageSize]   = useState(15)

  const enriched = customers
    .filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase())
    )
    .map(c => {
      const cBatches = batches.filter(b => b.customer === c.name)
      const cBottles = bottles.filter(b => cBatches.some(bt => bt.id === b.batchId))
      return {
        ...c,
        _batches:   cBatches.length,
        _empty:     cBottles.filter(b => b.status === 'Empty').length,
        _inTransit: cBottles.filter(b => b.status === 'Sent to VPS').length,
        _inLab:     cBottles.filter(b => b.status === 'In Lab').length,
        _repReady:  cBottles.filter(b => b.status === 'Report Ready').length,
      }
    })

  const { paged, sortKey, sortDir, toggleSort, page, setPage, totalPages } =
    useSortPage(enriched, { key: 'name', dir: 'asc' }, pageSize)

  const TH = ({ label, sk }) => (
    <SortTh label={label} sortKey={sk} active={sortKey === sk} dir={sortDir} onSort={toggleSort} />
  )

  function handleSave(c) {
    setCustomers(p => {
      const exists = p.some(x => x.id === c.id)
      return exists ? p.map(x => x.id === c.id ? c : x) : [...p, c]
    })
  }

  const totalAssets = customers.reduce((acc, c) => acc + (c.assets?.length || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">Management</div>
          <div className="page-header-title">Customers</div>
          <div className="page-header-sub">Customer accounts, assets, contacts, and bottle activity</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icons.Plus /> Add Customer
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { value: customers.length, label: 'Customers', color: 'var(--accent)', bg: 'rgba(232,93,10,0.06)', border: 'rgba(232,93,10,0.2)' },
          { value: totalAssets,      label: 'Total Assets', color: 'var(--purple)', bg: 'rgba(103,48,194,0.06)', border: 'rgba(103,48,194,0.2)' },
          { value: batches.length,   label: 'Total Batches', color: 'var(--blue)', bg: 'rgba(31,94,196,0.06)', border: 'rgba(31,94,196,0.2)' },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 16px', background: s.bg,
            border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.color}`,
            borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-xs)',
          }}>
            <span style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search customer name, contact, city…" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <TH label="Customer"   sk="name" />
              <TH label="Contact"    sk="contact" />
              <TH label="City"       sk="city" />
              <TH label="Assets"     sk="assets.length" />
              <TH label="Batches"    sk="_batches" />
              <TH label="Empty"      sk="_empty" />
              <TH label="In Transit" sk="_inTransit" />
              <TH label="In Lab"     sk="_inLab" />
              <TH label="Rpt Ready"  sk="_repReady" />
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(c => (
              <CustomerRow key={c.id} c={c} onEdit={setEditTarget} />
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} total={enriched.length} pageSize={pageSize} onPageSizeChange={setPageSize} />
      </div>

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Add Customer" large>
          <CustomerForm onSave={handleSave} onClose={() => setShowCreate(false)} />
        </Modal>
      )}
      {editTarget && (
        <Modal open onClose={() => setEditTarget(null)} title={`Edit — ${editTarget.name.split(' ').slice(0,2).join(' ')}`} large>
          <CustomerForm onSave={handleSave} onClose={() => setEditTarget(null)} initial={editTarget} />
        </Modal>
      )}
    </div>
  )
}
