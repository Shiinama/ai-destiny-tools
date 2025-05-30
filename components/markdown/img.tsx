import Image from 'next/image'

interface ImageProps {
  src?: string
  alt?: string
}

export default function ImageBlock({ src, alt }: ImageProps) {
  if (!src) {
    return null
  }

  return (
    <figure className="mx-auto mb-4 flex max-w-lg flex-col items-center lg:max-w-xl">
      <Image src={src} width={0} height={0} alt={alt || ''} sizes="100vw" className="m-0 mb-2 h-auto w-full" />
      {alt && <figcaption className="m-0 text-sm text-gray-500 dark:text-gray-400">{alt}</figcaption>}
    </figure>
  )
}
