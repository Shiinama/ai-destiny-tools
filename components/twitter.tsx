import React from 'react'

import { Link } from '@/i18n/navigation'

const TwitterBtn = () => {
  return (
    <Link
      href="https://twitter.com/AiTools91335"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-background border-input hover:bg-accent hover:text-accent-foreground flex items-center justify-center rounded-full border p-2 font-medium shadow-sm"
    >
      <IconTwitter className="size-4" />
    </Link>
  )
}

export default TwitterBtn

const IconTwitter = ({ ...props }: Omit<React.SVGProps<SVGSVGElement>, 'children'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" {...props} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
    />
  </svg>
)
