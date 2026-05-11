import type { ChangeEvent } from 'react'
import { exportAppData, parseImportedAppData } from '../lib/storage'
import type { AppData } from '../types/grade'
import { Button, Notice } from './ui'

type DataToolsProps = {
  data: AppData
  error?: string
  onImport: (data: AppData) => void
  onError: (message: string | undefined) => void
  onClear: () => void
}

export function DataTools({
  data,
  error,
  onImport,
  onError,
  onClear,
}: DataToolsProps) {
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      onImport(parseImportedAppData(text))
      onError(undefined)
    } catch (error) {
      onError(error instanceof Error ? error.message : '导入失败。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="dashboard-panel grid gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">数据工具</h2>
          <p className="mt-1 text-sm text-slate-500">
            当前数据保存在本地浏览器，可导出 JSON 备份。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => exportAppData(data)}>导出 JSON</Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50">
            导入 JSON
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="sr-only"
            />
          </label>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('确定清空全部数据吗？课程和 GPA 规则都会恢复到默认状态。')) {
                onClear()
              }
            }}
          >
            清空全部数据
          </Button>
        </div>
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
    </div>
  )
}
