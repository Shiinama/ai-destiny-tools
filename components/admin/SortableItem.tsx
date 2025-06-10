'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Tool } from '@/components/admin/ReorderTools'

export default function SortableItem({ id, tool }: { id: string; tool: Tool }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} className="cursor-grabbing" style={style} {...attributes} {...listeners}>
      <div className="flex items-center justify-between border-b p-2">
        <div>{tool.name}</div>
        <div>{tool.categoryKey}</div>
      </div>
    </div>
  )
}
