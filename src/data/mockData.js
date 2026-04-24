// ── Batch Lifecycle Stages ─────────────────────────────────────────────────────
// 0=Order Placed  1=Dispatched  2=In Transit  3=Delivered
export const BATCH_LIFECYCLE = [
  { key: 0, label: 'Order Placed',  short: 'Ordered',   color: '#6730c2', bg: 'rgba(103,48,194,0.1)'  },
  { key: 1, label: 'Dispatched',    short: 'Dispatched', color: '#1f5ec4', bg: 'rgba(31,94,196,0.1)'   },
  { key: 2, label: 'In Transit',    short: 'Transit',    color: '#c97a06', bg: 'rgba(201,122,6,0.1)'   },
  { key: 3, label: 'Delivered',     short: 'Delivered',  color: '#0a7c52', bg: 'rgba(10,124,82,0.1)'   },
]
export const BOTTLE_STATUSES = ['With Customer', 'Returned to Lab']
export const COURIERS        = ['BlueDart','DTDC','Delhivery','FedEx','DHL','Ecom Express']
export const SAMPLE_TYPES    = ['Transformer Oil','Turbine Oil','Gear Oil','Lubricant Oil','Hydraulic Oil','Coolant']

export function daysSince(d) { return Math.floor((Date.now()-new Date(d))/(864e5)) }
export function today()      { return new Date().toISOString().slice(0,10) }
export function fmtDate(d)   { if(!d)return'—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }
export function uid(p='ID')  { return `${p}-${Date.now().toString(36).toUpperCase().slice(-6)}` }

// ── Batches ───────────────────────────────────────────────────────────────────
// stage: 0=Order Placed, 1=Dispatched, 2=In Transit, 3=Delivered
export const INIT_BATCHES = [
  {id:'VPS-2026-001',customer:'UK POWER NETWORKS LPN',contact:'James Walker',qty:24,
   stage:3,orderDate:'2026-03-14',dispatchedDate:'2026-03-17',transitDate:'2026-03-18',deliveredDate:'2026-03-20',
   sampleType:'Transformer Oil',location:'Transformer Bay A',notes:'Annual maintenance samples',
   address:'Fore Hamlet, Ipswich, Suffolk, IP3 8AA, United Kingdom',
   courierService:'DHL',trackingNumber:'DHL-2025-00134827',
   assetItems:[{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',sampleType:'Transformer Oil',qty:12},{assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',sampleType:'Transformer Oil',qty:12}]},

  {id:'VPS-2026-002',customer:'FREEDOM GROUP OF COMPANIES LTD',contact:'Emily Thompson',qty:12,
   stage:3,orderDate:'2026-03-28',dispatchedDate:'2026-03-31',transitDate:'2026-04-01',deliveredDate:'2026-04-02',
   sampleType:'Lubricant Oil',location:'Piston Area 3B',notes:'Quarterly lubricant check',
   address:'14 Harbour Exchange Square, London, E14 9GE, United Kingdom',
   courierService:'FedEx',trackingNumber:'FX-2025-77402931',
   assetItems:[{assetId:'AST-B2001',assetName:'Piston Bay – Port Side',serialNumber:'VPS-20021',sampleType:'Lubricant Oil',qty:4},{assetId:'AST-B2002',assetName:'Piston Bay – Starboard',serialNumber:'VPS-20022',sampleType:'Gear Oil',qty:4},{assetId:'AST-B2003',assetName:'Main Engine Sump',serialNumber:'VPS-20023',sampleType:'Lubricant Oil',qty:4}]},

  {id:'VPS-2026-003',customer:'LIGHTSOURCE BP',contact:'Oliver Brown',qty:36,
   stage:2,orderDate:'2026-04-17',dispatchedDate:'2026-04-19',transitDate:'2026-04-20',deliveredDate:null,
   sampleType:'Gear Oil',location:'Solar Array Gearbox',notes:'Emergency sampling — high urgency',
   address:'One Westferry Circus, Canary Wharf, London, E14 4HD, United Kingdom',
   courierService:'BlueDart',trackingNumber:'BD-2025-50318844',
   assetItems:[{assetId:'AST-C3001',assetName:'Solar Array Gearbox – North',serialNumber:'VPS-30031',sampleType:'Gear Oil',qty:18},{assetId:'AST-C3002',assetName:'Solar Array Gearbox – South',serialNumber:'VPS-30032',sampleType:'Gear Oil',qty:18}]},

  {id:'VPS-2026-004',customer:'NORTHERN POWERGRID (YORKSHIRE)',contact:'Sophia Wilson',qty:18,
   stage:1,orderDate:'2026-04-18',dispatchedDate:'2026-04-20',transitDate:null,deliveredDate:null,
   sampleType:'Transformer Oil',location:'Furnace Hall',notes:'Routine lubricant test',
   address:'Lloyds Court, 78 Grey Street, Newcastle upon Tyne, NE1 6AF, United Kingdom',
   courierService:'DTDC',trackingNumber:'DTDC-2025-Z9912007',
   assetItems:[{assetId:'AST-D4001',assetName:'Furnace #4 – Oil Tank',serialNumber:'VPS-40041',sampleType:'Transformer Oil',qty:9},{assetId:'AST-D4002',assetName:'Furnace #5 – Oil Tank',serialNumber:'VPS-40042',sampleType:'Transformer Oil',qty:9}]},

  {id:'VPS-2026-005',customer:'INFINIS ENERGY SERVICES LTD',contact:'George Harris',qty:48,
   stage:3,orderDate:'2026-04-03',dispatchedDate:'2026-04-05',transitDate:'2026-04-06',deliveredDate:'2026-04-07',
   sampleType:'Turbine Oil',location:'Turbine Hall B',notes:'Turbine oil — critical equipment',
   address:'Sherwood House, 7 Glasgow Road, Dechmont, West Lothian, EH52 6NR, United Kingdom',
   courierService:'Delhivery',trackingNumber:'DLV-2025-83740021',
   assetItems:[{assetId:'AST-E5001',assetName:'Turbine Hall B – Unit 1',serialNumber:'VPS-50051',sampleType:'Turbine Oil',qty:15},{assetId:'AST-E5002',assetName:'Turbine Hall B – Unit 2',serialNumber:'VPS-50052',sampleType:'Turbine Oil',qty:15},{assetId:'AST-E5003',assetName:'Turbine Bearing Lubrication',serialNumber:'VPS-50053',sampleType:'Lubricant Oil',qty:10},{assetId:'AST-E5004',assetName:'Inlet / Outlet Manifold',serialNumber:'VPS-50054',sampleType:'Turbine Oil',qty:8}]},

  {id:'VPS-2026-006',customer:'EXXONMOBIL ASIA PACIFIC PTE LTD',contact:'Charlotte Evans',qty:30,
   stage:0,orderDate:'2026-04-21',dispatchedDate:null,transitDate:null,deliveredDate:null,
   sampleType:'Transformer Oil',location:'Substation 2, Section C',notes:'New site onboarding',
   address:'1 HarbourFront Place, #06-00 HarbourFront Tower One, Singapore 098633',
   courierService:'Ecom Express',trackingNumber:'',
   assetItems:[{assetId:'AST-F6001',assetName:'Substation 2 – Section C Main',serialNumber:'VPS-60061',sampleType:'Transformer Oil',qty:12},{assetId:'AST-F6002',assetName:'Substation 2 – Section C Aux',serialNumber:'VPS-60062',sampleType:'Transformer Oil',qty:10},{assetId:'AST-F6003',assetName:'Compressor Oil Reservoir',serialNumber:'VPS-60063',sampleType:'Lubricant Oil',qty:8}]},
]

// ── Bottles ───────────────────────────────────────────────────────────────────
function mkB(batchId,num,status,extra={}) {
  return {id:`${batchId}-B${String(num).padStart(2,'0')}`,batchId,bottleNum:num,status,
    assetId:null,assetName:'',serialNumber:'',dispatchedDate:null,returnedDate:null,...extra}
}

export const INIT_BOTTLES = [
  mkB('VPS-2026-001',1,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-03-24'}),
  mkB('VPS-2026-001',2,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-03-24'}),
  mkB('VPS-2026-001',3,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-03-24'}),
  mkB('VPS-2026-001',4,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-03-28'}),
  mkB('VPS-2026-001',5,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-03-28'}),
  mkB('VPS-2026-001',6,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-04-01'}),
  mkB('VPS-2026-001',7,'Returned to Lab',{assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17',returnedDate:'2026-04-01'}),
  mkB('VPS-2026-001',8,'With Customer',  {assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',9,'With Customer',  {assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',10,'With Customer', {assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',11,'With Customer', {assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',12,'With Customer', {assetId:'AST-A1001',assetName:'Transformer Bay A – Cooling Unit',serialNumber:'VPS-10011',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',13,'Returned to Lab',{assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17',returnedDate:'2026-03-24'}),
  mkB('VPS-2026-001',14,'Returned to Lab',{assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17',returnedDate:'2026-03-28'}),
  mkB('VPS-2026-001',15,'Returned to Lab',{assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17',returnedDate:'2026-03-28'}),
  mkB('VPS-2026-001',16,'Returned to Lab',{assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17',returnedDate:'2026-04-01'}),
  mkB('VPS-2026-001',17,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',18,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',19,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',20,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',21,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',22,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',23,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-001',24,'With Customer',  {assetId:'AST-A1002',assetName:'Transformer Bay B – Hot Side',serialNumber:'VPS-10012',dispatchedDate:'2026-03-17'}),
  mkB('VPS-2026-002',1,'Returned to Lab',{assetId:'AST-B2001',assetName:'Piston Bay – Port Side',serialNumber:'VPS-20021',dispatchedDate:'2026-03-31',returnedDate:'2026-04-07'}),
  mkB('VPS-2026-002',2,'Returned to Lab',{assetId:'AST-B2001',assetName:'Piston Bay – Port Side',serialNumber:'VPS-20021',dispatchedDate:'2026-03-31',returnedDate:'2026-04-07'}),
  mkB('VPS-2026-002',3,'With Customer',  {assetId:'AST-B2001',assetName:'Piston Bay – Port Side',serialNumber:'VPS-20021',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',4,'With Customer',  {assetId:'AST-B2001',assetName:'Piston Bay – Port Side',serialNumber:'VPS-20021',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',5,'Returned to Lab',{assetId:'AST-B2002',assetName:'Piston Bay – Starboard',serialNumber:'VPS-20022',dispatchedDate:'2026-03-31',returnedDate:'2026-04-07'}),
  mkB('VPS-2026-002',6,'Returned to Lab',{assetId:'AST-B2002',assetName:'Piston Bay – Starboard',serialNumber:'VPS-20022',dispatchedDate:'2026-03-31',returnedDate:'2026-04-07'}),
  mkB('VPS-2026-002',7,'With Customer',  {assetId:'AST-B2002',assetName:'Piston Bay – Starboard',serialNumber:'VPS-20022',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',8,'With Customer',  {assetId:'AST-B2002',assetName:'Piston Bay – Starboard',serialNumber:'VPS-20022',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',9,'With Customer',  {assetId:'AST-B2003',assetName:'Main Engine Sump',serialNumber:'VPS-20023',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',10,'With Customer', {assetId:'AST-B2003',assetName:'Main Engine Sump',serialNumber:'VPS-20023',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',11,'With Customer', {assetId:'AST-B2003',assetName:'Main Engine Sump',serialNumber:'VPS-20023',dispatchedDate:'2026-03-31'}),
  mkB('VPS-2026-002',12,'With Customer', {assetId:'AST-B2003',assetName:'Main Engine Sump',serialNumber:'VPS-20023',dispatchedDate:'2026-03-31'}),
  ...Array.from({length:18},(_,i)=>mkB('VPS-2026-003',i+1,'With Customer',{assetId:'AST-C3001',assetName:'Solar Array Gearbox – North',serialNumber:'VPS-30031',dispatchedDate:'2026-04-19'})),
  ...Array.from({length:18},(_,i)=>mkB('VPS-2026-003',i+19,'With Customer',{assetId:'AST-C3002',assetName:'Solar Array Gearbox – South',serialNumber:'VPS-30032',dispatchedDate:'2026-04-19'})),
  ...Array.from({length:9},(_,i)=>mkB('VPS-2026-004',i+1,'With Customer',{assetId:'AST-D4001',assetName:'Furnace #4 – Oil Tank',serialNumber:'VPS-40041',dispatchedDate:'2026-04-20'})),
  ...Array.from({length:9},(_,i)=>mkB('VPS-2026-004',i+10,'With Customer',{assetId:'AST-D4002',assetName:'Furnace #5 – Oil Tank',serialNumber:'VPS-40042',dispatchedDate:'2026-04-20'})),
  ...Array.from({length:10},(_,i)=>mkB('VPS-2026-005',i+1,'Returned to Lab',{assetId:'AST-E5001',assetName:'Turbine Hall B – Unit 1',serialNumber:'VPS-50051',dispatchedDate:'2026-04-05',returnedDate:'2026-04-14'})),
  ...Array.from({length:5},(_,i)=>mkB('VPS-2026-005',i+11,'With Customer',{assetId:'AST-E5001',assetName:'Turbine Hall B – Unit 1',serialNumber:'VPS-50051',dispatchedDate:'2026-04-05'})),
  ...Array.from({length:12},(_,i)=>mkB('VPS-2026-005',i+16,'Returned to Lab',{assetId:'AST-E5002',assetName:'Turbine Hall B – Unit 2',serialNumber:'VPS-50052',dispatchedDate:'2026-04-05',returnedDate:'2026-04-16'})),
  ...Array.from({length:3},(_,i)=>mkB('VPS-2026-005',i+28,'With Customer',{assetId:'AST-E5002',assetName:'Turbine Hall B – Unit 2',serialNumber:'VPS-50052',dispatchedDate:'2026-04-05'})),
  ...Array.from({length:10},(_,i)=>mkB('VPS-2026-005',i+31,'With Customer',{assetId:'AST-E5003',assetName:'Turbine Bearing Lubrication',serialNumber:'VPS-50053',dispatchedDate:'2026-04-05'})),
  ...Array.from({length:8},(_,i)=>mkB('VPS-2026-005',i+41,'With Customer',{assetId:'AST-E5004',assetName:'Inlet / Outlet Manifold',serialNumber:'VPS-50054',dispatchedDate:'2026-04-05'})),
  ...Array.from({length:12},(_,i)=>mkB('VPS-2026-006',i+1,'With Customer',{assetId:'AST-F6001',assetName:'Substation 2 – Section C Main',serialNumber:'VPS-60061',dispatchedDate:'2026-04-21'})),
  ...Array.from({length:10},(_,i)=>mkB('VPS-2026-006',i+13,'With Customer',{assetId:'AST-F6002',assetName:'Substation 2 – Section C Aux',serialNumber:'VPS-60062',dispatchedDate:'2026-04-21'})),
  ...Array.from({length:8},(_,i)=>mkB('VPS-2026-006',i+23,'With Customer',{assetId:'AST-F6003',assetName:'Compressor Oil Reservoir',serialNumber:'VPS-60063',dispatchedDate:'2026-04-21'})),
]

export const INIT_ALERTS = []
