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
    customer: 'UK POWER NETWORKS LPN',
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
    customer: 'FREEDOM GROUP OF COMPANIES LTD',
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
    customer: 'LIGHTSOURCE BP',
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
    customer: 'NORTHERN POWERGRID (YORKSHIRE) PLC',
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
    customer: 'INFINIS ENERGY SERVICES LTD',
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
    customer: 'EXXONMOBIL ASIA PACIFIC PTE LTD',
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
  { id: 'C001', name: 'UK POWER NETWORKS LPN', vat: 'GB123456789', contact: 'James Walker',   email: 'james.walker@ukpower.co.uk',        phone: '+44 7700 900123', city: 'London',        pendingBottles: 0 },
  { id: 'C002', name: 'FREEDOM GROUP OF COMPANIES LTD', vat: 'GB987654321', contact: 'Emily Thompson', email: 'emily.thompson@freedom.co.uk', phone: '+44 7700 900456', city: 'Manchester',    pendingBottles: 12 },
  { id: 'C003', name: 'LIGHTSOURCE BP', vat: 'GB456789123', contact: 'Oliver Brown',  email: 'oliver.brown@lightsourcebp.co.uk', phone: '+44 7700 900789', city: 'Birmingham',    pendingBottles: 36 },
  { id: 'C004', name: 'NORTHERN POWERGRID (YORKSHIRE) PLC', vat: 'GB321654987', contact: 'Sophia Wilson', email: 'sophia.wilson@northernpowergrid.co.uk', phone: '+44 7700 901234', city: 'Leeds',         pendingBottles: 18 },
  { id: 'C005', name: 'INFINIS ENERGY SERVICES LTD', vat: 'GB654987321', contact: 'George Harris', email: 'george.harris@infinis.co.uk', phone: '+44 7700 901567', city: 'Liverpool',     pendingBottles: 48 },
  { id: 'C006', name: 'EXXONMOBIL ASIA PACIFIC PTE LTD', vat: 'GB789123456', contact: 'Charlotte Evans', email: 'charlotte.evans@exxonmobil.co.uk', phone: '+44 7700 901890', city: 'Edinburgh',     pendingBottles: 30 },
];

// ── Seed Reports ──────────────────────────────────────────────────────────────
export const INIT_REPORTS = [
  {
    id: 'RPT-001',
    batchId: 'VPS-2024-001',
    customer: 'UK POWER NETWORKS LPN',
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
    customer: 'INFINIS ENERGY SERVICES LTD',
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
  { id: 'A1', type: 'wrong-location', severity: 'red',   batch: 'VPS-2024-005', customer: 'INFINIS ENERGY SERVICES LTD',   msg: 'Samples returned from wrong location (Transformer bottom instead of Turbine Hall B).', age: '3 days' },
  { id: 'A2', type: 'insufficient',   severity: 'amber', batch: 'VPS-2024-002', customer: 'FREEDOM GROUP OF COMPANIES LTD', msg: 'Insufficient sample quantity returned. Minimum 200ml required, received 120ml.',        age: '1 day' },
  { id: 'A3', type: 'no-update',      severity: 'amber', batch: 'VPS-2024-003', customer: 'LIGHTSOURCE BP',  msg: 'No status update from customer for 5 days. Samples may still be pending.',             age: '5 days' },
  { id: 'A4', type: 'unacknowledged', severity: 'red',   batch: 'VPS-2024-006', customer: 'EXXONMOBIL ASIA PACIFIC PTE LTD',   msg: 'Bottles dispatched 5 days ago but customer has not acknowledged receipt.',              age: '5 days' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export const COURIERS = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Ecom Express']

export function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
}
