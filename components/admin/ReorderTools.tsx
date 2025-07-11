'use client'

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

import { getPaginatedTools, updateToolsOrder } from '@/actions/divination-tools'
import SortableItem from '@/components/admin/SortableItem'

export interface Tool {
  id: string
  name: string
  categoryKey: string | null
  contactInfo: string | null
  createdAt: Date
  status: string
  url: string
}

export default function ReorderTools() {
  const [items, setItems] = useState<Tool[]>()

  useEffect(() => {
    getPaginatedTools({
      pageSize: 10000,
      page: 1
    }).then((r) => {
      setItems(r.tools)
    })
  }, [])

  if (!items || items.length === 0) return null

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      await updateToolsOrder(newItems.map((item, index) => ({ id: item.id, index })))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="h-[500px] overflow-auto">
          {items.map((tool, index) => (
            <SortableItem index={index} key={tool.id} id={tool.id} tool={tool} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
