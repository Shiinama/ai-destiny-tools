import { ReactNode } from 'react'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
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
  const session = await auth()
  const isUserAdmin = checkUserIsAdmin(session?.user?.id)
  if (!isUserAdmin) {
    redirect({
      href: '/',
      locale
    })
  }
  return children
}
