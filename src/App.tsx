import { useEffect, useMemo, useState } from 'react'
import { CourseCard } from './components/CourseCard'
import { CourseEditor } from './components/CourseEditor'
import { DataTools } from './components/DataTools'
import { EmptyState } from './components/EmptyState'
import { GpaRulesPanel } from './components/GpaRulesPanel'
import { SummaryCards } from './components/SummaryCards'
import { Button } from './components/ui'
import { APP_VERSION, createCourse } from './lib/defaults'
import { calculateCourse, calculateSummary } from './lib/grade'
import { createDefaultData, loadAppData, saveAppData } from './lib/storage'
import type { AppData, Course } from './types/grade'

function App() {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    () => data.courses[0]?.id,
  )
  const [importError, setImportError] = useState<string | undefined>()

  useEffect(() => {
    saveAppData(data)
  }, [data])

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

  const importData = (nextData: AppData) => {
    setData(nextData)
    setSelectedCourseId(nextData.courses[0]?.id)
  }

  const clearData = () => {
    const nextData = createDefaultData()
    setData(nextData)
    setSelectedCourseId(undefined)
    setImportError(undefined)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              GPA Inquiry v{APP_VERSION}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              大学成绩 / GPA 模拟器
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              本工具只在浏览器本地保存数据，适合快速模拟课程总评、期末目标和加权 GPA。
            </p>
          </div>
          <Button variant="primary" onClick={addCourse}>
            添加课程
          </Button>
        </header>

        <SummaryCards summary={summary} />

        <DataTools
          data={data}
          error={importError}
          onImport={importData}
          onError={setImportError}
          onClear={clearData}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">课程列表</h2>
              <span className="text-sm text-slate-500">
                只统计完整课程进入总览
              </span>
            </div>

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
                  onDelete={() => deleteCourse(course.id)}
                />
              ))
            )}
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <CourseEditor
              course={selectedCourse}
              gpaRules={data.gpaRules}
              onChange={updateCourse}
              onAddCourse={addCourse}
            />
          </aside>
        </div>

        <GpaRulesPanel
          rules={data.gpaRules}
          onChange={(gpaRules) =>
            setData((current) => ({ ...current, gpaRules }))
          }
        />
      </div>
    </main>
  )
}

export default App
