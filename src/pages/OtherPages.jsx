import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from '../components/Icons'
import { fmtDate } from '../utils/constants'
import AlertsPageImpl from './AlertsPage'
import {
  AlertTriangle, CheckCircle2, Save, Check,
  Building2, FlaskConical, Bell, Download, Trash2,
  Lock, ArrowLeft,
} from 'lucide-react'

// ── Alerts / Notifications Page ──────────────────────────────────────────────
export function AlertsPage({ onTopbarUpdate }) {
  return <AlertsPageImpl onTopbarUpdate={onTopbarUpdate} />
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSMS,   setNotifSMS]   = useState(false)
  const [retention,  setRetention]  = useState('12')
  const [orgName,    setOrgName]    = useState('VPS Veritas')
  const [orgEmail,   setOrgEmail]   = useState('lab@vpsveritas.com')
  const [saved,      setSaved]      = useState(false)

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

  const SectionCard = ({ title, subtitle, icon: Icon, children, delay = 0 }) => (
    <div className="card anim-slide-up" style={{ marginBottom: 16, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: 'var(--rule)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(232,93,10,0.08)', border: '1px solid rgba(232,93,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <Icon size={18} strokeWidth={2} />
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
            ? <><Check size={12} strokeWidth={2.5} /> Saved!</>
            : <><Save size={12} strokeWidth={2} /> Save Changes</>
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <SectionCard delay={0} title="Organisation" subtitle="Your lab identity and contact details" icon={Building2}>
            <div className="form-group"><label>Organisation Name</label><input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} /></div>
            <div className="form-group"><label>Lab Contact Email</label><input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} /></div>
            <div className="form-group"><label>Default Courier</label>
              <select defaultValue="BlueDart">
                <option>BlueDart</option><option>DHL Express</option><option>FedEx</option><option>DTDC</option>
              </select>
            </div>
          </SectionCard>

          <SectionCard delay={60} title="Lab Parameters" subtitle="Test result thresholds and boundaries" icon={FlaskConical}>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>Viscosity Warning (cSt)</label><input type="number" defaultValue="45" /></div>
              <div className="form-group"><label>Moisture Warning (ppm)</label><input type="number" defaultValue="30" /></div>
              <div className="form-group"><label>Acidity Warning (mgKOH/g)</label><input type="number" defaultValue="0.5" step="0.1" /></div>
              <div className="form-group"><label>Critical Multiplier</label><input type="number" defaultValue="2" step="0.5" /></div>
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard delay={120} title="Notifications" subtitle="How and when alerts are delivered" icon={Bell}>
            <SettingRow label="Email Alerts" desc="Send alert emails to lab contact address"><Toggle checked={notifEmail} onChange={setNotifEmail} /></SettingRow>
            <SettingRow label="SMS Notifications" desc="Text message alerts for critical results"><Toggle checked={notifSMS} onChange={setNotifSMS} /></SettingRow>
            <div style={{ paddingTop: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Alert Email Recipients</label>
                <input type="email" defaultValue="alerts@vpsveritas.com" />
              </div>
            </div>
          </SectionCard>

          <SectionCard delay={180} title="Data & Retention" subtitle="Archive and purge policies" icon={Download}>
            <SettingRow label="Report Retention" desc="How long to keep completed reports">
              <select value={retention} onChange={e => setRetention(e.target.value)} style={{ width: 120, padding: '6px 10px', fontSize: 13 }}>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">2 years</option>
                <option value="60">5 years</option>
                <option value="0">Forever</option>
              </select>
            </SettingRow>
            <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={12} strokeWidth={2} /> Export All Data (CSV)
              </button>
              <button className="btn btn-danger btn-sm" style={{ justifyContent: 'flex-start', width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={12} strokeWidth={2} /> Purge Archived Records
              </button>
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
        <Lock size={30} color="var(--red)" strokeWidth={2} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Denied</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You don't have permission to view this page.</div>
      <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} strokeWidth={2} /> Go Back
      </button>
    </div>
  )
}
