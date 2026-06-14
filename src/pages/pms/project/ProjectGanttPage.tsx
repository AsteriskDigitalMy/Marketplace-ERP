import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AsyncState } from '@/components/pms/AsyncState'
import { GanttChart } from '@/components/pms/project/GanttChart'
import { fetchGanttTasks } from '@/services/pms/project/project-service'
import type { GanttTaskRow, ProjectRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

export default function ProjectGanttPage() {
  const { project } = useOutletContext<OutletCtx>()
  const [tasks, setTasks] = useState<GanttTaskRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setTasks(await fetchGanttTasks(project.Id))
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="type-section-title">Gantt chart</h3>
        {tasks.length === 0 ? (
          <Link
            to={`/pms/projects/${project.Id}/tasks`}
            className="text-sm text-primary underline"
          >
            Create tasks
          </Link>
        ) : null}
      </div>
      <AsyncState loading={loading}>
        <GanttChart tasks={tasks} />
      </AsyncState>
    </div>
  )
}
