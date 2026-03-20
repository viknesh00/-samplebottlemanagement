import React, { useState } from 'react'
import * as Icons from '../components/Icons'

const COURIERS = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Ecom Express']

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    orgName:           'VPS India Pvt Ltd',
    labName:           'VPS Analytics Lab',
    labEmail:          'lab@vps.in',
    labPhone:          '+91 44 4567 8900',
    labAddress:        'No. 12, Industrial Estate, Chennai - 600 058',
    overdueThreshold:  14,
    reminderDays:      5,
    autoReminder:      true,
    courierDefault:    'BlueDart',
    bottleIdFormat:    '[CustCode]-[BatchNum]-[Seq]',
    minSampleVolume:   200,
  })

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="section-title">Settings</div>
        <div className="section-sub">Configure organisation details, logistics defaults, and alert rules</div>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>

        {/* ── Left column ── */}
        <div>
          {/* Organisation */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Organisation</span></div>
            {[
              ['orgName',    'Organisation Name', 'text'],
              ['labName',    'Lab Name',          'text'],
              ['labEmail',   'Lab Email',         'email'],
              ['labPhone',   'Lab Phone',         'text'],
            ].map(([k, l, t]) => (
              <div className="form-group" key={k}>
                <label>{l}</label>
                <input type={t} value={form[k]} onChange={e => f(k, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label>Lab Address</label>
              <textarea
                value={form.labAddress}
                onChange={e => f('labAddress', e.target.value)}
                style={{ minHeight: 60 }}
              />
            </div>
          </div>

          {/* Logistics */}
          <div className="card">
            <div className="card-header"><span className="card-title">Logistics Defaults</span></div>
            <div className="form-group">
              <label>Default Courier</label>
              <select value={form.courierDefault} onChange={e => f('courierDefault', e.target.value)}>
                {COURIERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Minimum Sample Volume (ml)</label>
              <input
                type="number" min={50} max={1000}
                value={form.minSampleVolume}
                onChange={e => f('minSampleVolume', +e.target.value)}
              />
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Samples below this volume will trigger an "Insufficient Quantity" alert.
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          {/* Alerts & Reminders */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Alerts &amp; Reminders</span></div>

            <div className="form-group">
              <label>Overdue Threshold (days)</label>
              <input
                type="number" min={1} max={60}
                value={form.overdueThreshold}
                onChange={e => f('overdueThreshold', +e.target.value)}
              />
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Batches older than this will appear in Alerts as overdue.
              </div>
            </div>

            <div className="form-group">
              <label>Auto-reminder after (days of inactivity)</label>
              <input
                type="number" min={1} max={30}
                value={form.reminderDays}
                onChange={e => f('reminderDays', +e.target.value)}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox" id="ar"
                checked={form.autoReminder}
                onChange={e => f('autoReminder', e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="ar" style={{ marginBottom: 0 }}>
                Enable automatic email reminders to customers
              </label>
            </div>
          </div>

          {/* Bottle ID Format */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Bottle ID Format</span></div>
            <div className="form-group">
              <label>Format Template</label>
              <input
                type="text"
                value={form.bottleIdFormat}
                onChange={e => f('bottleIdFormat', e.target.value)}
              />
            </div>
            <div className="alert alert-teal" style={{ marginBottom: 0 }}>
              <div style={{ width: 16, height: 16, flexShrink: 0 }}><Icons.Bottle /></div>
              <div>
                Example output:{' '}
                <strong style={{ fontFamily: 'monospace' }}>BP-001-01</strong>,{' '}
                <strong style={{ fontFamily: 'monospace' }}>IO-002-03</strong>
              </div>
            </div>
          </div>

          {/* Test Parameter Thresholds */}
          <div className="card">
            <div className="card-header"><span className="card-title">Test Alert Thresholds</span></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Results exceeding these values will trigger a Warning or Critical result classification.
            </div>
            {[
              ['Moisture Warning (ppm)', 'moistureWarn', 100],
              ['Moisture Critical (ppm)', 'moistureCrit', 200],
              ['Acidity Warning (mgKOH/g)', 'acidityWarn', 0.1],
            ].map(([label, key, def]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  defaultValue={def}
                  step={key.includes('acidity') ? 0.01 : 1}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={save}>Save Settings</button>
        {saved && (
          <div className="flex items-center gap-2" style={{ color: 'var(--green)', fontSize: 13.5 }}>
            <Icons.Check /> Settings saved successfully
          </div>
        )}
      </div>
    </div>
  )
}
