import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  children: React.ReactNode | string
  className?: string
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const match = /lang-(\w+)/.exec(className || '')
  const language = match ? match[1] : null

  const isCodeBlock = language !== null

  return isCodeBlock ? (
    <SyntaxHighlighter
      language={language}
      style={atomDark}
      customStyle={{ margin: 0, borderRadius: '6px', fontSize: '0.9em' }}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className="bg-muted rounded px-1 py-0.5 text-xs">{children}</code>
  )
}

export default CodeBlock
