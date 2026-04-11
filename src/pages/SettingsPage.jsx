import React, { useState } from 'react'
import { Toggle } from '../components/UI'
import * as Icons from '../components/Icons'

const COURIERS = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Ecom Express']

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    orgName: 'VPS Veritas', labName: 'VPS Analytics Lab',
    labEmail: 'lab@vpsveritas.com', labPhone: '+91 44 4567 8900',
    labAddress: 'No. 12, Industrial Estate, Chennai - 600 058',
    overdueThreshold: 14, reminderDays: 5, autoReminder: true,
    emailNotifs: true, smsAlerts: false, dashboardNotifs: true,
    courierDefault: 'BlueDart', bottleIdFormat: '[CustCode]-[BatchNum]-[Seq]',
    minSampleVolume: 200,
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">System</div>
          <div className="page-header-title">Settings</div>
          <div className="page-header-sub">Configure organisation details, logistics defaults, and alert rules</div>
        </div>
        <button className="btn btn-primary" onClick={save} style={saved ? { background: 'var(--green)' } : {}}>
          <Icons.Check /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
      <div className="grid-2" style={{ gap: 18, alignItems: 'start' }}>
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Organisation</span></div>
            {[['orgName','Organisation Name','text'],['labName','Lab Name','text'],['labEmail','Lab Email','email'],['labPhone','Lab Phone','text']].map(([k,l,t]) => (
              <div className="form-group" key={k}><label>{l}</label><input type={t} value={form[k]} onChange={e => f(k, e.target.value)} /></div>
            ))}
            <div className="form-group"><label>Lab Address</label><textarea value={form.labAddress} onChange={e => f('labAddress', e.target.value)} style={{ minHeight: 60 }} /></div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Logistics Defaults</span></div>
            <div className="form-group"><label>Default Courier</label>
              <select value={form.courierDefault} onChange={e => f('courierDefault', e.target.value)}>
                {COURIERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Minimum Sample Volume (ml)</label><input type="number" min={50} max={1000} value={form.minSampleVolume} onChange={e => f('minSampleVolume', +e.target.value)} /></div>
            <div className="form-group"><label>Bottle ID Format</label><input type="text" value={form.bottleIdFormat} onChange={e => f('bottleIdFormat', e.target.value)} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>Tokens: [CustCode] [BatchNum] [Seq] [Year]</div>
            </div>
          </div>
        </div>
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Alert Rules</span></div>
            <div className="setting-row">
              <div><div style={{ fontWeight: 600, fontSize: 12.5 }}>Overdue Threshold (days)</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Flag batch as overdue after this many days</div></div>
              <input type="number" min={1} max={90} value={form.overdueThreshold} onChange={e => f('overdueThreshold', +e.target.value)} style={{ width: 70, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', fontSize: 13, textAlign: 'center' }} />
            </div>
            <div className="setting-row">
              <div><div style={{ fontWeight: 600, fontSize: 12.5 }}>Auto Reminders</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Automatically send reminders to customers</div></div>
              <Toggle value={form.autoReminder} onChange={v => f('autoReminder', v)} />
            </div>
            {form.autoReminder && (
              <div className="setting-row">
                <div><div style={{ fontWeight: 600, fontSize: 12.5 }}>Reminder Days Before</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Send reminder this many days before overdue</div></div>
                <input type="number" min={1} max={30} value={form.reminderDays} onChange={e => f('reminderDays', +e.target.value)} style={{ width: 70, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', fontSize: 13, textAlign: 'center' }} />
              </div>
            )}
          </div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Notification Channels</span></div>
            <div className="setting-row"><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>Email Notifications</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Send alerts and reports via email</div></div><Toggle value={form.emailNotifs} onChange={v => f('emailNotifs', v)} /></div>
            <div className="setting-row"><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>SMS Alerts</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Critical alerts via SMS</div></div><Toggle value={form.smsAlerts} onChange={v => f('smsAlerts', v)} /></div>
            <div className="setting-row"><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>Dashboard Notifications</div><div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Show in-app notification badges</div></div><Toggle value={form.dashboardNotifs} onChange={v => f('dashboardNotifs', v)} /></div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">System Info</span></div>
            <div className="info-row"><span style={{ fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Version</span><span className="mono" style={{ fontWeight: 700 }}>v2.1.0</span></div>
            <div className="info-row"><span style={{ fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Database</span><span className="badge badge-green">Online</span></div>
            <div className="info-row"><span style={{ fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Last Backup</span><span className="mono" style={{ fontSize: 11 }}>Today · 03:00 IST</span></div>
            <div className="info-row"><span style={{ fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px' }}>API Status</span><span className="badge badge-green">Healthy</span></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm">🔒 Change Password</button>
              <button className="btn btn-ghost btn-sm">📤 Export Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
