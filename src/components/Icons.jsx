// ── Icons.jsx — Lucide React icon wrappers ────────────────────────────────────
// All icons use lucide-react only. No custom SVGs anywhere.

import React from 'react'
import {
  LayoutDashboard, FlaskConical, Truck as LucideTruck, RotateCcw,
  TestTube, FileText, Users, LogIn, Bell, Settings as LucideSettings,
  Plus as LucidePlus, Search as LucideSearch, X as LucideX,
  Check as LucideCheck, Eye as LucideEye, Download as LucideDownload,
  AlertTriangle, Mail as LucideMail, ChevronRight as LucideChevronRight,
  ChevronDown as LucideChevronDown, ArrowUp as LucideArrowUp,
  ArrowRight as LucideArrowRight, LogOut, Activity as LucideActivity,
  Filter as LucideFilter, Pencil, Trash2, Save as LucideSave,
  Info as LucideInfo, User as LucideUser, Package, Camera as LucideCamera,
  ScanBarcode as LucideScanBarcode, Scan as LucideScan,
  ClipboardList as LucideClipboardList, CheckCircle2 as LucideCheckCircle2,
  Clock as LucideClock, XCircle as LucideXCircle, RefreshCw as LucideRefreshCw,
  PackageCheck as LucidePackageCheck, SendHorizonal as LucideSend,
  Maximize2 as LucideMaximize2, BarChart2 as LucideBarChart2,
  Usb as LucideUsb,
} from 'lucide-react'

const wrap = (Icon, overrides = {}) => (props) => (
  <Icon size={18} strokeWidth={1.8} {...overrides} {...props} />
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
export const Plus         = wrap(LucidePlus,    { strokeWidth: 2 })
export const Search       = wrap(LucideSearch)
export const X            = wrap(LucideX,       { strokeWidth: 2 })
export const Check        = wrap(LucideCheck,   { strokeWidth: 2.5 })
export const Eye          = wrap(LucideEye)
export const Download     = wrap(LucideDownload)
export const Warn         = wrap(AlertTriangle)
export const Mail         = wrap(LucideMail)
export const ChevronRight = wrap(LucideChevronRight)
export const ChevronDown  = wrap(LucideChevronDown)
export const ArrowUp      = wrap(LucideArrowUp)
export const Logout       = wrap(LogOut)
export const Activity     = wrap(LucideActivity)
export const Dispatch     = wrap(LucideArrowRight)
export const Filter       = wrap(LucideFilter)
export const Edit         = wrap(Pencil)
export const Trash        = wrap(Trash2)
export const Save         = wrap(LucideSave)
export const Info         = wrap(LucideInfo)
export const User         = wrap(LucideUser)
export const Camera       = wrap(LucideCamera)
export const ScanBarcode  = wrap(LucideScanBarcode)
export const Scan         = wrap(LucideScan)
export const UsbScanner   = wrap(LucideUsb)
export const ClipboardList = wrap(LucideClipboardList)
export const CheckCircle  = wrap(LucideCheckCircle2)
export const Clock        = wrap(LucideClock)
export const XCircle      = wrap(LucideXCircle)
export const RefreshCw    = wrap(LucideRefreshCw)
export const PackageCheck = wrap(LucidePackageCheck)
export const Send         = wrap(LucideSend)
export const Maximize     = wrap(LucideMaximize2)
export const BarChart2    = wrap(LucideBarChart2)
