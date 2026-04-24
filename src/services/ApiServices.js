/**
 * ApiServices.js — fixed: only redirect to /login on 401, not on every error
 */

import { cookieObj } from '../models/cookieObj'
import { cookieKeys, getCookie } from './Cookies'

const BASE_URL = import.meta.env.VITE_CUSTOMER_PORTAL_API_URL

if (!BASE_URL) {
  console.error('[ApiServices] VITE_CUSTOMER_PORTAL_API_URL is not set. Check your .env file.')
}

export function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  return BASE_URL + path
}

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function clearAndRedirect() {
  cookieKeys(cookieObj, 0)
  window.location.href = '/login'
}

async function safeJson(res) {
  try { return await res.json() } catch { return {} }
}

async function handleResponse(res, isBlob = false, isLoginEndpoint = false) {
  if (res.status === 401) {
    // Do NOT redirect if this is the login endpoint — a 401 there just means wrong credentials
    if (!isLoginEndpoint) {
      clearAndRedirect()
      return new Promise(() => {})
    }
  }
  if (!res.ok) {
    const body = await safeJson(res)
    const err  = new Error(body?.message || body?.title || `Request failed (${res.status})`)
    err.status = res.status
    err.data   = body
    throw err
  }
  if (isBlob) return { status: res.status, data: await res.blob() }
  return { status: res.status, data: await res.json() }
}

export const getRequest = async (path) => {
  const token = getCookie('token')
  const res = await fetch(buildUrl(path), { method: 'GET', headers: getHeaders(token || undefined) })
  return handleResponse(res)
}

export const postRequest = async (path, data, isBlob = false) => {
  const token = getCookie('token')
  const isLoginEndpoint = /authenticate\/login/i.test(path)
  const res = await fetch(buildUrl(path), { method: 'POST', headers: getHeaders(token || undefined), body: JSON.stringify(data) })
  if (!token && !res.ok && res.status !== 401) {
    throw { response: { status: res.status, data: await safeJson(res) } }
  }
  return handleResponse(res, isBlob, isLoginEndpoint)
}

export const putRequest = async (path, data) => {
  const token = getCookie('token')
  const res = await fetch(buildUrl(path), { method: 'PUT', headers: getHeaders(token || undefined), body: JSON.stringify(data) })
  return handleResponse(res)
}

export const deleteRequest = async (path) => {
  const token = getCookie('token')
  const res = await fetch(buildUrl(path), { method: 'DELETE', headers: getHeaders(token || undefined) })
  return handleResponse(res)
}
