// ── Batch Lifecycle Stages ─────────────────────────────────────────────────────
export const BATCH_LIFECYCLE = [
  { key: 0, label: 'Order Placed',  short: 'Ordered',   color: '#6730c2', bg: 'rgba(103,48,194,0.1)'  },
  { key: 1, label: 'Dispatched',    short: 'Dispatched', color: '#1f5ec4', bg: 'rgba(31,94,196,0.1)'   },
  { key: 2, label: 'In Transit',    short: 'Transit',    color: '#c97a06', bg: 'rgba(201,122,6,0.1)'   },
  { key: 3, label: 'Delivered',     short: 'Delivered',  color: '#0a7c52', bg: 'rgba(10,124,82,0.1)'   },
]

export const BOTTLE_STATUSES = ['With Customer', 'Returned to Lab']
export const COURIERS        = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Ecom Express']
export const SAMPLE_TYPES    = ['Transformer Oil', 'Turbine Oil', 'Gear Oil', 'Lubricant Oil', 'Hydraulic Oil', 'Coolant']

export function daysSince(d) { return Math.floor((Date.now() - new Date(d)) / 864e5) }
export function today()      { return new Date().toISOString().slice(0, 10) }
export function fmtDate(d)   { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
export function uid(p = 'ID') { return `${p}-${Date.now().toString(36).toUpperCase().slice(-6)}` }

export function uidAsset() { return `AST-${Date.now().toString(36).toUpperCase().slice(-6)}` }

export function bottleStats(batchId, bottles) {
  const bb = (bottles || []).filter(b => b.batchId === batchId)
  return {
    total:    bb.length,
    withCust: bb.filter(b => b.status === 'With Customer').length,
    returned: bb.filter(b => b.status === 'Returned to Lab').length,
  }
}
