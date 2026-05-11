import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  Download,
  FileSpreadsheet,
  GraduationCap,
  Import,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Upload,
} from 'lucide-react'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { CourseCard } from './components/CourseCard'
import { CourseEditor } from './components/CourseEditor'
import { EmptyState } from './components/EmptyState'
import { GpaRulesPanel } from './components/GpaRulesPanel'
import { ResultPanel } from './components/ResultPanel'
import { SemesterBar } from './components/SemesterBar'
import { SummaryCards } from './components/SummaryCards'
import { Button, Notice } from './components/ui'
import {
  APP_VERSION,
  DEFAULT_SEMESTER_ID,
  createCourse,
  createDefaultData,
  createGradeItem,
  createId,
  createSemester,
  nowIso,
} from './lib/defaults'
import { calculateCourse, calculateSummary } from './lib/grade'
import {
  exportAppData,
  loadAppData,
  parseImportedAppData,
  saveAppData,
} from './lib/storage'
import {
  getCreditDistribution,
  getCurrentSemester,
  getRiskCourses,
  getSemesterSummaries,
  getVisibleCourses,
} from './lib/selectors'
import {
  exportCsv,
  exportXlsx,
  previewTabularImport,
  type ImportPreview,
} from './lib/tabular'
import type { AppData, AppViewMode, Course } from './types/grade'

