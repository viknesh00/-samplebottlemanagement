// ── Icons.jsx — Lucide React icon wrappers ────────────────────────────────────
// Replaces all custom SVG icons with lucide-react equivalents.
// Each export matches the original API (no-arg React component returning JSX).
// Requires: npm install lucide-react

import React from 'react'
import {
  LayoutDashboard,
  FlaskConical,
  Truck as LucideTruck,
  RotateCcw,
  TestTube,
  FileText,
  Users,
  LogIn,
  Bell,
  Settings as LucideSettings,
  Plus as LucidePlus,
  Search as LucideSearch,
  X as LucideX,
  Check as LucideCheck,
  Eye as LucideEye,
  Download as LucideDownload,
  AlertTriangle,
  Mail as LucideMail,
  ChevronRight as LucideChevronRight,
  ArrowUp as LucideArrowUp,
  LogOut,
  Activity as LucideActivity,
  ArrowRight,
  Filter as LucideFilter,
  Pencil,
  Trash2,
  Save as LucideSave,
  Info as LucideInfo,
  User as LucideUser,
  Package,
} from 'lucide-react'

// Helper: wraps a Lucide icon with default size/strokeWidth
const wrap = (Icon, overrides = {}) => () => (
  <Icon size={18} strokeWidth={1.8} {...overrides} />
)

export const Dashboard    = wrap(LayoutDashboard)
export const Bottle       = wrap(Package)
export const Truck        = wrap(LucideTruck)
export const Return       = wrap(RotateCcw)
export const Sample       = wrap(TestTube)
export const Lab          = wrap(FlaskConical)
export const Flask        = wrap(FlaskConical)
export const Reports      = wrap(FileText)
export const Customers    = wrap(Users)
export const Portal       = wrap(LogIn)
export const Alerts       = wrap(Bell)
export const Settings     = wrap(LucideSettings)
export const Plus         = wrap(LucidePlus,        { strokeWidth: 2 })
export const Search       = wrap(LucideSearch)
export const X            = wrap(LucideX,           { strokeWidth: 2 })
export const Check        = wrap(LucideCheck,       { strokeWidth: 2.5 })
export const Eye          = wrap(LucideEye)
export const Download     = wrap(LucideDownload)
export const Warn         = wrap(AlertTriangle)
export const Mail         = wrap(LucideMail)
export const ChevronRight = wrap(LucideChevronRight)
export const ArrowUp      = wrap(LucideArrowUp)
export const Logout       = wrap(LogOut)
export const Activity     = wrap(LucideActivity)
export const Dispatch     = wrap(ArrowRight)
export const Filter       = wrap(LucideFilter)
export const Edit         = wrap(Pencil)
export const Trash        = wrap(Trash2)
export const Save         = wrap(LucideSave)
export const Info         = wrap(LucideInfo)
export const User         = wrap(LucideUser)
