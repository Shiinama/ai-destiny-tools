interface VideoProps {
  src: string
  title?: string
}

export default function VideoBlock({ src, title }: VideoProps) {
  return (
    <figure className="mx-auto mb-4 flex max-w-lg flex-col items-center lg:max-w-xl">
      <video src={src} title={title} controls preload="metadata" className="m-0 mb-2 h-auto w-full" />
      {title && <figcaption className="m-0 text-sm text-gray-500 dark:text-gray-400">{title}</figcaption>}
    </figure>
  )
}
