import { AlertTriangle } from 'lucide-react'

interface PageErrorProps {
  message: string
}

const PageError = ({ message = 'Something went wrong' }: PageErrorProps) => {
  return (
    <div className="flex grow-1 flex-col items-center justify-center">
      <AlertTriangle className="text-muted-foreground mb-2 size-6" />
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  )
}

export default PageError
