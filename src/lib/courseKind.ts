import type { CourseKind } from '../types/grade'

export const courseKindLabels: Record<CourseKind, string> = {
  required: '必修课',
  major: '专业课',
  elective: '选修课',
}

export const courseKindDots: Record<CourseKind, string> = {
  required: 'bg-blue-500',
  major: 'bg-violet-500',
  elective: 'bg-emerald-500',
}

export const courseKindOptions: CourseKind[] = ['required', 'major', 'elective']

export function getCourseKind(kind: CourseKind | undefined): CourseKind {
  return kind ?? 'required'
}
