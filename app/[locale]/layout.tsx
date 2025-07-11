import { notFound } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import Footer from '@/components/footer'
import Header from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { locales, routing } from '@/i18n/routing'

import type { Metadata, Viewport } from 'next'

import '../globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('siteInfo')

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
    title: {
      default: t('meta.title'),
      template: `%s | ${t('brandName')}`
    },
    description: t('meta.description'),
    authors: [{ name: 'Felix', url: 'https://github.com/Shiinama' }],
    creator: 'Felix',
    alternates: {
      languages: {
        'x-default': process.env.NEXT_PUBLIC_BASE_URL,
        ...Object.fromEntries(
          locales.map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}/${locale.code}`])
        )
      }
    },
    other: {
      'baidu-site-verification': 'codeva-cuus2agKEj'
    }
  }
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const currentLocale = locales.find((l) => l.code === locale)

  return (
    <html lang={currentLocale?.code ?? 'en'} dir={currentLocale?.dir || 'ltr'} suppressHydrationWarning>
      <body className="relative overflow-x-hidden antialiased">
        <div className="pointer-events-none fixed inset-0 z-99 overflow-hidden">
          <div className="bg-primary/5 absolute -top-20 -left-20 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="bg-primary/8 absolute -right-20 -bottom-40 h-96 w-96 rounded-full blur-3xl"></div>
        </div>

        <NextIntlClientProvider>
          <SessionProvider>
            <Header />
            <main className="relative z-10 mx-auto mt-16 flex w-full max-w-(--breakpoint-xl) flex-1 flex-col px-2.5 py-8 md:px-20">
              {children}
            </main>
            <Footer />
          </SessionProvider>
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
