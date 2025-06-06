'use client'

import { Button } from '@/components/ui/button'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function MainNav({
  items,
  className,
  ...props
}: React.ComponentProps<'nav'> & {
  items: { href: string; label: string }[]
}) {
  const pathname = usePathname()

  return (
    <nav className={cn('items-center gap-0.5', className)} {...props}>
      {items.map((item) => (
        <Button key={item.href} variant="ghost" asChild size="default">
          <Link href={item.href} className={cn(pathname === item.href && 'text-primary')}>
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
