import TarotBg from './static/toart/tarotbg.jpg'

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${TarotBg.src})`,
        // backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {children}
    </div>
  )
}
