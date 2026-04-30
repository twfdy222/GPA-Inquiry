import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  Download,
  GraduationCap,
  Import,
  Plus,
  RotateCcw,
  Save,
  Settings,
} from 'lucide-react'
import { CourseCard } from './components/CourseCard'
import { CourseEditor } from './components/CourseEditor'
import { EmptyState } from './components/EmptyState'
import { GpaRulesPanel } from './components/GpaRulesPanel'
import { ResultPanel } from './components/ResultPanel'
import { SummaryCards } from './components/SummaryCards'
import { Button, Notice } from './components/ui'
import { APP_VERSION, createCourse, createId } from './lib/defaults'
import { calculateCourse, calculateSummary } from './lib/grade'
import {
  createDefaultData,
  exportAppData,
  loadAppData,
  parseImportedAppData,
  saveAppData,
} from './lib/storage'
import type { AppData, Course } from './types/grade'

function App() {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    () => data.courses[0]?.id,
  )
  const [importError, setImportError] = useState<string | undefined>()
  const [rulesOpen, setRulesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const importInputRef = useRef<HTMLInputElement>(null)
  const rulesPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    saveAppData(data)
  }, [data])

  useEffect(() => {
    if (saveStatus !== 'saved') {
      return
    }

    const timer = window.setTimeout(() => setSaveStatus('idle'), 1800)
    return () => window.clearTimeout(timer)
  }, [saveStatus])

  useEffect(() => {
    if (
      selectedCourseId &&
      data.courses.some((course) => course.id === selectedCourseId)
    ) {
      return
    }

    setSelectedCourseId(data.courses[0]?.id)
  }, [data.courses, selectedCourseId])

  const summary = useMemo(
    () => calculateSummary(data.courses, data.gpaRules),
    [data.courses, data.gpaRules],
  )

  const selectedCourse = data.courses.find(
    (course) => course.id === selectedCourseId,
  )
  const selectedCalculation = selectedCourse
    ? calculateCourse(selectedCourse, data.gpaRules)
    : undefined

  const totalCredits = data.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  )

  const addCourse = () => {
    const nextCourse = createCourse()

    setData((current) => ({
      ...current,
      courses: [...current.courses, nextCourse],
    }))
    setSelectedCourseId(nextCourse.id)
  }

  const updateCourse = (nextCourse: Course) => {
    setData((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === nextCourse.id ? nextCourse : course,
      ),
    }))
  }

  const deleteCourse = (courseId: string) => {
    if (!window.confirm('确定删除这门课程吗？')) {
      return
    }

    setData((current) => ({
      ...current,
      courses: current.courses.filter((course) => course.id !== courseId),
    }))
  }

  const copySelectedCourse = () => {
    if (!selectedCourse) {
      return
    }

    const nextCourse: Course = {
      ...selectedCourse,
      id: createId('course'),
      name: `${selectedCourse.name || '未命名课程'} 副本`,
      items: selectedCourse.items.map((item) => ({
        ...item,
        id: createId('item'),
      })),
    }

    setData((current) => ({
      ...current,
      courses: [...current.courses, nextCourse],
    }))
    setSelectedCourseId(nextCourse.id)
  }

  const importData = (nextData: AppData) => {
    setData(nextData)
    setSelectedCourseId(nextData.courses[0]?.id)
  }

  const clearData = () => {
    if (!window.confirm('确定清空全部数据吗？课程和 GPA 规则都会恢复为空/默认。')) {
      return
    }

    const nextData = createDefaultData()
    setData(nextData)
    setSelectedCourseId(undefined)
    setImportError(undefined)
  }

  const saveNow = () => {
    saveAppData(data)
    setSaveStatus('saved')
  }

  const openRules = () => {
    setRulesOpen(true)
    window.setTimeout(() => {
      rulesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      importData(parseImportedAppData(text))
      setImportError(undefined)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <GraduationCap className="size-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
                GPA Inquiry 绩点计算器
              </h1>
              <p className="mt-1 text-sm text-slate-500">v{APP_VERSION}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={saveStatus === 'saved' ? 'soft' : 'ghost'}
              size="sm"
              icon={Save}
              onClick={saveNow}
            >
              {saveStatus === 'saved' ? '已保存' : '保存数据'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={() => exportAppData(data)}
            >
              导出 JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Import}
              onClick={() => importInputRef.current?.click()}
            >
              导入 JSON
            </Button>
            <Button variant="ghost" size="sm" icon={Settings} onClick={openRules}>
              设置
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <SummaryCards summary={summary} />

        {importError && <Notice tone="danger">{importError}</Notice>}

        <div className="grid gap-5 xl:grid-cols-[minmax(260px,340px)_minmax(0,1fr)_minmax(260px,300px)]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">课程列表</h2>
                <p className="mt-1 text-sm text-slate-500">
                  共 {data.courses.length} 门课程
                </p>
              </div>
              <Button variant="soft" size="sm" icon={Plus} onClick={addCourse}>
                添加课程
              </Button>
            </div>

            <div className="grid gap-3 p-3">
              {data.courses.length === 0 ? (
                <EmptyState onAddCourse={addCourse} />
              ) : (
                data.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    calculation={calculateCourse(course, data.gpaRules)}
                    selected={course.id === selectedCourseId}
                    onSelect={() => setSelectedCourseId(course.id)}
                  />
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
              <span>
                共 {data.courses.length} 门课程 · {totalCredits.toFixed(1)} 学分
              </span>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={clearData}>
                清空数据
              </Button>
            </div>
          </section>

          <CourseEditor
            course={selectedCourse}
            gpaRules={data.gpaRules}
            onChange={updateCourse}
            onAddCourse={addCourse}
          />

          <div className="xl:sticky xl:top-24 xl:self-start">
            <ResultPanel
              course={selectedCourse}
              calculation={selectedCalculation}
              onCopy={copySelectedCourse}
              onDelete={() => selectedCourse && deleteCourse(selectedCourse.id)}
            />
          </div>
        </div>

        <div ref={rulesPanelRef}>
          <GpaRulesPanel
            rules={data.gpaRules}
            isOpen={rulesOpen}
            onToggle={() => setRulesOpen((current) => !current)}
            onChange={(gpaRules) =>
              setData((current) => ({ ...current, gpaRules }))
            }
          />
        </div>
      </div>
    </main>
  )
}

export default App
