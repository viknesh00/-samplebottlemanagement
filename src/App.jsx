import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useSessionState } from './utils/useSessionState'
import { Check, X, Info } from 'lucide-react'

import Sidebar        from './components/Sidebar'
import Topbar         from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage         from './pages/LoginPage'
import Dashboard         from './pages/Dashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import Batches           from './pages/Batches'
import Lab               from './pages/Lab'
import Reports           from './pages/Reports'
import Customers         from './pages/Customers'
import CustomerPortal    from './pages/CustomerPortal'
import { AlertsPage, SettingsPage, Unauthorized } from './pages/OtherPages'

import {
  INIT_BATCHES, INIT_CUSTOMERS, INIT_REPORTS,
  INIT_ALERTS,  INIT_BOTTLES,
} from './data/mockData'

/* ── Toast Context ─────────────────────────────────────────────────────────── */
export const ToastContext = createContext(null)
export function useToast() { return useContext(ToastContext) }

/* ── Batch Requests Context ────────────────────────────────────────────────── */
export const BatchRequestsContext = createContext(null)
export function useBatchRequests() { return useContext(BatchRequestsContext) }

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
    success: <Check size={16} strokeWidth={2.5} />,
    error:   <X size={16} strokeWidth={2.5} />,
    info:    <Info size={16} strokeWidth={2} />,
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const content = document.querySelector('.content')
    if (content) content.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

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

  const [batches,   setBatches]   = useSessionState('vps_batches',   INIT_BATCHES)
  const [customers, setCustomers] = useSessionState('vps_customers', INIT_CUSTOMERS)
  const [reports,   setReports]   = useSessionState('vps_reports',   INIT_REPORTS)
  const [bottles,   setBottles]   = useSessionState('vps_bottles',   INIT_BOTTLES)
  const [alerts]                  = useState(INIT_ALERTS)

  const [batchRequests, setBatchRequests] = useSessionState('vps_batch_requests', [])

  const alertCount = alerts.length

  const scopedBatches = user?.role === 'customer'
    ? batches.filter(b => b.customer === user.customerName)
    : batches

  const scopedBatchIds = new Set(scopedBatches.map(b => b.id))
  const scopedBottles  = user?.role === 'customer'
    ? bottles.filter(b => scopedBatchIds.has(b.batchId))
    : bottles

  const activeBatches  = scopedBatches.filter(b => b.stage === 0).length
  const totalInTransit = scopedBottles.filter(b => b.status === 'Sent to VPS').length
  const totalInLab     = scopedBottles.filter(b => b.status === 'In Lab').length

  const portalBatches = scopedBatches
  const pendingRequestsCount = batchRequests.filter(r => r.status === 'Pending').length

  return (
    <BatchRequestsContext.Provider value={{ batchRequests, setBatchRequests }}>
      <div className="layout">
        <Sidebar alertCount={alertCount} pendingRequests={pendingRequestsCount} />
        <div className="main">
          <Topbar
            activeBatches={activeBatches}
            alertCount={alertCount}
            totalInTransit={totalInTransit}
            totalInLab={totalInLab}
          />
          <div className="content">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Dashboard
                      batches={batches} bottles={bottles}
                      reports={reports} alerts={alerts}
                      batchRequests={batchRequests}
                      setBatchRequests={setBatchRequests}
                      setBatches={setBatches}
                    />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <PageWrapper>
                    <CustomerDashboard
                      batches={scopedBatches}
                      bottles={scopedBottles}
                      reports={reports.filter(r => r.customer === user?.customerName)}
                      batchRequests={batchRequests.filter(r => r.customer === user?.customerName)}
                      setBatchRequests={setBatchRequests}
                      customerName={user?.customerName}
                    />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/batches" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Batches
                      batches={batches} setBatches={setBatches}
                      bottles={bottles} setBottles={setBottles}
                      customers={customers}
                      batchRequests={batchRequests} setBatchRequests={setBatchRequests}
                    />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/lab" element={
                <ProtectedRoute allowedRoles={['admin','staff']}>
                  <PageWrapper>
                    <Lab bottles={bottles} setBottles={setBottles} batches={batches} reports={reports} setReports={setReports} />
                  </PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['admin','staff','customer']}>
                  <PageWrapper>
                    <Reports
                      reports={user?.role === 'customer' ? reports.filter(r => r.customer === user?.customerName) : reports}
                      setReports={setReports} batches={batches} bottles={bottles} setBottles={setBottles}
                      isCustomer={user?.role === 'customer'}
                    />
                  </PageWrapper>
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
              <Route path="*" element={<Navigate to={user?.role === 'customer' ? '/dashboard' : '/'} replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BatchRequestsContext.Provider>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'customer' ? '/dashboard' : '/'} replace /> : <LoginPage />} />
        <Route path="/*" element={user ? <AppShell /> : <Navigate to="/login" replace />} />
      </Routes>
    </ToastProvider>
  )
}
