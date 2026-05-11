import { Button } from './ui'

export function EmptyState({ onAddCourse }: { onAddCourse: () => void }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[rgba(191,211,238,0.9)] bg-white/62 p-8 text-center">
      <div className="panel-kicker">课程列表</div>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">还没有课程</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
        添加第一门课程后，就可以填写成绩构成、设置目标总评，并开始查看 GPA 与风险提示。
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={onAddCourse}>
          添加第一门课程
        </Button>
      </div>
    </div>
  )
}
