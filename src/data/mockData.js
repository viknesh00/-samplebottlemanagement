// ── Bottle Status Lifecycle (after customer receives batch) ───────────────────
// Empty → Collected → Sent to VPS → In Lab → Tested → Report Ready
export const BOTTLE_STATUSES = ['Empty','Collected','Sent to VPS','In Lab','Tested','Report Ready']

// ── Batch: only 2 stages now ──────────────────────────────────────────────────
// 0 = Dispatched (VPS sent bottles, awaiting customer acknowledgement)
// 1 = Received   (Customer acknowledged — batch done at batch level)
export const BATCH_STAGES = ['Dispatched','Received by Customer']

export const COURIERS     = ['BlueDart','DTDC','Delhivery','FedEx','DHL','Ecom Express']
export const SAMPLE_TYPES = ['Transformer Oil','Turbine Oil','Gear Oil','Lubricant Oil','Hydraulic Oil','Coolant']

export function daysSince(d) { return Math.floor((Date.now()-new Date(d))/(864e5)) }
export function today()      { return new Date().toISOString().slice(0,10) }
export function fmtDate(d)   { if(!d)return'—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }
export function uid(p='ID')  { return `${p}-${Date.now().toString(36).toUpperCase().slice(-6)}` }

// ── Customers ─────────────────────────────────────────────────────────────────
export const INIT_CUSTOMERS = [
  {id:'C001',name:'UK POWER NETWORKS LPN',          contact:'James Walker',   email:'james.walker@ukpower.co.uk',       phone:'+44 7700 900123',city:'London'},
  {id:'C002',name:'FREEDOM GROUP OF COMPANIES LTD', contact:'Emily Thompson', email:'emily.thompson@freedom.co.uk',     phone:'+44 7700 900456',city:'Manchester'},
  {id:'C003',name:'LIGHTSOURCE BP',                 contact:'Oliver Brown',   email:'oliver.brown@lightsourcebp.co.uk', phone:'+44 7700 900789',city:'Birmingham'},
  {id:'C004',name:'NORTHERN POWERGRID (YORKSHIRE)', contact:'Sophia Wilson',  email:'sophia.wilson@npg.co.uk',          phone:'+44 7700 901234',city:'Leeds'},
  {id:'C005',name:'INFINIS ENERGY SERVICES LTD',    contact:'George Harris',  email:'george.harris@infinis.co.uk',      phone:'+44 7700 901567',city:'Liverpool'},
  {id:'C006',name:'EXXONMOBIL ASIA PACIFIC PTE LTD',contact:'Charlotte Evans',email:'charlotte.evans@exxonmobil.co.uk', phone:'+44 7700 901890',city:'Edinburgh'},
]

// ── Batches ───────────────────────────────────────────────────────────────────
export const INIT_BATCHES = [
  {id:'VPS-2025-001',customer:'UK POWER NETWORKS LPN',         contact:'James Walker',   qty:24,stage:1,dispatched:'2025-11-01',receivedDate:'2025-11-03',courier:'DTDC',     awb:'DT8834521',priority:'high',  sampleType:'Transformer Oil',location:'Transformer Bay A',   notes:'Annual maintenance samples',              issues:[]},
  {id:'VPS-2025-002',customer:'FREEDOM GROUP OF COMPANIES LTD',contact:'Emily Thompson', qty:12,stage:1,dispatched:'2025-11-10',receivedDate:'2025-11-13',courier:'BlueDart', awb:'BD7721009',priority:'normal',sampleType:'Lubricant Oil',  location:'Piston Area 3B',       notes:'Quarterly lubricant check',               issues:[]},
  {id:'VPS-2025-003',customer:'LIGHTSOURCE BP',                contact:'Oliver Brown',   qty:36,stage:1,dispatched:'2025-11-18',receivedDate:'2025-11-20',courier:'Delhivery',awb:'DV4490238',priority:'high',  sampleType:'Gear Oil',       location:'Solar Array Gearbox',  notes:'Emergency sampling — high urgency',       issues:[]},
  {id:'VPS-2025-004',customer:'NORTHERN POWERGRID (YORKSHIRE)',contact:'Sophia Wilson',  qty:18,stage:0,dispatched:'2025-11-22',receivedDate:null,          courier:'FedEx',   awb:'FX9900112',priority:'normal',sampleType:'Transformer Oil',location:'Furnace #4 Oil Tank',  notes:'Routine lubricant test — quarterly cycle',issues:[]},
  {id:'VPS-2025-005',customer:'INFINIS ENERGY SERVICES LTD',   contact:'George Harris',  qty:48,stage:1,dispatched:'2025-10-28',receivedDate:'2025-10-31',courier:'DTDC',     awb:'DT6623981',priority:'urgent',sampleType:'Turbine Oil',    location:'Turbine Hall B',       notes:'Turbine oil — critical equipment',        issues:['Wrong location reported by customer']},
  {id:'VPS-2025-006',customer:'EXXONMOBIL ASIA PACIFIC PTE LTD',contact:'Charlotte Evans',qty:30,stage:0,dispatched:'2025-11-15',receivedDate:null,         courier:'BlueDart',awb:'BD5543210',priority:'normal',sampleType:'Transformer Oil',location:'Substation 2, Section C',notes:'New site onboarding',                  issues:[]},
]

// ── Bottles helper factory ────────────────────────────────────────────────────
function mkB(batchId, num, status, extra={}) {
  return {
    id: `${batchId}-B${String(num).padStart(2,'0')}`,
    batchId, bottleNum:num, status,
    location:'', collectedDate:null, sentDate:null,
    receivedByLabDate:null, testedDate:null,
    reportId:null, technician:null,
    viscosity:null, moisture:null, acidity:null,
    result:null, recommendation:null,
    ...extra,
  }
}

// ── Bottles ───────────────────────────────────────────────────────────────────
export const INIT_BOTTLES = [
  // VPS-2025-001 — 24 bottles: 6 Report Ready, 6 Tested, 4 In Lab, 4 Sent to VPS, 4 Empty
  mkB('VPS-2025-001',1,'Report Ready',{location:'Bay A Cooling Unit 1',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'32 cSt',moisture:'18 ppm',acidity:'0.04 mgKOH/g',result:'Normal',recommendation:'No action required. Schedule next sampling in 6 months.'}),
  mkB('VPS-2025-001',2,'Report Ready',{location:'Bay A Cooling Unit 2',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'31 cSt',moisture:'17 ppm',acidity:'0.04 mgKOH/g',result:'Normal',recommendation:'No action required.'}),
  mkB('VPS-2025-001',3,'Report Ready',{location:'Bay A Cooling Unit 3',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'33 cSt',moisture:'19 ppm',acidity:'0.04 mgKOH/g',result:'Normal',recommendation:'No action required.'}),
  mkB('VPS-2025-001',4,'Report Ready',{location:'Bay A Cooling Unit 4',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'32 cSt',moisture:'20 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'No action required.'}),
  mkB('VPS-2025-001',5,'Report Ready',{location:'Bay A Cooling Unit 5',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'34 cSt',moisture:'18 ppm',acidity:'0.04 mgKOH/g',result:'Normal',recommendation:'No action required.'}),
  mkB('VPS-2025-001',6,'Report Ready',{location:'Bay A Cooling Unit 6',collectedDate:'2025-11-05',sentDate:'2025-11-07',receivedByLabDate:'2025-11-09',testedDate:'2025-11-12',reportId:'RPT-001',technician:'Dr. Mehta',viscosity:'32 cSt',moisture:'17 ppm',acidity:'0.04 mgKOH/g',result:'Normal',recommendation:'No action required.'}),
  mkB('VPS-2025-001',7,'Tested', {location:'Bay A Hot Side 1',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'35 cSt',moisture:'22 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable. Re-test in 3 months.'}),
  mkB('VPS-2025-001',8,'Tested', {location:'Bay A Hot Side 2',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'36 cSt',moisture:'23 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable.'}),
  mkB('VPS-2025-001',9,'Tested', {location:'Bay A Hot Side 3',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'35 cSt',moisture:'21 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable.'}),
  mkB('VPS-2025-001',10,'Tested',{location:'Bay A Hot Side 4',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'34 cSt',moisture:'22 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable.'}),
  mkB('VPS-2025-001',11,'Tested',{location:'Bay A Hot Side 5',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'35 cSt',moisture:'24 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable.'}),
  mkB('VPS-2025-001',12,'Tested',{location:'Bay A Hot Side 6',collectedDate:'2025-11-07',sentDate:'2025-11-10',receivedByLabDate:'2025-11-12',testedDate:'2025-11-15',technician:'Dr. Mehta',viscosity:'36 cSt',moisture:'22 ppm',acidity:'0.05 mgKOH/g',result:'Normal',recommendation:'Acceptable.'}),
  mkB('VPS-2025-001',13,'In Lab',{location:'Bay B Section 1',collectedDate:'2025-11-10',sentDate:'2025-11-13',receivedByLabDate:'2025-11-15',technician:'Dr. Mehta'}),
  mkB('VPS-2025-001',14,'In Lab',{location:'Bay B Section 2',collectedDate:'2025-11-10',sentDate:'2025-11-13',receivedByLabDate:'2025-11-15',technician:'Dr. Mehta'}),
  mkB('VPS-2025-001',15,'In Lab',{location:'Bay B Section 3',collectedDate:'2025-11-10',sentDate:'2025-11-13',receivedByLabDate:'2025-11-15',technician:'Dr. Mehta'}),
  mkB('VPS-2025-001',16,'In Lab',{location:'Bay B Section 4',collectedDate:'2025-11-10',sentDate:'2025-11-13',receivedByLabDate:'2025-11-15',technician:'Dr. Mehta'}),
  mkB('VPS-2025-001',17,'Sent to VPS',{location:'Bay B Far End 1',collectedDate:'2025-11-14',sentDate:'2025-11-18'}),
  mkB('VPS-2025-001',18,'Sent to VPS',{location:'Bay B Far End 2',collectedDate:'2025-11-14',sentDate:'2025-11-18'}),
  mkB('VPS-2025-001',19,'Sent to VPS',{location:'Bay B Far End 3',collectedDate:'2025-11-14',sentDate:'2025-11-18'}),
  mkB('VPS-2025-001',20,'Sent to VPS',{location:'Bay B Far End 4',collectedDate:'2025-11-14',sentDate:'2025-11-18'}),
  mkB('VPS-2025-001',21,'Empty'),
  mkB('VPS-2025-001',22,'Empty'),
  mkB('VPS-2025-001',23,'Empty'),
  mkB('VPS-2025-001',24,'Empty'),

  // VPS-2025-002 — 12 bottles: 4 Collected, 4 Sent to VPS, 4 Empty
  mkB('VPS-2025-002',1,'Collected',  {location:'Piston Bay 1',collectedDate:'2025-11-15'}),
  mkB('VPS-2025-002',2,'Collected',  {location:'Piston Bay 2',collectedDate:'2025-11-15'}),
  mkB('VPS-2025-002',3,'Collected',  {location:'Piston Bay 3',collectedDate:'2025-11-15'}),
  mkB('VPS-2025-002',4,'Collected',  {location:'Piston Bay 4',collectedDate:'2025-11-15'}),
  mkB('VPS-2025-002',5,'Sent to VPS',{location:'Gear Side 1',collectedDate:'2025-11-14',sentDate:'2025-11-17'}),
  mkB('VPS-2025-002',6,'Sent to VPS',{location:'Gear Side 2',collectedDate:'2025-11-14',sentDate:'2025-11-17'}),
  mkB('VPS-2025-002',7,'Sent to VPS',{location:'Gear Side 3',collectedDate:'2025-11-14',sentDate:'2025-11-17'}),
  mkB('VPS-2025-002',8,'Sent to VPS',{location:'Gear Side 4',collectedDate:'2025-11-14',sentDate:'2025-11-17'}),
  mkB('VPS-2025-002',9,'Empty'),
  mkB('VPS-2025-002',10,'Empty'),
  mkB('VPS-2025-002',11,'Empty'),
  mkB('VPS-2025-002',12,'Empty'),

  // VPS-2025-003 — 36 bottles all Empty
  ...Array.from({length:36},(_,i)=>mkB('VPS-2025-003',i+1,'Empty')),

  // VPS-2025-005 — 48 bottles: 15 Report Ready, 10 Tested, 8 In Lab, 8 Sent to VPS, 7 Empty
  ...Array.from({length:15},(_,i)=>mkB('VPS-2025-005',i+1,'Report Ready',{location:`Turbine Unit ${i+1}`,collectedDate:'2025-11-03',sentDate:'2025-11-06',receivedByLabDate:'2025-11-08',testedDate:'2025-11-11',reportId:'RPT-002',technician:'Ms. Asha',viscosity:'46 cSt',moisture:'120 ppm',acidity:'0.11 mgKOH/g',result:'Warning',recommendation:'Elevated moisture. Schedule oil change within 30 days.'})),
  ...Array.from({length:10},(_,i)=>mkB('VPS-2025-005',i+16,'Tested',{location:`Bearing Side ${i+1}`,collectedDate:'2025-11-06',sentDate:'2025-11-09',receivedByLabDate:'2025-11-12',testedDate:'2025-11-16',technician:'Ms. Asha',viscosity:'44 cSt',moisture:'95 ppm',acidity:'0.09 mgKOH/g',result:'Warning',recommendation:'Monitor closely. Re-test in 2 weeks.'})),
  ...Array.from({length:8}, (_,i)=>mkB('VPS-2025-005',i+26,'In Lab',   {location:`Outlet Point ${i+1}`,collectedDate:'2025-11-10',sentDate:'2025-11-13',receivedByLabDate:'2025-11-15',technician:'Ms. Asha'})),
  ...Array.from({length:8}, (_,i)=>mkB('VPS-2025-005',i+34,'Sent to VPS',{location:`Inlet Point ${i+1}`,collectedDate:'2025-11-14',sentDate:'2025-11-18'})),
  ...Array.from({length:7}, (_,i)=>mkB('VPS-2025-005',i+42,'Empty')),
]

// ── Reports ───────────────────────────────────────────────────────────────────
export const INIT_REPORTS = [
  {
    id:'RPT-001', batchId:'VPS-2025-001',
    bottleIds:Array.from({length:6},(_,i)=>`VPS-2025-001-B${String(i+1).padStart(2,'0')}`),
    customer:'UK POWER NETWORKS LPN', testType:'Transformer Oil Analysis',
    date:'2025-11-12', status:'Issued', technician:'Dr. Mehta',
    result:'Normal', viscosity:'32 cSt', moisture:'18 ppm', acidity:'0.04 mgKOH/g',
    recommendation:'Oil quality within acceptable limits. No action required. Schedule next sampling in 6 months.',
  },
  {
    id:'RPT-002', batchId:'VPS-2025-005',
    bottleIds:Array.from({length:15},(_,i)=>`VPS-2025-005-B${String(i+1).padStart(2,'0')}`),
    customer:'INFINIS ENERGY SERVICES LTD', testType:'Turbine Oil Analysis',
    date:'2025-11-11', status:'Draft', technician:'Ms. Asha',
    result:'Warning', viscosity:'46 cSt', moisture:'120 ppm', acidity:'0.11 mgKOH/g',
    recommendation:'Elevated moisture detected. Schedule oil change within 30 days. Retest after change.',
  },
]

// ── Alerts ────────────────────────────────────────────────────────────────────
export const INIT_ALERTS = [
  {id:'A1',type:'wrong-location',severity:'red',  batch:'VPS-2025-005',customer:'INFINIS ENERGY SERVICES LTD',  msg:'Customer self-reported collection from wrong location. Samples may need rejection.',age:'3 days'},
  {id:'A2',type:'no-acknowledge',severity:'red',  batch:'VPS-2025-006',customer:'EXXONMOBIL ASIA PACIFIC PTE LTD',msg:'Bottles dispatched 5 days ago. Customer has not acknowledged receipt in the portal.',age:'5 days'},
  {id:'A3',type:'no-collection', severity:'amber',batch:'VPS-2025-003',customer:'LIGHTSOURCE BP',               msg:'36 bottles received 4 days ago — 0 collections started. Follow-up required.',age:'4 days'},
]

// ── bottleStats helper ────────────────────────────────────────────────────────
export function bottleStats(batchId, bottles) {
  const bb = bottles.filter(b => b.batchId === batchId)
  return {
    total:       bb.length,
    empty:       bb.filter(b => b.status === 'Empty').length,
    collected:   bb.filter(b => b.status === 'Collected').length,
    inTransit:   bb.filter(b => b.status === 'Sent to VPS').length,
    inLab:       bb.filter(b => b.status === 'In Lab').length,
    tested:      bb.filter(b => b.status === 'Tested').length,
    reportReady: bb.filter(b => b.status === 'Report Ready').length,
    returned:    bb.filter(b => ['Sent to VPS','In Lab','Tested','Report Ready'].includes(b.status)).length,
  }
}
