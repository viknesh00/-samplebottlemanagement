import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useSessionState } from './utils/useSessionState'

import Sidebar        from './components/Sidebar'
import Topbar         from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage      from './pages/LoginPage'
import Dashboard      from './pages/Dashboard'
import Batches        from './pages/Batches'
import Lab            from './pages/Lab'
import Reports        from './pages/Reports'
import Customers      from './pages/Customers'
import CustomerPortal from './pages/CustomerPortal'
import { AlertsPage, SettingsPage, Unauthorized } from './pages/OtherPages'

import {
  INIT_BATCHES, INIT_CUSTOMERS, INIT_REPORTS,
  INIT_ALERTS,  INIT_BOTTLES,
} from './data/mockData'

/* ── Toast Context ─────────────────────────────────────────────────────────── */
export const ToastContext = createContext(null)
export function useToast() { return useContext(ToastContext) }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 320)
    }, 3200)
  }, [])

  const icons = {
    success: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
    error:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
    info:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>,
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' exiting' : ''}`}>
            <div className="toast-icon">{icons[t.type]}</div>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ── Scroll to top on route change ─────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation()
  const contentRef = useRef(null)

  useEffect(() => {
    // Scroll the .content div to top smoothly
    const content = document.querySelector('.content')
    if (content) {
      content.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname])

  return null
}

/* ── Page Transition Wrapper ───────────────────────────────────────────────── */
function PageWrapper({ children }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="anim-page" style={{ minHeight: '100%' }}>
      {children}
    </div>
  )
}

function AppShell() {
  const { user } = useAuth()

  // Persisted in sessionStorage — survives logout within the same tab,
  // but clears automatically when the tab or browser is closed.
  const [batches,   setBatches]   = useSessionState('vps_batches',   INIT_BATCHES)
  const [customers, setCustomers] = useSessionState('vps_customers', INIT_CUSTOMERS)
  const [reports,   setReports]   = useSessionState('vps_reports',   INIT_REPORTS)
  const [bottles,   setBottles]   = useSessionState('vps_bottles',   INIT_BOTTLES)
  const [alerts]                  = useState(INIT_ALERTS)

  const activeBatches   = batches.filter(b => b.stage === 0).length
  const alertCount      = alerts.length
  const totalEmpty      = bottles.filter(b => b.status === 'Empty').length
  const totalInTransit  = bottles.filter(b => b.status === 'Sent to VPS').length
  const totalInLab      = bottles.filter(b => b.status === 'In Lab').length
  const totalReports    = reports.length

  const portalBatches = user?.role === 'customer'
    ? batches.filter(b => b.customer === user.customerName)
    : batches

  return (
    <div className="layout">
      <Sidebar alertCount={alertCount} />
      <div className="main">
        <Topbar
          activeBatches={activeBatches}
          alertCount={alertCount}
          totalEmpty={totalEmpty}
          totalInTransit={totalInTransit}
          totalInLab={totalInLab}
        />
        <div className="content">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <PageWrapper><Dashboard batches={batches} bottles={bottles} reports={reports} alerts={alerts} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/batches" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <PageWrapper><Batches batches={batches} setBatches={setBatches} bottles={bottles} setBottles={setBottles} customers={customers} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/lab" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <PageWrapper><Lab bottles={bottles} setBottles={setBottles} batches={batches} reports={reports} setReports={setReports} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <PageWrapper><Reports reports={reports} setReports={setReports} batches={batches} bottles={bottles} setBottles={setBottles} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <PageWrapper><AlertsPage alerts={alerts} batches={batches} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageWrapper><Customers customers={customers} setCustomers={setCustomers} batches={batches} bottles={bottles} /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageWrapper><SettingsPage /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/portal" element={
              <ProtectedRoute allowedRoles={['admin','staff','customer']}>
                <PageWrapper>
                  <CustomerPortal
                    batches={portalBatches} setBatches={setBatches}
                    bottles={bottles} setBottles={setBottles}
                    lockedCustomer={user?.role === 'customer' ? user.customerName : null}
                  />
                </PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to={user?.role === 'customer' ? '/portal' : '/'} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'customer' ? '/portal' : '/'} replace /> : <LoginPage />} />
        <Route path="/*" element={user ? <AppShell /> : <Navigate to="/login" replace />} />
      </Routes>
    </ToastProvider>
  )
}
