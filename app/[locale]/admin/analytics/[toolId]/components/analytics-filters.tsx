'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from '@/i18n/navigation'

export default function AnalyticsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (startDate) {
      params.set('startDate', startDate)
    } else {
      params.delete('startDate')
    }

    if (endDate) {
      params.set('endDate', endDate)
    } else {
      params.delete('endDate')
    }

    // 重置页码
    params.delete('page')

    const queryString = params.toString()
    router.push(`?${queryString}`)
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    router.push(window.location.pathname)
  }

  const setQuickFilter = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    const endStr = end.toISOString().split('T')[0]
    const startStr = start.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(endStr)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              开始日期
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              结束日期
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickFilter(7)}>
            最近7天
          </Button>

          <Button variant="outline" size="sm" onClick={() => setQuickFilter(30)}>
            最近30天
          </Button>

          <Button variant="outline" size="sm" onClick={() => setQuickFilter(90)}>
            最近90天
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter}>应用筛选</Button>

          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
