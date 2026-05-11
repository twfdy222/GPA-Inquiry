import type {
  Course,
  CourseCalculation,
  GpaRule,
  GpaRuleValidation,
  ReverseResult,
  SummaryStats,
  WeightStatus,
} from '../types/grade'

const EPSILON = 0.000001

function hasNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function roundForGpa(score: number): number {
  return clampScore(Math.round(score))
}

export function calculateKnownContribution(course: Course): number {
  return course.items.reduce((sum, item) => {
    if (!hasNumber(item.score)) {
      return sum
    }

    return sum + (item.score * item.weight) / 100
  }, 0)
}

export function calculateWeightTotal(course: Course): number {
  return course.items.reduce((sum, item) => sum + item.weight, 0)
}

export function getWeightStatus(weightTotal: number): WeightStatus {
  if (Math.abs(weightTotal - 100) < EPSILON) {
    return 'complete'
  }

  return weightTotal < 100 ? 'under' : 'over'
}

function calculateKnownContributionForReverse(course: Course, pendingId: string) {
  return course.items.reduce((sum, item) => {
    if (item.id === pendingId || !hasNumber(item.score)) {
      return sum
    }

    return sum + (item.score * item.weight) / 100
  }, 0)
}

export function calculateReverseScore(course: Course): ReverseResult {
  const pendingItems = course.items.filter((item) => item.isPending)

  if (pendingItems.length === 0) {
    return { status: 'none' }
  }

  if (pendingItems.length > 1) {
    return {
      status: 'ambiguous',
      message: '规则不明确：每门课最多只能有一个待反推项目。',
    }
  }

  const pendingItem = pendingItems[0]

  if (!hasNumber(course.targetScore)) {
    return {
      status: 'needs-target',
      itemId: pendingItem.id,
      itemName: pendingItem.name,
      message: '请先填写目标总评，再进行反推。',
    }
  }

  if (pendingItem.weight <= 0) {
    return {
      status: 'zero-weight',
      itemId: pendingItem.id,
      itemName: pendingItem.name,
      message: '待反推项目权重为 0，无法反推。',
    }
  }

  const knownContribution = calculateKnownContributionForReverse(
    course,
    pendingItem.id,
  )
  const requiredScore =
    (course.targetScore - knownContribution) / (pendingItem.weight / 100)

  if (requiredScore > 100) {
    return {
      status: 'unreachable-high',
      itemId: pendingItem.id,
      itemName: pendingItem.name,
      requiredScore,
      message: '目标总评不可达。',
    }
  }

  if (requiredScore < 0) {
    return {
      status: 'already-reached',
      itemId: pendingItem.id,
      itemName: pendingItem.name,
      requiredScore,
      message: '即使该项为 0 分，也已经能够达到目标。',
    }
  }

  return {
    status: 'ok',
    itemId: pendingItem.id,
    itemName: pendingItem.name,
    requiredScore,
    message: '反推结果有效。',
  }
}

export function getGpaForScore(score: number, rules: GpaRule[]): number | undefined {
  const roundedScore = roundForGpa(score)

  return rules.find((rule) => {
    const isLastMax = rule.max === 100 && roundedScore === 100
    return roundedScore >= rule.min && (roundedScore < rule.max || isLastMax)
  })?.point
}

export function calculateCourse(course: Course, rules: GpaRule[]): CourseCalculation {
  const weightTotal = calculateWeightTotal(course)
  const weightStatus = getWeightStatus(weightTotal)
  const knownContribution = calculateKnownContribution(course)
  const reverse = calculateReverseScore(course)
  const warnings: string[] = []

  if (weightStatus === 'under') {
    warnings.push('还有部分成绩项目未补齐，当前总评不代表最终成绩。')
  }

  if (weightStatus === 'over') {
    warnings.push('权重超过 100%，请检查是否重复录入或填写错误。')
  }

  const pendingItems = course.items.filter((item) => item.isPending)
  const allScoresFilled = course.items.every((item) => hasNumber(item.score))
  const hasValidReverse = reverse.status === 'ok' || reverse.status === 'already-reached'
  const canProject =
    weightStatus === 'complete' &&
    pendingItems.length <= 1 &&
    (allScoresFilled || hasValidReverse)

  let projectedScore: number | undefined

  if (canProject) {
    if (allScoresFilled) {
      projectedScore = knownContribution
    } else if (hasValidReverse && hasNumber(course.targetScore)) {
      projectedScore = course.targetScore
    }
  }

  const roundedScore = hasNumber(projectedScore)
    ? roundForGpa(projectedScore)
    : undefined
  const gpa = hasNumber(projectedScore)
    ? getGpaForScore(projectedScore, rules)
    : undefined

  return {
    courseId: course.id,
    weightTotal,
    weightStatus,
    knownContribution,
    projectedScore,
    roundedScore,
    gpa,
    isComplete: hasNumber(projectedScore) && hasNumber(gpa),
    reverse,
    warnings,
  }
}

export function calculateSummary(
  courses: Course[],
  rules: GpaRule[],
): SummaryStats {
  const calculations = courses.map((course) => calculateCourse(course, rules))
  const plannedCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const completeRows = courses
    .map((course, index) => ({ course, calculation: calculations[index] }))
    .filter(({ course, calculation }) => course.credits > 0 && calculation.isComplete)

  const totalCredits = completeRows.reduce((sum, row) => sum + row.course.credits, 0)
  const weightedGpaSum = completeRows.reduce((sum, row) => {
    return sum + (row.calculation.gpa ?? 0) * row.course.credits
  }, 0)
  const weightedScoreSum = completeRows.reduce((sum, row) => {
    return sum + (row.calculation.projectedScore ?? 0) * row.course.credits
  }, 0)

  return {
    totalGpa: totalCredits > 0 ? weightedGpaSum / totalCredits : undefined,
    weightedAverage:
      totalCredits > 0 ? weightedScoreSum / totalCredits : undefined,
    totalCredits,
    plannedCredits,
    courseCount: courses.length,
    completeCourseCount: completeRows.length,
  }
}

export function validateGpaRules(rules: GpaRule[]): GpaRuleValidation {
  const sortedRules = [...rules].sort((a, b) => a.min - b.min || a.max - b.max)
  const overlaps: string[] = []
  const gaps: string[] = []
  const warnings: string[] = []

  sortedRules.forEach((rule) => {
    if (rule.min < 0 || rule.max > 100 || rule.point < 0) {
      warnings.push('规则中存在超出范围的数值。')
    }

    if (rule.min >= rule.max) {
      warnings.push(`${rule.min}-${rule.max} 区间无效。`)
    }
  })

  for (let index = 0; index < sortedRules.length - 1; index += 1) {
    const current = sortedRules[index]
    const next = sortedRules[index + 1]

    if (current.max > next.min) {
      overlaps.push(`${current.min}-${current.max} 与 ${next.min}-${next.max}`)
    }
  }

  let cursor = 0
  sortedRules.forEach((rule) => {
    if (rule.min > cursor) {
      gaps.push(`${cursor}-${rule.min}`)
    }

    if (rule.max > cursor) {
      cursor = rule.max
    }
  })

  if (cursor < 100) {
    gaps.push(`${cursor}-100`)
  }

  if (gaps.length > 0) {
    warnings.push('GPA 规则没有完整覆盖 0-100。')
  }

  if (overlaps.length > 0) {
    warnings.push('GPA 规则存在重叠区间。')
  }

  return {
    isValid: overlaps.length === 0 && warnings.length === 0,
    overlaps,
    gaps,
    warnings,
  }
}
