export interface BreadcrumbItem {
  label: string
  href?: string
}

const SEGMENT_LABELS: Record<string, string> = {
  pms: 'PMS',
  admin: 'System Basic Management',
  org: 'Organization',
  accounts: 'Accounts',
  roles: 'Roles',
  dictionaries: 'Dictionaries',
  logs: 'Operation Logs',
  parameters: 'Parameters',
  cockpit: 'KPI Cockpit',
  alerts: 'Alerts',
  appraisal: 'Performance Appraisal',
  pdca: 'PDCA Improvement',
  proposals: 'Proposals',
  execution: 'Execution',
  schemes: 'Appraisal Schemes',
  'traffic-lights': 'Traffic Lights',
  kpi: 'KPI Indicator Library',
  indicators: 'Indicators',
  calculation: 'KPI Calculation',
  jobs: 'Calculation Jobs',
  recalculate: 'Manual Re-calculation',
  history: 'Re-calculation History',
  projects: 'Project Management',
  approvals: 'Initiation Approvals',
  'acceptance-reviews': 'Acceptance Reviews',
  tasks: 'Tasks',
  my: 'My Tasks',
  'data-collection': 'Data Collection',
  rules: 'Filling Rules',
  reviews: 'Data Review',
  fill: 'Data Fill',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  reports: 'Reports',
  settings: 'Settings',
  pdm: 'PDM',
  scm: 'SCM',
  mes: 'MES',
  wms: 'WMS',
  sap: 'SAP',
  bi: 'BI',
  portal: 'Customer Portal',
  designs: 'Designs',
  sampling: 'Sampling',
  finalization: 'Finalization',
  processes: 'Process Library',
  'working-hours': 'Working Hours',
  routing: 'Routing',
  bom: 'BOM',
  'cost-pricing': 'Cost & Pricing',
  changes: 'Changes',
  suppliers: 'Suppliers',
  procurement: 'Procurement',
  'purchase-orders': 'Purchase Orders',
  scheduling: 'Scheduling',
  subcontracting: 'Subcontracting',
  'import-export': 'Import / Export',
  'work-orders': 'Work Orders',
  cutting: 'Cutting',
  sewing: 'Sewing',
  'post-processing': 'Post-processing',
  traceability: 'Traceability',
  quality: 'Quality',
  rework: 'Rework',
  equipment: 'Equipment',
  tooling: 'Tooling',
  personnel: 'Personnel',
  wages: 'Wages',
  costs: 'Costs',
  pad: 'Pad Home',
  pda: 'PDA Home',
  locations: 'Locations',
  materials: 'Materials',
  strategies: 'Strategies',
  inbound: 'Inbound',
  outbound: 'Outbound',
  transfers: 'Transfers',
  batches: 'Batches',
  reservations: 'Reservations',
  'stock-taking': 'Stock-taking',
  config: 'Integration Config',
  'master-data': 'Master Data Sync',
  p2p: 'P2P (AP)',
  o2c: 'O2C (AR)',
  costing: 'Production Costing',
  exceptions: 'Exceptions',
  executive: 'Executive Cockpit',
  operations: 'Operations',
  finance: 'Finance',
  kanban: 'Kanban',
  workshop: 'Workshop Kanban',
  warehouse: 'Warehouse Kanban',
  designer: 'Report Designer',
  new: 'Create',
  edit: 'Edit',
  import: 'Import',
  formula: 'Formula Editor',
}

