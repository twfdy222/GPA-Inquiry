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
    <section className="dashboard-panel dashboard-panel--semester p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-brand-50 text-brand-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Rows3 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="panel-kicker">学期与视图</div>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">学期工作台</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              当前学期用于新增和编辑课程，切换到“全部课程”时可以查看跨学期的累计表现。
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentSemesterId}
              onChange={(event) => onSemesterChange(event.target.value)}
              className="min-h-11 min-w-[180px] rounded-full border border-slate-200/90 bg-white/84 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="soft" size="sm" icon={Plus} onClick={onAddSemester}>
              新建学期
            </Button>
            <Button variant="ghost" size="icon" icon={Edit3} aria-label="重命名学期" onClick={onRenameSemester} />
            <Button variant="ghost" size="icon" icon={Archive} aria-label="归档学期" onClick={onArchiveSemester} />
          </div>
        </div>
      </div>
    </section>
  )
}
