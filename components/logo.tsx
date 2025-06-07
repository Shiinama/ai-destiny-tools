import { BrandLogo } from '@/components/icons/brand-logo'
import { Link } from '@/i18n/navigation'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <BrandLogo width={90} height={36} />
    </Link>
  )
}

export default Logo
