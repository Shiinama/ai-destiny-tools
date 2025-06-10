'use client'

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

import { getPaginatedTools, updateToolOrder } from '@/actions/divination-tools'
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
    getPaginatedTools({}).then((r) => {
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

      await Promise.all(newItems.map((item, index) => updateToolOrder(item.id, index)))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((tool) => (
          <SortableItem key={tool.id} id={tool.id} tool={tool} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
