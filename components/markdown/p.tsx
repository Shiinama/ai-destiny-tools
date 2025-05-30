interface PBlockProps {
  children: React.ReactNode
}

const PBlock = ({ children }: PBlockProps) => {
  if (Array.isArray(children) && children.length === 1 && typeof children[0] === 'object') {
    return <>{children}</>
  }

  return <p>{children}</p>
}

export default PBlock
