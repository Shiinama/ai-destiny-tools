import { Menu } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { LocaleSwitcher } from '@/components/locale-switcher'
import LoginModal from '@/components/login/login-modal'
import Logo from '@/components/logo'
import { MainNav } from '@/components/main-nav'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { Link } from '@/i18n/navigation'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default async function Header({ className }: { className?: string }) {
  const t = await getTranslations('headers')
  const session = await auth()
  const isUserAdmin = await checkUserIsAdmin(session?.user?.id)

  const mobileLinkStyle = 'flex items-center rounded-md px-3 py-3 text-lg font-medium transition-colors'

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/blogs', label: t('blogs') },
    {
      href: '/submit-tools',
      label: t('submitTools')
    }
  ]
  if (isUserAdmin) {
    navLinks.push(
      { href: '/admin/articles', label: '文章管理' },
      { href: '/admin/tools', label: '工具管理' },
      { href: '/admin/analytics', label: '数据统计' }
    )
  }

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:px-18',
        className
      )}
    >
      <nav className="hidden w-full items-center justify-between md:flex">
        <div className="flex items-center">
          <Logo />
          <MainNav className="ml-4" items={navLinks} />
        </div>
        <div className="flex items-center gap-6">
          <LocaleSwitcher />
          <LoginModal />
        </div>
      </nav>

      <div className="flex w-full items-center justify-between gap-4 md:hidden">
        <Logo />
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[280px] flex-col sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>{t('navigation')}</SheetTitle>
                <SheetDescription>{t('navigationDescription')}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={mobileLinkStyle}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="border-t pt-4">
                <LoginModal />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
