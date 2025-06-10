'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'

interface Tool {
  id: string
  name: string
  categoryKey: string
  contactInfo?: string
  createdAt: string
  status: string
  url: string
}

interface SortableItemProps {
  id: string
  tool: Tool
}

export default function SortableItem({ id, tool }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已批准'
      case 'rejected':
        return '已拒绝'
      case 'pending':
        return '待审核'
      default:
        return status
    }
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>
        <div className="font-medium">{tool.name}</div>
        <div className="text-muted-foreground max-w-xs truncate text-sm">{tool.url}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{tool.categoryKey}</Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">{tool.contactInfo || '未提供'}</div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{formatDate(tool.createdAt)}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(tool.status)}>{getStatusText(tool.status)}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-4">
          <Link href={`/admin/tools/edit/${tool.id}`} className="text-primary hover:text-primary/80">
            编辑
          </Link>
          <Link href={`/divination-tools/${tool.id}`} className="text-primary hover:text-primary/80" target="_blank">
            查看
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}
