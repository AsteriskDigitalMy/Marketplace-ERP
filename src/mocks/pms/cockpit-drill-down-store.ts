import type { DrillDownNode, DrillDownRequest } from '@/models/pms/operations'
import { getStatusColor } from '@/lib/pms/traffic-light'

function metric(name: string, value: number, unit: string, category: 'progress' | 'delay' | 'performance') {
  return {
    Name: name,
    Value: value,
    Unit: unit,
    StatusColor: getStatusColor(value, category),
  }
}

const DEPARTMENTS: DrillDownNode[] = [
  {
    Id: 'd-1',
    Label: 'Cutting',
    Level: 'department',
    ParentId: null,
    Metrics: [metric('KPI Achievement', 94, '%', 'progress'), metric('Delay days', 1, 'days', 'delay')],
    Children: [
      {
        Id: 't-1',
        Label: 'Line A',
        Level: 'team',
        ParentId: 'd-1',
        Metrics: [metric('KPI Achievement', 96, '%', 'progress'), metric('Delay days', 0, 'days', 'delay')],
        Children: [
          {
            Id: 'i-1',
            Label: 'Wei Lin',
            Level: 'individual',
            ParentId: 't-1',
            EmployeeId: 'E-1001',
            EmployeeEmail: 'wei.lin@example.com',
            EmployeeTitle: 'Line Supervisor',
            Metrics: [metric('Output', 98, '%', 'progress'), metric('Quality', 97, '%', 'performance')],
          },
          {
            Id: 'i-2',
            Label: 'Anna Park',
            Level: 'individual',
            ParentId: 't-1',
            EmployeeId: 'E-1002',
            EmployeeEmail: 'anna.park@example.com',
            EmployeeTitle: 'Operator',
            Metrics: [metric('Output', 91, '%', 'progress'), metric('Quality', 94, '%', 'performance')],
          },
        ],
      },
      {
        Id: 't-2',
        Label: 'Line B',
        Level: 'team',
        ParentId: 'd-1',
        Metrics: [metric('KPI Achievement', 88, '%', 'progress'), metric('Delay days', 3, 'days', 'delay')],
        Children: [
          {
            Id: 'i-3',
            Label: 'James Wu',
            Level: 'individual',
            ParentId: 't-2',
            EmployeeId: 'E-1003',
            EmployeeEmail: 'james.wu@example.com',
            EmployeeTitle: 'Operator',
            Metrics: [metric('Output', 82, '%', 'progress'), metric('Quality', 90, '%', 'performance')],
          },
        ],
      },
    ],
  },
  {
    Id: 'd-2',
    Label: 'Sewing',
    Level: 'department',
    ParentId: null,
    Metrics: [metric('KPI Achievement', 88, '%', 'progress'), metric('Delay days', 4, 'days', 'delay')],
    Children: [
      {
        Id: 't-3',
        Label: 'Assembly 1',
        Level: 'team',
        ParentId: 'd-2',
        Metrics: [metric('KPI Achievement', 86, '%', 'progress'), metric('Delay days', 5, 'days', 'delay')],
        Children: [
          {
            Id: 'i-4',
            Label: 'Sarah Chen',
            Level: 'individual',
            ParentId: 't-3',
            EmployeeId: 'E-1004',
            EmployeeEmail: 'sarah.chen@example.com',
            EmployeeTitle: 'Team Lead',
            Metrics: [metric('Output', 89, '%', 'progress'), metric('Quality', 92, '%', 'performance')],
          },
        ],
      },
    ],
  },
  {
    Id: 'd-3',
    Label: 'Logistics',
    Level: 'department',
    ParentId: null,
    Metrics: [metric('KPI Achievement', 76, '%', 'progress'), metric('Delay days', 9, 'days', 'delay')],
    Children: [],
  },
]

function findNode(id: string, nodes: DrillDownNode[]): DrillDownNode | undefined {
  for (const node of nodes) {
    if (node.Id === id) return node
    if (node.Children) {
      const found = findNode(id, node.Children)
      if (found) return found
    }
  }
  return undefined
}

function filterByStatusBand(nodes: DrillDownNode[], band: string): DrillDownNode[] {
  const color = band as 'green' | 'yellow' | 'red'
  return nodes.filter((n) => n.Metrics.some((m) => m.StatusColor === color))
}

function filterByDataPoint(nodes: DrillDownNode[], dataPointId: string): DrillDownNode[] {
  if (!dataPointId || dataPointId === 'all') return nodes
  if (dataPointId.startsWith('status:')) {
    return filterByStatusBand(nodes, dataPointId.slice(7))
  }
  const match = nodes.find(
    (n) => n.Id === dataPointId || n.Label.toLowerCase() === dataPointId.toLowerCase(),
  )
  return match ? [match] : nodes
}

export const cockpitDrillDownStore = {
  getLevel(request: DrillDownRequest): DrillDownNode[] {
    const { Level, ParentId, DataPointId } = request

    if (Level === 1) {
      return filterByDataPoint(DEPARTMENTS, DataPointId)
    }

    if (Level === 2) {
      if (!ParentId) return []
      const parent = findNode(ParentId, DEPARTMENTS)
      return parent?.Children ?? []
    }

    if (Level === 3) {
      if (!ParentId) return []
      const parent = findNode(ParentId, DEPARTMENTS)
      return parent?.Children ?? []
    }

    return []
  },

  getRootLabel(request: DrillDownRequest): string {
    if (request.DataPointId.startsWith('status:')) {
      const band = request.DataPointId.slice(7)
      return `${band.charAt(0).toUpperCase()}${band.slice(1)} status items`
    }
    if (request.Level === 1) {
      const nodes = filterByDataPoint(DEPARTMENTS, request.DataPointId)
      return nodes[0]?.Label ?? 'Breakdown'
    }
    if (request.ParentId) {
      const node = findNode(request.ParentId, DEPARTMENTS)
      return node?.Label ?? 'Detail'
    }
    return 'Detail'
  },
}
