// ── SVG Icon Library ──────────────────────────────────────────────────────────
// Each icon is a React functional component returning an inline SVG.
// Usage: <Icons.Dashboard />  or  const I = Icons.Dashboard; <I />

const s = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.8 }

export const Dashboard = () => (
  <svg {...s}>
    <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
    <rect x="14" y="3"  width="7" height="7" rx="1.5" />
    <rect x="3"  y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

export const Bottle = () => (
  <svg {...s}>
    <path d="M9 2h6M8 7V5h8v2M7 7c-1.1.5-2 1.8-2 4v7a2 2 0 002 2h10a2 2 0 002-2v-7c0-2.2-.9-3.5-2-4H7z" />
    <path d="M12 11v5M9.5 13.5h5" />
  </svg>
)

export const Dispatch = () => (
  <svg {...s}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export const Customers = () => (
  <svg {...s}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
)

export const Reports = () => (
  <svg {...s}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

export const Lab = () => (
  <svg {...s}>
    <path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z" />
  </svg>
)

export const Alerts = () => (
  <svg {...s}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

export const Settings = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

export const Plus = () => (
  <svg {...s} strokeWidth={2}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const Search = () => (
  <svg {...s}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export const X = () => (
  <svg {...s} strokeWidth={2}>
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
)

export const Check = () => (
  <svg {...s} strokeWidth={2.5}>
    <polyline points="20,6 9,17 4,12" />
  </svg>
)

export const Eye = () => (
  <svg {...s}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Truck = () => (
  <svg {...s}>
    <rect x="1" y="3" width="15" height="13" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5"  cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

export const Flask = () => (
  <svg {...s}>
    <path d="M9 2h6M10 9l-3 8a2 2 0 001.8 2.8h6.4A2 2 0 0017 17l-3-8V2h-4z" />
  </svg>
)

export const Warn = () => (
  <svg {...s}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9"  x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const Download = () => (
  <svg {...s}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export const Mail = () => (
  <svg {...s}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export const Portal = () => (
  <svg {...s}>
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
)
