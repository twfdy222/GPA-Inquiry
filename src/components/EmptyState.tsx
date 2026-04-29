import { Button } from './ui'

export function EmptyState({ onAddCourse }: { onAddCourse: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">还没有课程</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        添加一门课程后，就可以填写成绩组成、模拟目标总评，并计算 GPA。
      </p>
      <div className="mt-5">
        <Button variant="primary" onClick={onAddCourse}>
          添加第一门课程
        </Button>
      </div>
    </div>
  )
}
