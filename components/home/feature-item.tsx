'use client'

interface FeatureItemProps {
  imageUrl: string
  imageAlt: string
  title: string
  description: string

  layout: 'imageLeft' | 'imageRight'
}

export default function FeatureItem({ imageUrl, imageAlt, title, description, layout }: FeatureItemProps) {
  return (
    <div
      className={`relative flex ${
        layout === 'imageRight' ? 'flex-col-reverse' : 'flex-col'
      } items-center gap-8 overflow-hidden rounded-xl p-6 md:flex-row md:p-8`}
    >
      {layout === 'imageLeft' && (
        <div className="relative z-10 w-full md:w-2/5">
          <img src={imageUrl} alt={imageAlt} className="aspect-square w-full rounded-lg object-cover" />
        </div>
      )}

      <div className="relative z-10 w-full space-y-4 md:w-3/5">
        <div className="inline-block">
          <h3 className="text-primary-foreground relative text-2xl font-bold">
            {title}
            <span className="from-primary absolute right-0 -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r to-transparent"></span>
          </h3>
        </div>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

      {layout === 'imageRight' && (
        <div className="relative z-10 w-full md:w-2/5">
          <img src={imageUrl} alt={imageAlt} className="aspect-square w-full rounded-lg object-cover" />
        </div>
      )}
    </div>
  )
}
