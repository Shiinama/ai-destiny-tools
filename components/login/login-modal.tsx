'use client'

import { LogIn, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import LoginForm from '@/components/login/login-form'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false)
  const session = useSession()
  const t = useTranslations('login')
  const site = useTranslations('siteInfo')
  const isMobile = useIsMobile()

  if (session.status === 'loading') return null

  if (session.status === 'authenticated') {
    if (isMobile) {
      return (
        <div className="border-border/40 flex items-center justify-between gap-3 border-b px-1 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.data?.user?.image || ''} alt={session.data?.user?.name || 'User'} />
              <AvatarFallback>{session.data?.user?.name?.[0] || session.data?.user?.email?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {session.data?.user?.name && <p className="truncate font-medium">{session.data.user.name}</p>}
              {session.data?.user?.email && (
                <p className="text-muted-foreground truncate text-xs">{session.data.user.email}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            title={t('signOut')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.data?.user?.image || ''} alt={session.data?.user?.name || 'User'} />
              <AvatarFallback>{session.data?.user?.name?.[0] || session.data?.user?.email?.[0] || '?'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              {session.data?.user?.name && <p className="font-medium">{session.data.user.name}</p>}
              {session.data?.user?.email && (
                <p className="text-muted-foreground truncate text-xs">{session.data.user.email}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="text-foreground hover:text-primary group relative flex cursor-pointer items-center font-medium transition-colors">
          <LogIn className="mr-2 h-4 w-4" />
          {t('login')}
          <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"></span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">{site('brandName')}</DialogTitle>
          <DialogDescription className="text-center">{t('modal.description')}</DialogDescription>
        </DialogHeader>
        <LoginForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
