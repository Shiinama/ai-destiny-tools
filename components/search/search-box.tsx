'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

import { useRouter } from '@/i18n/navigation'

export default function SearchBox({ locale }: { locale: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const t = useTranslations('HomePage')

  useEffect(() => {
    setQuery(searchParams.get('query') || '')
  }, [searchParams])

  const handleSearch = () => {
    const q = query.trim()
    if (q) {
      router.push(`/${locale}/search?query=${encodeURIComponent(q)}`)
    } else {
      router.push(`/${locale}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative mx-auto mb-8 w-full max-w-3xl">
      <input
        className="w-full rounded-lg bg-white px-6 py-4 pr-12 text-base shadow-sm outline-none placeholder:text-gray-400 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-gray-500"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        type="text"
        aria-label="Search"
      />
      <button
        onClick={handleSearch}
        className="bg-primary absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-md p-2 text-white transition-transform hover:scale-105"
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  )
}
