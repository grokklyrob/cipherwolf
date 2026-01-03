import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownMessageProps {
  content: string
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      className="prose prose-invert prose-sm max-w-none"
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match

          if (isInline) {
            return (
              <code
                className="bg-cyber-darker px-1.5 py-0.5 rounded text-cyber-cyan font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <CodeBlock language={match[1]}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          )
        },
        pre({ children }) {
          return <>{children}</>
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 text-gray-200 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-3 space-y-1 text-gray-200">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-200">{children}</ol>
        },
        li({ children }) {
          return <li className="text-gray-200">{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold text-cyber-cyan mb-3 mt-4">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold text-cyber-cyan mb-2 mt-3">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-bold text-cyber-cyan mb-2 mt-3">{children}</h3>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-blue hover:text-cyber-cyan underline"
            >
              {children}
            </a>
          )
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-cyber-cyan pl-4 italic text-gray-400 my-3">
              {children}
            </blockquote>
          )
        },
        strong({ children }) {
          return <strong className="font-bold text-white">{children}</strong>
        },
        em({ children }) {
          return <em className="italic text-gray-300">{children}</em>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

interface CodeBlockProps {
  language: string
  children: string
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Map common language aliases
  const languageMap: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    cpp: 'cpp',
    c: 'c',
    ino: 'cpp', // Arduino
    micropython: 'python',
  }

  const normalizedLanguage = languageMap[language.toLowerCase()] || language

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cyber-darker border-b border-cyber-light">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyber-cyan transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#0a0a0f',
          fontSize: '0.875rem',
        }}
        showLineNumbers
        lineNumberStyle={{
          color: '#4a5568',
          paddingRight: '1rem',
          minWidth: '2.5rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}
