import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Check, X, Info } from 'lucide-react'

import Sidebar        from './components/Sidebar'
import Topbar         from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage  from './pages/LoginPage'
import Dashboard  from './pages/Dashboard'
import Batches    from './pages/Batches'
import Lab        from './pages/Lab'
import { AlertsPage, SettingsPage, Unauthorized } from './pages/OtherPages'

export const ToastContext   = createContext(null)
export const ScannerContext = createContext(null)
export function useToast()   { return useContext(ToastContext) }
export function useScanner() { return useContext(ScannerContext) }

/* ── Toast provider (unchanged) ─────────────────────────────────────── */
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 320)
  }, [])

  const show = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 320)
    }, 4000)
  }, []) // no deps — stable forever

  const icons = {
    success: <Check size={15} strokeWidth={2.5} />,
    error:   <X size={15} strokeWidth={2.5} />,
    info:    <Info size={15} strokeWidth={2} />,
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' exiting' : ''}`}>
            <div className="toast-icon">{icons[t.type]}</div>
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'inherit', opacity: 0.7, display: 'flex',
                alignItems: 'center', padding: '0 0 0 8px', flexShrink: 0,
              }}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function PageWrapper({ children }) {
  const { pathname } = useLocation()
  return <div key={pathname} className="anim-page" style={{ minHeight: '100%' }}>{children}</div>
}

/* ── App Shell ───────────────────────────────────────────────────────────
   App.jsx does NOT fetch any API data.
   Each page fetches its own data on mount.
   App.jsx only:
     1. Provides the global USB scanner context
     2. Holds topbar counts — pages update these via onRefresh(counts)
   This eliminates the double-fetch: App fetch + page fetch.
──────────────────────────────────────────────────────────────────────── */
function AppShell() {
  // Topbar counts — updated by pages when they finish loading
  const [topbar, setTopbar] = useState({
    batches:     0,
    alerts:      0,
    withCustomer:0,
    inLab:       0,
  })

  // Pages call this to push their freshly-loaded counts up to the topbar
  const updateTopbar = useCallback((patch) => {
    setTopbar(prev => ({ ...prev, ...patch }))
  }, []) // stable — no deps needed

  // ── Global USB barcode scanner (unchanged) ──────────────────────────
  const scanBuffer    = useRef('')
  const scanTimer     = useRef(null)
  const scanListeners = useRef([])

  const registerScanListener = useCallback(fn => {
    scanListeners.current.push(fn)
    return () => { scanListeners.current = scanListeners.current.filter(l => l !== fn) }
  }, []) // stable

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Enter') {
        const code = scanBuffer.current.trim()
        if (code.length > 2) scanListeners.current.forEach(fn => fn(code))
        scanBuffer.current = ''
        clearTimeout(scanTimer.current)
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key
        clearTimeout(scanTimer.current)
        scanTimer.current = setTimeout(() => { scanBuffer.current = '' }, 120)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // runs once — no deps

  return (
    <ScannerContext.Provider value={{ registerScanListener }}>
      <div className="layout">
        <Sidebar alertCount={topbar.alerts} />
        <div className="main">
          <Topbar
            activeBatches={topbar.batches}
            alertCount={topbar.alerts}
            totalInTransit={topbar.withCustomer}
            totalInLab={topbar.inLab}
          />
          <div className="content">
            <ScrollToTop />
            <Routes>
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Dashboard onTopbarUpdate={updateTopbar} />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/batches" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Batches onTopbarUpdate={updateTopbar} />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/lab" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Lab onTopbarUpdate={updateTopbar} />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <AlertsPage onTopbarUpdate={updateTopbar} />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PageWrapper><SettingsPage /></PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </ScannerContext.Provider>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/*"     element={user ? <AppShell />               : <Navigate to="/login" replace />} />
      </Routes>
    </ToastProvider>
  )
}