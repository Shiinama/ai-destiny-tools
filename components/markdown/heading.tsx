import React from 'react'

import { Link } from '@/i18n/navigation'

import type { JSX } from 'react'

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with and
    .replace(/-{2,}/g, '-') // Replace multiple - with single -
}

export default function Heading({ level, children }: HeadingProps) {
  const slug = slugify(children as string)
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag id={slug}>
      <Link href={`#${slug}`} className="no-underline">
        {children}
      </Link>
    </Tag>
  )
}

Heading.displayName = 'Heading'
