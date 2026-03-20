// ── Stage Definitions ────────────────────────────────────────────────────────
export const STAGES = [
  'Bottles Packed',
  'Bottles Dispatched',
  'Received by Customer',
  'Samples Filled',
  'Samples Dispatched',
  'Received by VPS',
  'In Lab',
  'Testing Complete',
  'Report Generated',
]

// ── Seed Batches ─────────────────────────────────────────────────────────────
export const INIT_BATCHES = [
  {
    id: 'VPS-2024-001',
    customer: 'Bharat Petroleum',
    contact: 'Ramesh Kumar',
    qty: 24,
    stage: 8,
    dispatched: '2024-11-01',
    location: 'Transformer Bay A, Cooling Chamber',
    notes: 'Annual maintenance samples',
    issues: [],
    courier: 'DTDC',
    awb: 'DT8834521',
    priority: 'high',
  },
  {
    id: 'VPS-2024-002',
    customer: 'Indian Oil Corp',
    contact: 'Priya Sharma',
    qty: 12,
    stage: 5,
    dispatched: '2024-11-10',
    location: 'Piston Area 3B',
    notes: 'Quarterly check',
    issues: ['Insufficient quantity returned'],
    courier: 'BlueDart',
    awb: 'BD7721009',
    priority: 'normal',
  },
  {
    id: 'VPS-2024-003',
    customer: 'HPCL Refinery',
    contact: 'Suresh Nair',
    qty: 36,
    stage: 3,
    dispatched: '2024-11-18',
    location: 'TBD',
    notes: 'Emergency sampling',
    issues: [],
    courier: 'Delhivery',
    awb: 'DV4490238',
    priority: 'high',
  },
  {
    id: 'VPS-2024-004',
    customer: 'Tata Steel',
    contact: 'Anita Patel',
    qty: 18,
    stage: 1,
    dispatched: '2024-11-22',
    location: 'Furnace #4 Oil Tank',
    notes: 'Routine lubricant test',
    issues: [],
    courier: 'FedEx',
    awb: 'FX9900112',
    priority: 'normal',
  },
  {
    id: 'VPS-2024-005',
    customer: 'Reliance Ind',
    contact: 'Vikram Singh',
    qty: 48,
    stage: 6,
    dispatched: '2024-10-28',
    location: 'Turbine Hall B',
    notes: 'Turbine oil analysis',
    issues: ['Wrong location collected'],
    courier: 'DTDC',
    awb: 'DT6623981',
    priority: 'urgent',
  },
  {
    id: 'VPS-2024-006',
    customer: 'NTPC Limited',
    contact: 'Deepa Rao',
    qty: 30,
    stage: 2,
    dispatched: '2024-11-15',
    location: 'Substation 2',
    notes: 'Transformer oil sampling',
    issues: [],
    courier: 'BlueDart',
    awb: 'BD5543210',
    priority: 'normal',
  },
]

// ── Seed Customers ────────────────────────────────────────────────────────────
export const INIT_CUSTOMERS = [
  { id: 'C001', name: 'Bharat Petroleum', gstin: '27AABCB0472N1ZI', contact: 'Ramesh Kumar',  email: 'ramesh@bpcl.in',         phone: '+91 98765 43210', city: 'Mumbai',      pendingBottles: 0 },
  { id: 'C002', name: 'Indian Oil Corp',  gstin: '07AAACI0010N1ZO', contact: 'Priya Sharma',  email: 'priya.s@iocl.com',       phone: '+91 98123 45678', city: 'Delhi',       pendingBottles: 12 },
  { id: 'C003', name: 'HPCL Refinery',   gstin: '27AAACH0681Q1ZE', contact: 'Suresh Nair',   email: 'suresh@hpcl.com',        phone: '+91 97654 32101', city: 'Pune',        pendingBottles: 36 },
  { id: 'C004', name: 'Tata Steel',      gstin: '20AAACT2809Q1Z0', contact: 'Anita Patel',   email: 'anita.p@tatasteel.com',  phone: '+91 99887 76543', city: 'Jamshedpur',  pendingBottles: 18 },
  { id: 'C005', name: 'Reliance Ind',    gstin: '27AAACR5055K1Z5', contact: 'Vikram Singh',  email: 'vsingh@ril.com',         phone: '+91 90001 23456', city: 'Mumbai',      pendingBottles: 48 },
  { id: 'C006', name: 'NTPC Limited',    gstin: '07AAACN0013R1Z7', contact: 'Deepa Rao',     email: 'deepa.rao@ntpc.co.in',   phone: '+91 98456 78901', city: 'Noida',       pendingBottles: 30 },
]

// ── Seed Reports ──────────────────────────────────────────────────────────────
export const INIT_REPORTS = [
  {
    id: 'RPT-001',
    batchId: 'VPS-2024-001',
    customer: 'Bharat Petroleum',
    testType: 'Transformer Oil Analysis',
    date: '2024-11-28',
    status: 'Issued',
    technician: 'Dr. Mehta',
    result: 'Normal',
    viscosity: '32 cSt',
    moisture: '18 ppm',
    acidity: '0.04 mgKOH/g',
    recommendation: 'No action required. Oil quality within acceptable limits.',
  },
  {
    id: 'RPT-002',
    batchId: 'VPS-2024-005',
    customer: 'Reliance Ind',
    testType: 'Turbine Oil Analysis',
    date: '2024-11-25',
    status: 'Draft',
    technician: 'Ms. Asha',
    result: 'Warning',
    viscosity: '46 cSt',
    moisture: '120 ppm',
    acidity: '0.11 mgKOH/g',
    recommendation: 'Schedule oil change within 30 days. Moisture level elevated.',
  },
]

// ── Seed Alerts ───────────────────────────────────────────────────────────────
export const INIT_ALERTS = [
  { id: 'A1', type: 'wrong-location', severity: 'red',   batch: 'VPS-2024-005', customer: 'Reliance Ind',   msg: 'Samples returned from wrong location (Transformer bottom instead of Turbine Hall B).', age: '3 days' },
  { id: 'A2', type: 'insufficient',   severity: 'amber', batch: 'VPS-2024-002', customer: 'Indian Oil Corp', msg: 'Insufficient sample quantity returned. Minimum 200ml required, received 120ml.',        age: '1 day' },
  { id: 'A3', type: 'no-update',      severity: 'amber', batch: 'VPS-2024-003', customer: 'HPCL Refinery',  msg: 'No status update from customer for 5 days. Samples may still be pending.',             age: '5 days' },
  { id: 'A4', type: 'unacknowledged', severity: 'red',   batch: 'VPS-2024-006', customer: 'NTPC Limited',   msg: 'Bottles dispatched 5 days ago but customer has not acknowledged receipt.',              age: '5 days' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export const COURIERS = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Ecom Express']

export function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
}
