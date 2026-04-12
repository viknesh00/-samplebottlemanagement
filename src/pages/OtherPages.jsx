import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/UI'
import * as Icons from '../components/Icons'
import { fmtDate } from '../data/mockData'

// ── Alerts Page ───────────────────────────────────────────────────────────────
export function AlertsPage({ alerts, batches }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">Management</div>
          <div className="page-header-title">System Alerts</div>
          <div className="page-header-sub">Issues and flags requiring immediate attention</div>
        </div>
        {alerts.length > 0 && <span className="badge badge-red" style={{ fontSize: 12, padding: '5px 12px' }}>{alerts.length} active</span>}
      </div>

      {alerts.length === 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4, filter: 'grayscale(1)' }}>✓</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>All Clear</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No active alerts at this time.</div>
          </div>
        </div>
      )}

      {alerts.map((a, i) => {
        const batch = batches.find(b => b.id === a.batch)
        const isRed = a.severity === 'red'
        return (
          <div
            key={a.id}
            className="card anim-slide-up"
            style={{ borderLeft: `3px solid ${isRed ? 'var(--red)' : 'var(--amber)'}`, marginBottom: 12, animationDelay: `${i * 60}ms` }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-sm)',
                background: isRed ? 'rgba(212,42,42,0.1)' : 'rgba(201,122,6,0.1)',
                border: `1px solid ${isRed ? 'rgba(212,42,42,0.2)' : 'rgba(201,122,6,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isRed ? 'var(--red)' : 'var(--amber)', flexShrink: 0,
              }}>
                <Icons.Warn />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>
                      {a.customer?.split(' ').slice(0, 3).join(' ')}
                      <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 10 }}>{a.batch}</span>
                    </div>
                    <span className={`badge badge-${isRed ? 'red' : 'amber'}`}>{a.type}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 'var(--r-xs)', border: 'var(--rule)' }}>{a.age} ago</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: batch ? 10 : 0 }}>{a.msg}</div>
                {batch && (
                  <div style={{ padding: '9px 12px', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: 'var(--rule)', fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {batch.sampleType} · {batch.qty} bottles · dispatched {fmtDate(batch.dispatched)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSMS, setNotifSMS]     = useState(false)
  const [autoIssue, setAutoIssue]   = useState(false)
  const [retention, setRetention]   = useState('12')
  const [orgName, setOrgName]       = useState('VPS Veritas')
  const [orgEmail, setOrgEmail]     = useState('lab@vpsveritas.com')
  const [saved, setSaved]           = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? 'var(--accent)' : 'var(--border-dark)',
        position: 'relative', transition: 'background 200ms, box-shadow 200ms', cursor: 'pointer',
        flexShrink: 0, boxShadow: checked ? '0 0 0 3px rgba(232,93,10,0.15)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  )

  const SectionCard = ({ title, subtitle, icon, children, delay = 0 }) => (
    <div className="card anim-slide-up" style={{ marginBottom: 16, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: 'var(--rule)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(232,93,10,0.08)', border: '1px solid rgba(232,93,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">System</div>
          <div className="page-header-title">Settings</div>
          <div className="page-header-sub">System configuration and preferences</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved
            ? <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Saved!</>
            : <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Changes</>
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <SectionCard delay={0} title="Organisation" subtitle="Your lab identity and contact details" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0H5m-2 0h2M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}>
            <div className="form-group"><label>Organisation Name</label><input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} /></div>
            <div className="form-group"><label>Lab Contact Email</label><input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} /></div>
            <div className="form-group"><label>Default Courier</label><select defaultValue="BlueDart"><option>BlueDart</option><option>DHL Express</option><option>FedEx</option><option>DTDC</option></select></div>
          </SectionCard>
          <SectionCard delay={60} title="Lab Parameters" subtitle="Test result thresholds and boundaries" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z"/></svg>}>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>Viscosity Warning (cSt)</label><input type="number" defaultValue="45" /></div>
              <div className="form-group"><label>Moisture Warning (ppm)</label><input type="number" defaultValue="30" /></div>
              <div className="form-group"><label>Acidity Warning (mgKOH/g)</label><input type="number" defaultValue="0.5" step="0.1" /></div>
              <div className="form-group"><label>Critical Multiplier</label><input type="number" defaultValue="2" step="0.5" /></div>
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard delay={120} title="Notifications" subtitle="How and when alerts are delivered" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>}>
            <SettingRow label="Email Alerts" desc="Send alert emails to lab contact address"><Toggle checked={notifEmail} onChange={setNotifEmail} /></SettingRow>
            <SettingRow label="SMS Notifications" desc="Text message alerts for critical results"><Toggle checked={notifSMS} onChange={setNotifSMS} /></SettingRow>
            <SettingRow label="Auto-Issue Reports" desc="Automatically issue reports when tested"><Toggle checked={autoIssue} onChange={setAutoIssue} /></SettingRow>
            <div style={{ paddingTop: 12 }}><div className="form-group" style={{ marginBottom: 0 }}><label>Alert Email Recipients</label><input type="email" defaultValue="alerts@vpsveritas.com" /></div></div>
          </SectionCard>
          <SectionCard delay={180} title="Data & Retention" subtitle="Archive and purge policies" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>}>
            <SettingRow label="Report Retention" desc="How long to keep completed reports">
              <select value={retention} onChange={e => setRetention(e.target.value)} style={{ width: 120, padding: '6px 10px', fontSize: 13 }}>
                <option value="6">6 months</option><option value="12">12 months</option><option value="24">2 years</option><option value="60">5 years</option><option value="0">Forever</option>
              </select>
            </SettingRow>
            <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export All Data (CSV)</button>
              <button className="btn btn-danger btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg>Purge Archived Records</button>
            </div>
          </SectionCard>
          <div className="card anim-slide-up" style={{ animationDelay: '240ms' }}>
            <div className="card-header"><span className="card-title">System Info</span><span className="badge badge-green">Operational</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Version','v1.1.0'],['Environment','Production'],['DB Status','Connected'],['Last Backup','Today 03:00']].map(([l,v]) => (
                <div key={l} style={{ padding: '11px 13px', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: 'var(--rule)' }}>
                  <div className="info-label">{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Unauthorized ──────────────────────────────────────────────────────────────
export function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="anim-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 'var(--r-xl)', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="30" height="30" fill="none" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Denied</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You don't have permission to view this page.</div>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  )
}
