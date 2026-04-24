/**
 * LabTrackApi.js
 * All API calls for the LabTrack module → /api/LabTrack/...
 * UI pages import from here. No UI logic lives here.
 */
import { getRequest, postRequest } from './ApiServices'

const B = 'LabTrack'

// ── Dashboard ────────────────────────────────────────────────────────
// GET  /api/LabTrack/Dashboard
// Returns { Kpi, Overdue[], Recent[] }
export const getDashboard = () => getRequest(`${B}/Dashboard`)

// ── Batches ──────────────────────────────────────────────────────────
// POST /api/LabTrack/Batches  { SearchText, BatchStatus, Page, PageSize }
// Returns { Data[], TotalCount, Page, PageSize }
export const getBatches = (filter = {}) =>
  postRequest(`${B}/Batches`, {
    SearchText:  filter.searchText  ?? null,
    BatchStatus: filter.batchStatus ?? null,
    CustomerKey: filter.customerKey ?? null,
    Page:        filter.page        ?? 1,
    PageSize:    filter.pageSize    ?? 15,
  })

// GET  /api/LabTrack/Batches/{id}
// Returns { Batch, Assets[], Bottles[] }
export const getBatchDetail = (id) => getRequest(`${B}/Batches/${id}`)

// POST /api/LabTrack/Batch/Save  (Id null=insert, Id>0=update)
export const saveBatch = (payload) => postRequest(`${B}/Batch/Save`, payload)

// ── Bottles ──────────────────────────────────────────────────────────
// POST /api/LabTrack/Bottle/BulkInsert
// { TrackerId, BottleList: JSON string of [{AssetKey,AssetName,SerialNumber}] }
export const bulkInsertBottles = (trackerId, bottleArray) =>
  postRequest(`${B}/Bottle/BulkInsert`, {
    TrackerId:  trackerId,
    BottleList: JSON.stringify(bottleArray),
  })

// POST /api/LabTrack/Bottle/MarkReturned  { Id, TrackerId }
export const markBottleReturned = (id, trackerId) =>
  postRequest(`${B}/Bottle/MarkReturned`, { Id: id, TrackerId: trackerId })

// POST /api/LabTrack/Bottle/ReDispatch  { Id, TrackerId }
export const reDispatchBottle = (id, trackerId) =>
  postRequest(`${B}/Bottle/ReDispatch`, { Id: id, TrackerId: trackerId })

// GET  /api/LabTrack/Scan/{code}  — lookup by BottleCode or SerialNumber
export const scanBottle = (code) => getRequest(`${B}/Scan/${encodeURIComponent(code)}`)

// ── Labels ───────────────────────────────────────────────────────────
// GET  /api/LabTrack/Labels/{trackerId}
export const getLabelsByTrackerId = (trackerId) => getRequest(`${B}/Labels/${trackerId}`)

// ── Alerts ───────────────────────────────────────────────────────────
// GET  /api/LabTrack/Alerts?onlyUnread=false
// Returns { Alerts[], UnreadCount }
export const getAlerts = (onlyUnread = false) =>
  getRequest(`${B}/Alerts?onlyUnread=${onlyUnread}`)

// POST /api/LabTrack/Alerts/MarkRead  { Id, MarkAll }
export const markAlertRead = (id, markAll = false) =>
  postRequest(`${B}/Alerts/MarkRead`, { Id: id, MarkAll: markAll })

// ── Customers & Assets (TOT views) ───────────────────────────────────
// GET  /api/LabTrack/Customers
// Returns [{ CustomerKey, CustomerName }]
export const getTotCustomers = () => getRequest(`${B}/Customers`)

// GET  /api/LabTrack/Assets/{customerKey}
// Returns [{ TransformerKey, TranformerName, SerialNo, TransformerLocation }]
export const getAssetsByCustomer = (customerKey) =>
  getRequest(`${B}/Assets/${customerKey}`)

// ── Stage helper ─────────────────────────────────────────────────────
// Maps local stage index → BatchStatus string used by the API
export const STAGE_TO_STATUS = ['Order Placed', 'Dispatched', 'In Transit', 'Delivered']
export const STATUS_TO_STAGE = Object.fromEntries(STAGE_TO_STATUS.map((s, i) => [s, i]))

