'use client'

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'

import { updateToolOrder } from '@/actions/divination-tools'
import SortableItem from '@/components/admin/SortableItem'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Tool {
  id: string
  name: string
  categoryKey: string
  contactInfo?: string
  createdAt: string
  status: string
  url: string
}

interface ReorderToolsProps {
  tools: Tool[]
}

export default function ReorderTools({
  tools,
  currentPage,
  itemsPerPage
}: ReorderToolsProps & { currentPage: number; itemsPerPage: number }) {
  const [items, setItems] = useState<Tool[]>(tools)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Calculate the starting order index based on the current page
      const startOrderIndex = (currentPage - 1) * itemsPerPage

      await Promise.all(newItems.map((item, index) => updateToolOrder(item.id, startOrderIndex + index)))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>联系方式</TableHead>
              <TableHead>创建日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((tool) => (
              <SortableItem key={tool.id} id={tool.id} tool={tool} />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  )
}
