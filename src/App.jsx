import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Sidebar         from './components/Sidebar'
import Topbar          from './components/Topbar'
import ProtectedRoute  from './components/ProtectedRoute'

import LoginPage       from './pages/LoginPage'
import Unauthorized    from './pages/Unauthorized'
import Dashboard       from './pages/Dashboard'
import Batches         from './pages/Batches'
import Dispatch        from './pages/Dispatch'
import Lab             from './pages/Lab'
import Reports         from './pages/Reports'
import Customers       from './pages/Customers'
import CustomerPortal  from './pages/CustomerPortal'
import AlertsPage      from './pages/AlertsPage'
import SettingsPage    from './pages/SettingsPage'

import { INIT_BATCHES, INIT_CUSTOMERS, INIT_REPORTS, INIT_ALERTS } from './data/mockData'

// ── Inner app (shown after login) ─────────────────────────────────────────────
function AppShell() {
  const [batches,   setBatches]   = useState(INIT_BATCHES)
  const [customers, setCustomers] = useState(INIT_CUSTOMERS)
  const [reports,   setReports]   = useState(INIT_REPORTS)
  const [alerts]                  = useState(INIT_ALERTS)
  const { user } = useAuth()

  const activeBatches = batches.filter(b => b.stage < 8).length

  // Filter portal batches to only show the logged-in customer's batches
  const portalBatches = user?.role === 'customer'
    ? batches.filter(b => b.customer === user.customerName)
    : batches

  return (
    <div className="layout">
      <Sidebar alertCount={alerts.length} />
      <div className="main">
        <Topbar activeBatches={activeBatches} alertCount={alerts.length} />
        <div className="content">
          <Routes>
            {/* ── Staff / Admin routes ── */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <Dashboard batches={batches} alerts={alerts} />
              </ProtectedRoute>
            }/>
            <Route path="/batches" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <Batches batches={batches} setBatches={setBatches} customers={customers} />
              </ProtectedRoute>
            }/>
            <Route path="/dispatch" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <Dispatch batches={batches} setBatches={setBatches} />
              </ProtectedRoute>
            }/>
            <Route path="/lab" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <Lab batches={batches} setBatches={setBatches} reports={reports} setReports={setReports} />
              </ProtectedRoute>
            }/>
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <Reports reports={reports} setReports={setReports} />
              </ProtectedRoute>
            }/>
            <Route path="/alerts" element={
              <ProtectedRoute allowedRoles={['admin','staff']}>
                <AlertsPage alerts={alerts} batches={batches} />
              </ProtectedRoute>
            }/>

            {/* ── Admin-only routes ── */}
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Customers customers={customers} setCustomers={setCustomers} batches={batches} />
              </ProtectedRoute>
            }/>
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }/>

            {/* ── Customer Portal (all roles) ── */}
            <Route path="/portal" element={
              <ProtectedRoute allowedRoles={['admin','staff','customer']}>
                <CustomerPortal
                  batches={portalBatches}
                  setBatches={setBatches}
                  lockedCustomer={user?.role === 'customer' ? user.customerName : null}
                />
              </ProtectedRoute>
            }/>

            {/* ── Misc ── */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ── Default redirect based on role ── */}
            <Route path="*" element={
              <Navigate to={user?.role === 'customer' ? '/portal' : '/'} replace />
            }/>
          </Routes>
        </div>
      </div>
    </div>
  )
}

// ── Root: show Login or App depending on auth ─────────────────────────────────
export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'customer' ? '/portal' : '/'} replace /> : <LoginPage />
      }/>
      <Route path="/*" element={
        user ? <AppShell /> : <Navigate to="/login" replace />
      }/>
    </Routes>
  )
}