function sortCourses(courses: Course[]) {
  return [...courses].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

function App() {
  const [data, setData] = useState<AppData>()
  const [viewMode, setViewMode] = useState<AppViewMode>('current')
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()
  const [importError, setImportError] = useState<string | undefined>()
  const [importPreview, setImportPreview] = useState<ImportPreview | undefined>()
  const [rulesOpen, setRulesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const importInputRef = useRef<HTMLInputElement>(null)
  const tableInputRef = useRef<HTMLInputElement>(null)
  const rulesPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    loadAppData()
      .then((nextData) => {
        if (!isMounted) {
          return
        }

        setData(nextData)
        setSelectedCourseId(nextData.courses[0]?.id)
      })
      .catch((error) => {
        setImportError(error instanceof Error ? error.message : '加载本地数据失败。')
        const fallbackData = createDefaultData()
        setData(fallbackData)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!data) {
      return
    }

    void saveAppData(data).catch(() => setSaveStatus('error'))
  }, [data])

  useEffect(() => {
    if (saveStatus !== 'saved' && saveStatus !== 'error') {
      return
    }

    const timer = window.setTimeout(() => setSaveStatus('idle'), 1800)
    return () => window.clearTimeout(timer)
  }, [saveStatus])

  const visibleCourses = useMemo(() => {
    if (!data) {
      return []
    }

    return sortCourses(getVisibleCourses(data, viewMode))
  }, [data, viewMode])

  useEffect(() => {
    if (!data) {
      return
    }

    if (selectedCourseId && visibleCourses.some((course) => course.id === selectedCourseId)) {
      return
    }

    setSelectedCourseId(visibleCourses[0]?.id)
  }, [data, selectedCourseId, visibleCourses])

  const selectedCourse = data?.courses.find((course) => course.id === selectedCourseId)
  const selectedCalculation =
    selectedCourse && data ? calculateCourse(selectedCourse, data.gpaRules) : undefined
  const summary = useMemo(
    () => (data ? calculateSummary(visibleCourses, data.gpaRules) : calculateSummary([], [])),
    [data, visibleCourses],
  )
  const currentSemester = data ? getCurrentSemester(data) : undefined
  const semesterSummaries = data ? getSemesterSummaries(data) : []
  const creditDistribution = getCreditDistribution(visibleCourses)
  const riskCourses = data ? getRiskCourses(data, visibleCourses) : []
  const plannedCredits = visibleCourses.reduce((sum, course) => sum + course.credits, 0)

  const updateData = (updater: (current: AppData) => AppData) => {
    setData((current) => (current ? updater(current) : current))
  }

  const addSemester = () => {
    updateData((current) => {
      const semester = createSemester(`新学期 ${current.semesters.length + 1}`, current.semesters.length)
      setSelectedCourseId(undefined)
      setViewMode('current')

      return {
        ...current,
        semesters: [...current.semesters, semester],
        currentSemesterId: semester.id,
      }
    })
  }

  const renameSemester = () => {
    if (!data || !currentSemester) {
      return
    }

    const nextName = window.prompt('请输入新的学期名称', currentSemester.name)?.trim()

    if (!nextName) {
      return
    }

    updateData((current) => ({
      ...current,
      semesters: current.semesters.map((semester) =>
        semester.id === current.currentSemesterId
          ? { ...semester, name: nextName, updatedAt: nowIso() }
          : semester,
      ),
    }))
  }

  const archiveSemester = () => {
    if (!data || !currentSemester) {
      return
    }

    const activeSemesters = data.semesters.filter((semester) => !semester.archivedAt)

    if (activeSemesters.length <= 1) {
      window.alert('至少保留一个可用学期。')
      return
    }

    if (!window.confirm(`确定归档“${currentSemester.name}”吗？课程会保留在全部视图中。`)) {
      return
    }

    updateData((current) => {
      const nextCurrent =
        current.semesters.find(
          (semester) => semester.id !== current.currentSemesterId && !semester.archivedAt,
        )?.id ?? DEFAULT_SEMESTER_ID

      setSelectedCourseId(undefined)

      return {
        ...current,
        currentSemesterId: nextCurrent,
        semesters: current.semesters.map((semester) =>
          semester.id === current.currentSemesterId
            ? { ...semester, archivedAt: nowIso(), updatedAt: nowIso() }
            : semester,
        ),
      }
    })
  }

  const changeCurrentSemester = (semesterId: string) => {
    updateData((current) => ({ ...current, currentSemesterId: semesterId }))
    setSelectedCourseId(undefined)
    setViewMode('current')
  }

  const addCourse = () => {
    updateData((current) => {
      const course = createCourse(current.currentSemesterId, current.courses.length)
      setSelectedCourseId(course.id)
      setViewMode('current')

      return {
        ...current,
        courses: [...current.courses, course],
      }
    })
  }

  const updateCourse = (nextCourse: Course) => {
    updateData((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === nextCourse.id ? { ...nextCourse, updatedAt: nowIso() } : course,
      ),
    }))
  }

  const deleteCourse = (courseId: string) => {
    if (!window.confirm('确定删除这门课程吗？')) {
      return
    }

    updateData((current) => ({
      ...current,
      courses: current.courses.filter((course) => course.id !== courseId),
    }))
  }

  const copySelectedCourse = () => {
    if (!selectedCourse) {
      return
    }

    const course: Course = {
      ...selectedCourse,
      id: createId('course'),
      name: `${selectedCourse.name || '未命名课程'} 副本`,
      sortOrder: Date.now(),
      updatedAt: nowIso(),
      items: selectedCourse.items.map((item) => ({
        ...item,
        id: createId('item'),
      })),
    }

    updateData((current) => ({
      ...current,
      courses: [...current.courses, course],
    }))
    setSelectedCourseId(course.id)
  }

  const importData = (nextData: AppData) => {
    setData(nextData)
    setSelectedCourseId(nextData.courses[0]?.id)
    setImportPreview(undefined)
  }

  const clearData = () => {
    if (!window.confirm('确定清空全部数据吗？课程和 GPA 规则都会恢复为空或默认。')) {
      return
    }

    const nextData = createDefaultData()
    setData(nextData)
    setSelectedCourseId(undefined)
    setImportError(undefined)
    setImportPreview(undefined)
  }

  const saveNow = () => {
    if (!data) {
      return
    }

    void saveAppData(data)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('error'))
  }

  const openRules = () => {
    setRulesOpen(true)
    window.setTimeout(() => {
      rulesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const handleJsonImport = async (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleTableImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !data) {
      return
    }

    try {
      const semesterNameToId = new Map(data.semesters.map((semester) => [semester.name, semester.id]))
      const preview = await previewTabularImport(file, semesterNameToId, data.currentSemesterId)
      setImportPreview(preview)
      setImportError(undefined)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '表格导入失败。')
    } finally {
      event.target.value = ''
    }
  }

  const confirmTableImport = () => {
    if (!importPreview || !data) {
      return
    }

    if (importPreview.errors.length > 0) {
      setImportError('请先修正表格错误后再导入。')
      return
    }

    updateData((current) => ({
      ...current,
      courses: [...current.courses, ...importPreview.courses],
    }))
    setSelectedCourseId(importPreview.courses[0]?.id)
    setImportPreview(undefined)
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 text-ink">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-soft">
          正在加载本地成绩数据...
        </div>
      </main>
    )
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
                GPA Inquiry 成绩工作台
              </h1>
              <p className="mt-1 text-sm text-slate-500">v{APP_VERSION}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={saveStatus === 'saved' ? 'soft' : saveStatus === 'error' ? 'danger' : 'ghost'}
              size="sm"
              icon={Save}
              onClick={saveNow}
            >
              {saveStatus === 'saved' ? '已保存' : saveStatus === 'error' ? '保存失败' : '保存数据'}
            </Button>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => exportAppData(data)}>
              导出 JSON
            </Button>
            <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={() => exportCsv(data, visibleCourses)}>
              导出 CSV
            </Button>
            <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={() => void exportXlsx(data, visibleCourses)}>
              导出 XLSX
            </Button>
            <Button variant="ghost" size="sm" icon={Import} onClick={() => importInputRef.current?.click()}>
              导入 JSON
            </Button>
            <Button variant="ghost" size="sm" icon={Upload} onClick={() => tableInputRef.current?.click()}>
              导入表格
            </Button>
            <Button variant="ghost" size="sm" icon={Settings} onClick={openRules}>
              设置
            </Button>
            <input ref={importInputRef} type="file" accept="application/json" onChange={handleJsonImport} className="hidden" />
            <input ref={tableInputRef} type="file" accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={handleTableImport} className="hidden" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <SummaryCards summary={summary} />

        <SemesterBar
          semesters={data.semesters}
          currentSemesterId={data.currentSemesterId}
          viewMode={viewMode}
          onSemesterChange={changeCurrentSemester}
          onViewModeChange={setViewMode}
          onAddSemester={addSemester}
          onRenameSemester={renameSemester}
          onArchiveSemester={archiveSemester}
        />

        {importError && <Notice tone="danger">{importError}</Notice>}
        {importPreview && (
          <Notice tone={importPreview.errors.length > 0 ? 'danger' : 'success'}>
            表格预览：识别到 {importPreview.courses.length} 门课程
            {importPreview.errors.length > 0
              ? `，发现 ${importPreview.errors.length} 个错误：${importPreview.errors.slice(0, 3).join('；')}`
              : '，确认后会追加到当前数据中。'}
            <span className="ml-3 inline-flex gap-2">
              <button className="font-semibold text-brand-700 underline" type="button" onClick={confirmTableImport}>
                确认导入
              </button>
              <button className="font-semibold text-slate-600 underline" type="button" onClick={() => setImportPreview(undefined)}>
                取消
              </button>
            </span>
          </Notice>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(260px,340px)_minmax(0,1fr)_minmax(260px,300px)]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">课程列表</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {viewMode === 'current' ? currentSemester?.name : '全部课程'} · 共 {visibleCourses.length} 门
                </p>
              </div>
              <Button variant="soft" size="sm" icon={Plus} onClick={addCourse}>
                添加课程
              </Button>
            </div>

            <div className="grid gap-3 p-3">
              {visibleCourses.length === 0 ? (
                <EmptyState onAddCourse={addCourse} />
              ) : (
                visibleCourses.map((course) => (
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
                计划 {plannedCredits.toFixed(1)} 学分
              </span>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={clearData}>
                清空数据
              </Button>
            </div>
          </section>

          <div className="grid gap-5">
            <CourseEditor course={selectedCourse} gpaRules={data.gpaRules} onChange={updateCourse} onAddCourse={addCourse} />
            <AnalyticsPanel
              semesterSummaries={semesterSummaries}
              creditDistribution={creditDistribution}
              riskCourses={riskCourses}
            />
          </div>

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
            onChange={(gpaRules) => updateData((current) => ({ ...current, gpaRules }))}
          />
        </div>
      </div>
    </main>
  )
}

export default App
