import { ReactNode } from 'react'

import { redirect } from '@/i18n/navigation'
import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const s = await auth()
  if (!process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(s?.user?.id ?? '')) {
    redirect({
      href: '/',
      locale
    })
  }
  return children
}