// Maps BatchStatus string → date field name on the API model
export const STATUS_DATE_FIELD = {
  'Order Placed': 'OrderPlacedDate',
  'Dispatched':   'DispatchedDate',
  'In Transit':   'InTransitDate',
  'Delivered':    'DeliveredDate',
}

/**
 * normaliseApiBatch(raw)
 * Converts an API SampleBatchTrackerResponse into the local `batch` shape
 * that all existing UI components already expect (id, stage, customer, etc.)
 */
export function normaliseApiBatch(r) {
  // API returns camelCase fields — support both camelCase (live API) and
  // PascalCase (legacy / mock) so nothing breaks either way
  const batchStatus    = r.batchStatus    ?? r.BatchStatus    ?? ''
  const stage = STATUS_TO_STAGE[batchStatus] ?? 0
  return {
    // identity
    _apiId:          r.id              ?? r.Id,
    id:              r.batchCode       ?? r.BatchCode,
    stage,
    // people
    customer:        r.customerName    ?? r.CustomerName    ?? '',
    contact:         r.contactPerson   ?? r.ContactPerson   ?? '',
    address:         r.deliveryAddress ?? r.DeliveryAddress ?? '',
    // logistics
    courierService:  r.courierName     ?? r.CourierName     ?? '',
    trackingNumber:  r.trackingNumber  ?? r.TrackingNumber  ?? '',
    sampleType:      r.sampleType      ?? r.SampleType      ?? '',
    notes:           r.notes           ?? r.Notes           ?? '',
    // dates (kept as ISO strings; fmtDate() handles them)
    orderDate:       r.orderPlacedDate ?? r.OrderPlacedDate ?? null,
    dispatchedDate:  r.dispatchedDate  ?? r.DispatchedDate  ?? null,
    transitDate:     r.inTransitDate   ?? r.InTransitDate   ?? null,
    deliveredDate:   r.deliveredDate   ?? r.DeliveredDate   ?? null,
    // bottle counts — from API list response directly
    qty:             r.totalBottles      ?? r.TotalBottles      ?? 0,
    withCust:        r.withCustomerCount ?? r.WithCustomerCount ?? 0,
    returned:        r.returnedCount     ?? r.ReturnedCount     ?? 0,
    // asset count from list SP — populated immediately on load
    assetCount:      r.assetCount ?? r.AssetCount ?? null,
    // asset items (with names) — populated when detail is fetched via handleView
    assetItems:      [],
  }
}

/**
 * normaliseApiBottle(raw)
 * Converts an API SampleBottleTrackerResponse into the local `bottle` shape.
 */
export function normaliseApiBottle(r) {
  return {
    _apiId:        r.id           ?? r.Id,
    id:            r.bottleCode   ?? r.BottleCode,
    batchId:       null,          // filled by caller who knows the BatchCode
    _trackerId:    r.trackerId    ?? r.TrackerId,
    status:        r.status       ?? r.Status,
    assetKey:      r.assetKey     ?? r.AssetKey     ?? null,
    assetName:     r.assetName    ?? r.AssetName    ?? '',
    serialNumber:  r.serialNumber ?? r.SerialNumber ?? '',
    dispatchedDate:r.dispatchedDate ?? r.DispatchedDate ?? null,
    returnedDate:  r.returnedDate   ?? r.ReturnedDate   ?? null,
  }
}

/**
 * normaliseApiAlert(raw)
 * Converts an API LabTrackNotificationResponse into the local notification shape.
 */
export function normaliseApiAlert(r) {
  return {
    id:       String(r.id       ?? r.Id),
    _apiId:   r.id              ?? r.Id,
    type:     (r.notifType      ?? r.NotifType) === 'overdue' ? 'auto' : 'manual',
    batchId:  r.batchCode       ?? r.BatchCode  ?? '',
    customer: r.customerName    ?? r.CustomerName ?? '',
    msg:      r.message         ?? r.Message    ?? '',
    ts:       new Date(r.createdDate ?? r.CreatedDate).getTime(),
    read:     r.isRead          ?? r.IsRead,
  }
}
