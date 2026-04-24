/**
 * LabTrackApiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the LabTrack module.
 *
 * Drop this file in:  src/services/LabTrackApiService.js
 *
 * Every function returns { status, data } on success.
 * On auth failure, ApiServices.js automatically redirects to /login.
 *
 * Endpoint base:  /api/LabTrack/...
 */

import { getRequest, postRequest } from './ApiServices'

const BASE = 'LabTrack'

// ── 1 · DASHBOARD ─────────────────────────────────────────────────────────────
/** Returns { Kpi, Overdue[], Recent[] } */
export const getDashboard = () =>
  getRequest(`${BASE}/Dashboard`)

// ── 2 · BATCHES LIST ──────────────────────────────────────────────────────────
/**
 * @param {object} filter  { SearchText, BatchStatus, CustomerKey, Page, PageSize }
 * Returns { Data[], TotalCount, Page, PageSize }
 */
export const getBatches = (filter = {}) =>
  postRequest(`${BASE}/Batches`, {
    SearchText:  filter.searchText  || null,
    BatchStatus: filter.batchStatus || null,
    CustomerKey: filter.customerKey || null,
    Page:        filter.page        || 1,
    PageSize:    filter.pageSize    || 20,
  })

// ── 3 · BATCH DETAIL ──────────────────────────────────────────────────────────
/** Returns { Batch, Assets[], Bottles[] } */
export const getBatchDetail = (id) =>
  getRequest(`${BASE}/Batches/${id}`)

// ── 4 · SAVE BATCH (Create / Update) ─────────────────────────────────────────
/**
 * @param {object} payload  SampleBatchUpsertRequest shape
 *   - Id null/0 → INSERT;  Id > 0 → UPDATE
 *   - Assets: JSON string "[{AssetKey, AssetName, BottleCount}]"
 */
export const saveBatch = (payload) =>
  postRequest(`${BASE}/Batch/Save`, payload)

// ── 5 · BOTTLE — single save ──────────────────────────────────────────────────
export const saveBottle = (payload) =>
  postRequest(`${BASE}/Bottle/Save`, payload)

// ── 6 · BOTTLE — bulk insert ──────────────────────────────────────────────────
/**
 * @param {number} trackerId
 * @param {Array}  bottles  [{ AssetKey, AssetName, SerialNumber }]
 */
export const bulkInsertBottles = (trackerId, bottles) =>
  postRequest(`${BASE}/Bottle/BulkInsert`, {
    TrackerId:  trackerId,
    BottleList: JSON.stringify(bottles),
  })

// ── 7 · MARK BOTTLE RETURNED ─────────────────────────────────────────────────
export const markBottleReturned = (id, trackerId) =>
  postRequest(`${BASE}/Bottle/MarkReturned`, {
    Id: id, TrackerId: trackerId,
  })

// ── 8 · RE-DISPATCH BOTTLE ───────────────────────────────────────────────────
export const reDispatchBottle = (id, trackerId) =>
  postRequest(`${BASE}/Bottle/ReDispatch`, {
    Id: id, TrackerId: trackerId,
  })

// ── 9 · SCAN BOTTLE ───────────────────────────────────────────────────────────
/** Lookup by BottleCode or SerialNumber */
export const scanBottle = (code) =>
  getRequest(`${BASE}/Scan/${encodeURIComponent(code)}`)

// ── 10 · PRINTED LABELS ───────────────────────────────────────────────────────
export const getLabelsByTrackerId = (trackerId) =>
  getRequest(`${BASE}/Labels/${trackerId}`)

export const getLabelsByBatchCode = (batchCode) =>
  getRequest(`${BASE}/Labels/ByCode/${encodeURIComponent(batchCode)}`)

// ── 11 · ALERTS ───────────────────────────────────────────────────────────────
/** @param {boolean} onlyUnread */
export const getAlerts = (onlyUnread = false) =>
  getRequest(`${BASE}/Alerts?onlyUnread=${onlyUnread}`)

/** Mark one alert or all alerts as read */
export const markAlertRead = (id, markAll = false) =>
  postRequest(`${BASE}/Alerts/MarkRead`, { Id: id, MarkAll: markAll })

// ── 12 · CUSTOMERS (TOT) ──────────────────────────────────────────────────────
export const getTotCustomers = () =>
  getRequest(`${BASE}/Customers`)

// ── 13 · ASSETS BY CUSTOMER ───────────────────────────────────────────────────
export const getAssetsByCustomer = (customerKey) =>
  getRequest(`${BASE}/Assets/${customerKey}`)
