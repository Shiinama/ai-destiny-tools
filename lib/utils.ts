import { clsx, type ClassValue } from 'clsx'
import { format, isValid } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期为易读的字符串
 * @param date 日期对象、日期字符串或时间戳
 * @param formatString 日期格式字符串，默认为 'yyyy年MM月dd日 HH:mm'
 * @returns 格式化后的日期字符串，如果输入无效则返回空字符串
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatString: string = 'yyyy年MM月dd日 HH:mm'
): string {
  if (!date) return ''

  // 如果是字符串，尝试转换为日期对象
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // 检查日期是否有效
  if (!isValid(dateObj)) return ''

  // 使用 date-fns 格式化日期，使用中文本地化
  return format(dateObj, formatString)
}

/**
 * 格式化日期为相对时间（例如：3天前，刚刚）
 * 这个函数可以在未来实现，目前返回标准格式
 */
export function formatRelativeDate(date: Date | string | number | null | undefined): string {
  return formatDate(date)
}
