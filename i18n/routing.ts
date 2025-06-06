import { defineRouting } from 'next-intl/routing'

export const locales = [
  {
    code: 'en',
    name: 'English',
    dir: 'ltr'
  },
  {
    code: 'zh',
    name: '简体中文',
    dir: 'ltr'
  }
]

export const routing = defineRouting({
  locales: locales.map((i) => i.code),
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})
