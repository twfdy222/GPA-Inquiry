import { Archive, Edit3, Plus, Rows3 } from 'lucide-react'
import type { AppViewMode, Semester } from '../types/grade'
import { Button, SegmentedControl } from './ui'

type SemesterBarProps = {
  semesters: Semester[]
  currentSemesterId: string
  viewMode: AppViewMode
  onSemesterChange: (semesterId: string) => void
  onViewModeChange: (mode: AppViewMode) => void
  onAddSemester: () => void
  onRenameSemester: () => void
  onArchiveSemester: () => void
}

export function SemesterBar({
  semesters,
  currentSemesterId,
  viewMode,
  onSemesterChange,
  onViewModeChange,
  onAddSemester,
  onRenameSemester,
  onArchiveSemester,
}: SemesterBarProps) {
  const activeSemesters = semesters.filter((semester) => !semester.archivedAt)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Rows3 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">学期工作台</h2>
            <p className="mt-1 text-sm text-slate-500">
              当前学期用于新增课程，全局视图用于查看累计表现。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentSemesterId}
            onChange={(event) => onSemesterChange(event.target.value)}
            className="h-10 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            aria-label="选择当前学期"
          >
            {activeSemesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>

          <SegmentedControl<AppViewMode>
            value={viewMode}
            options={[
              { value: 'current', label: '当前学期' },
              { value: 'all', label: '全部课程' },
            ]}
            onChange={onViewModeChange}
          />

          <Button variant="soft" size="sm" icon={Plus} onClick={onAddSemester}>
            新学期
          </Button>
          <Button variant="ghost" size="icon" icon={Edit3} aria-label="重命名学期" onClick={onRenameSemester} />
          <Button variant="ghost" size="icon" icon={Archive} aria-label="归档学期" onClick={onArchiveSemester} />
        </div>
      </div>
    </section>
  )
}
