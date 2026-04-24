import React, { useState } from 'react'
import { fmtDate } from '../utils/constants'
import { SearchBar, useSortPage, SortTh, Pagination } from '../components/UI'
import * as Icons from '../components/Icons'

const PAGE_SIZE = 15

export default function Reports({ reports, setReports, batches, bottles, setBottles, isCustomer = false }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [pageSize, setPageSize] = useState(15)

  const baseFiltered = reports.filter(r => {
    if (isCustomer && r.status === 'Draft') return false
    return !search ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      (r.result||'').toLowerCase().includes(search.toLowerCase())
  })

  const { paged, sortKey, sortDir, toggleSort, page, setPage, totalPages } =
    useSortPage(baseFiltered, { key: 'date', dir: 'desc' }, pageSize)

  function issueReport(id) {
    const report = reports.find(r => r.id === id)
    setReports(p => p.map(r => r.id === id ? {...r, status:'Issued'} : r))
    if (report?.bottleIds?.length) {
      setBottles(p => p.map(b => report.bottleIds.includes(b.id) ? {...b, status:'Report Ready'} : b))
    }
  }

  const sel = selected ? reports.find(r => r.id === selected) : null

  const RESULT_STYLE = {
    Normal:   { bg:'rgba(10,124,82,0.08)',  border:'rgba(10,124,82,0.3)',  color:'var(--green)'  },
    Warning:  { bg:'rgba(201,122,6,0.08)',  border:'rgba(201,122,6,0.3)',  color:'var(--amber)'  },
    Critical: { bg:'rgba(212,42,42,0.08)',  border:'rgba(212,42,42,0.3)',  color:'var(--red)'    },
  }

  const TH = ({ label, sk }) => (
    <SortTh label={label} sortKey={sk} active={sortKey===sk} dir={sortDir} onSort={toggleSort} />
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-tag">{isCustomer ? 'My Reports' : 'Operations'}</div>
          <div className="page-header-title">Reports</div>
          <div className="page-header-sub">{isCustomer ? 'Your lab reports for tested samples' : 'View and issue lab reports for tested samples'}</div>
        </div>
      </div>

      <div className="chip-row">
        {[
          {label:'Total',  val: isCustomer ? reports.filter(r=>r.status!=='Draft').length : reports.length, color:'var(--accent)', cls:'chip-accent'},
          ...(!isCustomer ? [{label:'Draft', val:reports.filter(r=>r.status==='Draft').length, color:'var(--blue)', cls:'chip-blue'}] : []),
          {label:'Issued', val:reports.filter(r=>r.status==='Issued').length, color:'var(--green)', cls:'chip-green'},
        ].map(s => (
          <div key={s.label} className="summary-chip">
            <span className="summary-chip-val" style={{color:s.color}}>{s.val}</span>
            <div className="summary-chip-divider" />
            <span className="summary-chip-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{marginBottom:14}}><SearchBar value={search} onChange={setSearch} placeholder="Search reports…"/></div>

      <div className="grid-2" style={{gap:18,alignItems:'start'}}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <TH label="Report ID" sk="id" />
                {!isCustomer && <TH label="Customer" sk="customer" />}
                <TH label="Date"   sk="date" />
                <TH label="Result" sk="result" />
                <TH label="Status" sk="status" />
                <th>Btl</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id}
                  style={{cursor:'pointer', background:selected===r.id?'rgba(232,93,10,0.04)':''}}
                  onClick={() => setSelected(selected===r.id ? null : r.id)}>
                  <td><span className="mono" style={{fontSize:11,color:'var(--accent)',fontWeight:600}}>{r.id}</span></td>
                  {!isCustomer && <td style={{fontSize:12}}>{r.customer?.split(' ').slice(0,2).join(' ')}</td>}
                  <td style={{fontSize:11,fontFamily:'var(--font-mono)'}}>{fmtDate(r.date)}</td>
                  <td><span className={`badge badge-${r.result==='Normal'?'green':r.result==='Warning'?'amber':'red'}`}>{r.result||'—'}</span></td>
                  <td><span className={`badge badge-${r.status==='Issued'?'green':'blue'}`}>{r.status}</span></td>
                  <td style={{fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)'}}>{r.bottleIds?.length||0}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={isCustomer ? 5 : 6} style={{textAlign:'center',padding:'32px',color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:12}}>No reports found</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={baseFiltered.length} pageSize={pageSize} onPageSizeChange={setPageSize} />
        </div>

        {/* Detail Panel */}
        {sel ? (
          <div className="card" style={{position:'sticky',top:0}}>
            <div className="card-header">
              <span className="card-title" style={{fontFamily:'var(--font-mono)',fontSize:12,letterSpacing:'0.5px'}}>{sel.id}</span>
              <span className={`badge badge-${sel.status==='Issued'?'green':'blue'}`}>{sel.status}</span>
            </div>
            <div style={{marginBottom:14,padding:'10px 12px',borderRadius:'var(--r-xs)',background:'var(--bg)',border:'var(--rule)'}}>
              <div className="info-label">Customer</div>
              <div style={{fontWeight:600,fontSize:13.5}}>{sel.customer}</div>
            </div>
            <div className="grid-2" style={{gap:8,marginBottom:14}}>
              {[
                {l:'Test Type',  v:sel.testType},
                {l:'Technician', v:sel.technician},
                {l:'Date',       v:fmtDate(sel.date)},
                {l:'Bottles',    v:sel.bottleIds?.length||0},
                {l:'Viscosity',  v:sel.viscosity||'—'},
                {l:'Moisture',   v:sel.moisture||'—'},
                {l:'Acidity',    v:sel.acidity||'—'},
              ].map(({l,v}) => (
                <div key={l} style={{padding:'9px 11px',background:'var(--bg)',borderRadius:'var(--r-xs)',border:'var(--rule)'}}>
                  <div className="info-label">{l}</div>
                  <div style={{fontSize:12.5,fontWeight:600,fontFamily:['Date','Viscosity','Moisture','Acidity'].includes(l)?'var(--font-mono)':'inherit'}}>{v}</div>
                </div>
              ))}
            </div>
            {sel.result && (() => {
              const rs = RESULT_STYLE[sel.result] || RESULT_STYLE.Normal
              return (
                <div style={{padding:'11px 14px',borderRadius:'var(--r-xs)',marginBottom:14,background:rs.bg,border:`1.5px solid ${rs.border}`,borderLeft:`3px solid ${rs.color}`,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:8,height:8,borderRadius:1,background:rs.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:rs.color,textTransform:'uppercase',letterSpacing:'0.5px'}}>Result: {sel.result}</span>
                </div>
              )
            })()}
            {sel.recommendation && (
              <div style={{marginBottom:14}}>
                <div className="info-label" style={{marginBottom:5}}>Recommendation</div>
                <div style={{fontSize:12.5,lineHeight:1.6,color:'var(--text-secondary)',background:'var(--bg)',padding:'10px 12px',borderRadius:'var(--r-xs)',border:'var(--rule)'}}>{sel.recommendation}</div>
              </div>
            )}
            {sel.status==='Draft' && !isCustomer && (
              <button className="btn btn-success w-full" onClick={() => issueReport(sel.id)}>Issue Report to Customer</button>
            )}
          </div>
        ) : (
          <div className="card" style={{textAlign:'center',padding:'52px 24px'}}>
            <div style={{fontSize:32,marginBottom:12,opacity:0.3}}>◧</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>Select a Report</div>
            <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{isCustomer ? 'Click any row to view your report details.' : 'Click any row to view details and issue to customer.'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
