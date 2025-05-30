import { Loader } from 'lucide-react'

const PageLoader = () => {
  return (
    <div className="flex grow-1 flex-col items-center justify-center">
      <Loader className="text-muted-foreground size-6 animate-spin" />
    </div>
  )
}

export default PageLoader