const MODULE_ROOTS: { prefix: string; label: string; href: string }[] = [
  { prefix: '/pms/admin', label: 'System Basic Management', href: '/pms/admin/org' },
  { prefix: '/pms/kpi', label: 'KPI Indicator Library', href: '/pms/kpi/indicators' },
  { prefix: '/pms/projects', label: 'Project Management', href: '/pms/projects' },
  { prefix: '/pms/tasks', label: 'Project Management', href: '/pms/projects' },
  { prefix: '/pms/data-collection', label: 'Data Collection', href: '/pms/data-collection/my-tasks' },
  { prefix: '/pms/cockpit', label: 'KPI Visualization', href: '/pms/cockpit' },
  { prefix: '/pms/alerts', label: 'Exception Alerts', href: '/pms/alerts' },
  { prefix: '/pms/appraisal', label: 'Performance Appraisal', href: '/pms/appraisal/schemes' },
  { prefix: '/pms/pdca', label: 'PDCA Improvement', href: '/pms/pdca/proposals' },
  { prefix: '/pms/reports', label: 'Report Center', href: '/pms/reports' },
  { prefix: '/pms/settings', label: 'PMS Settings', href: '/pms/settings/traffic-lights' },
  { prefix: '/pdm', label: 'Product Data (PDM)', href: '/pdm' },
  { prefix: '/scm', label: 'Supply Chain (SCM)', href: '/scm' },
  { prefix: '/mes', label: 'Manufacturing (MES)', href: '/mes' },
  { prefix: '/wms', label: 'Warehouse (WMS)', href: '/wms' },
  { prefix: '/sap', label: 'SAP Integration', href: '/sap' },
  { prefix: '/bi', label: 'Business Intelligence', href: '/bi' },
  { prefix: '/portal', label: 'Customer Portal', href: '/portal/orders' },
]

function labelForSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  if (/^[0-9a-f-]{36}$/i.test(segment)) return 'Details'
  if (segment.length > 16) return `${segment.slice(0, 8)}…`
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

function isIdSegment(segment: string): boolean {
  return /^[0-9a-f-]{8,}$/i.test(segment) || segment.startsWith('ORD-') || segment.startsWith('CUS-')
}

export function buildBreadcrumbs(pathname: string, pageTitle: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]

  if (pathname === '/') {
    return [{ label: 'Home' }]
  }

  if (pathname === '/pms') {
    crumbs.push({ label: 'PMS' })
    return crumbs
  }

  const erpModule = MODULE_ROOTS.find(
    (m) => m.prefix !== '/pms/admin' && pathname.startsWith(m.prefix) && !pathname.startsWith('/pms'),
  )
  if (erpModule && !pathname.startsWith('/pms')) {
    crumbs.push({ label: erpModule.label, href: erpModule.href })
    const segments = pathname.split('/').filter(Boolean)
    const tail = segments.slice(1)
    let path = `/${segments[0]}`
    for (let i = 0; i < tail.length; i++) {
      const segment = tail[i]
      path += `/${segment}`
      const isLast = i === tail.length - 1
      if (isLast) break
      if (isIdSegment(segment)) continue
      crumbs.push({ label: labelForSegment(segment), href: path })
    }
    crumbs.push({ label: pageTitle })
    return crumbs
  }

  if (pathname.startsWith('/pms')) {
    crumbs.push({ label: 'PMS', href: '/pms' })
    const module = MODULE_ROOTS.find((m) => pathname.startsWith(m.prefix))
    if (module && !pathname.startsWith('/pms/kpi/calculation')) {
      crumbs.push({ label: module.label, href: module.href })
    }

    if (pathname.startsWith('/pms/kpi/calculation')) {
      crumbs.push({ label: 'KPI Indicator Library', href: '/pms/kpi/indicators' })
      crumbs.push({ label: 'KPI Calculation', href: '/pms/kpi/calculation/jobs' })
    }

    const segments = pathname.split('/').filter(Boolean)
    const tail = segments.slice(2)
    let path = `/${segments[0]}/${segments[1]}`

    for (let i = 0; i < tail.length; i++) {
      const segment = tail[i]
      path += `/${segment}`
      const isLast = i === tail.length - 1
      if (isLast) break
      if (isIdSegment(segment)) continue
      if (pathname.startsWith('/pms/kpi/calculation') && segment === 'calculation') continue
      crumbs.push({ label: labelForSegment(segment), href: path })
    }

    crumbs.push({ label: pageTitle })
    return crumbs
  }

  const segments = pathname.split('/').filter(Boolean)
  let path = ''
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    path += `/${segment}`
    const isLast = i === segments.length - 1
    if (isLast) {
      crumbs.push({ label: pageTitle })
    } else {
      crumbs.push({ label: labelForSegment(segment), href: path })
    }
  }

  return crumbs
}
