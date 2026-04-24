import React, { createContext, useContext, useState } from 'react'
import { postRequest } from '../services/ApiServices'
import { cookieKeys, getCookie, setCookie } from '../services/Cookies'
import { cookieObj } from '../models/cookieObj'

const AuthContext = createContext(null)

// Only this role is permitted to access VPS LabTrack
const ALLOWED_ROLE = 'VPS Admin'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = getCookie('token')
      if (!token) return null
      // Restore session from cookies
      return {
        name:      getCookie('name'),
        username:  getCookie('username'),
        type:      getCookie('type'),
        token,
        clientId:  getCookie('clientId'),
        userRole:  getCookie('userRole'),
        clientName: getCookie('clientName'),
        profileImg: getCookie('profileImg'),
      }
    } catch {
      return null
    }
  })

  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function login(email, password) {
    setError('')
    setLoading(true)

    try {
      // buildUrl() in ApiServices will prepend VITE_CUSTOMER_PORTAL_API_URL
      const url = 'Authenticate/login'

      // Generate or retrieve persistent device ID
      let deviceID = getCookie('DeviceUniqueID')
      if (!deviceID) {
        const arr = new Uint8Array(20)
        window.crypto.getRandomValues(arr)
        deviceID = Array.from(arr, b => (b < 16 ? '0' : '') + b.toString(16)).join('')
        const oneYear = new Date()
        oneYear.setFullYear(oneYear.getFullYear() + 1)
        setCookie('DeviceUniqueID', deviceID, oneYear)
      }

      const res = await postRequest(url, {
        username: email.trim(),
        password,
        deviceID,
      })

      if (res.status === 200) {
        const { data } = res

        // ── Role gate: only VPS Admin may access LabTrack ─────────────────
        if (data.userRole !== ALLOWED_ROLE) {
          setError(`Access denied. Only ${ALLOWED_ROLE} accounts can access VPS LabTrack. Please contact your VPS Admin.`)
          setLoading(false)
          return { success: false, accessDenied: true }
        }

        const assetTypes   = []
        const serviceTypes = []
        if (!data.devicechanged) {
          data.assetTypes?.forEach(a => assetTypes.push(a.assetType))
          data.userServices?.forEach(s => serviceTypes.push(s.service))
        }

        const userData = {
          name:            data.userName,
          username:        email.trim(),
          type:            data.userType,
          token:           data.token,
          clientId:        data.clientId,
          userRole:        data.userRole,
          clientName:      data.clientName,
          profileImg:      data.profilepicture || 'default_image.png',
          expiration:      data.expiration,
          assetTypes:      assetTypes.join(','),
          serviceTypes:    serviceTypes.join(','),
          resetPassword:   data.resetPassword,
          bM_ACCESS_STATUS: data.bM_ACCESS_STATUS,
          fdR_ACCESS_STATUS: data.fdR_ACCESS_STATUS,
          defaultTab:      data.defaultTab,
          devicechanged:   data.devicechanged,
        }

        cookieKeys({ ...cookieObj, ...userData }, data.expiration)
        setUser(userData)
        setLoading(false)
        return { success: true, data }
      }

      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return { success: false }
    } catch (err) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return { success: false }
    }
  }

  function logout() {
    cookieKeys(cookieObj, 0)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
