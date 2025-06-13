'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Tool } from '@/components/admin/ReorderTools'

export default function SortableItem({ id, tool, index }: { id: string; tool: Tool; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} className="cursor-grabbing" style={style} {...attributes} {...listeners}>
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-3">
          <span className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
            {index + 1}
          </span>
          <div>{tool.name}</div>
        </div>
        <div>{tool.categoryKey}</div>
      </div>
    </div>
  )
}
