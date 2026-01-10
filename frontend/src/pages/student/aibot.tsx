import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Copy, Check, Loader2 } from "lucide-react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/atom-one-dark.css" // 引入代码高亮样式，需要在 main.tsx 或这里引入

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

// 优化后的打字机 Hook
// 仅在组件内部控制显示文本，不触发全局状态更新
const useTypewriter = (text: string, speed: number = 20, enabled: boolean = true) => {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text)
      setIsTyping(false)
      return
    }

    setDisplayText("")
    setIsTyping(true)
    let i = 0
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i))
        i++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, enabled])

  return { displayText, isTyping }
}

// ... 其他 import 保持不变

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    // 修复点：将 className 移到外层 div
    <div className="prose prose-sm max-w-none dark:prose-invert
      prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg
      prose-p:leading-7 prose-p:my-2
      prose-pre:bg-gray-900 prose-pre:p-0 prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-700
      prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-ul:my-2 prose-ol:my-2
      prose-li:my-0.5">
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        // 注意：这里删除了 className 属性
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            
            return !inline && match ? (
              <div className="relative group rounded-md overflow-hidden my-4">
                <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-gray-400 text-xs border-b border-gray-700">
                  <span>{language}</span>
                  <span className="text-[10px]">Code Block</span>
                </div>
                <div className="overflow-x-auto bg-[#0d1117] p-4">
                  <code className={`${className} bg-transparent p-0 text-sm font-mono`} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
// 消息气泡组件
const MessageBubble = ({ message, isLast }: { message: Message; isLast: boolean }) => {
  const [copied, setCopied] = useState(false)
  
  // 只有最后一条也是 AI 的消息才启用打字机效果，历史消息直接显示
  const shouldAnimate = message.role === "assistant" && isLast
  const { displayText, isTyping } = useTypewriter(message.content, 15, shouldAnimate)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && (
        <Avatar className="h-8 w-8 mt-1 ring-2 ring-blue-100 dark:ring-blue-900 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === "user" ? "order-first" : ""}`}>
        <Card className={`border-0 shadow-md ${
          message.role === "user"
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            : "bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
        }`}>
          <CardContent className="p-3 sm:p-4">
            {message.role === "assistant" ? (
              <div className="min-h-[20px]">
                <MarkdownRenderer content={displayText} />
                {isTyping && (
                  <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse align-middle" />
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            )}

            {/* 底部工具栏 */}
            <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
              message.role === "user" ? "border-blue-500/30 text-blue-100" : "border-gray-100 dark:border-gray-700 text-muted-foreground"
            }`}>
              <span className="text-[10px] opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {message.role === "assistant" && !isTyping && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {message.role === "user" && (
        <Avatar className="h-8 w-8 mt-1 ring-2 ring-gray-100 dark:ring-gray-700 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

export default function AiBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好！我是你的AI助手，有什么可以帮助你的吗？",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userContent = input.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userContent,
      role: "user",
      timestamp: new Date()
    }

    // 乐观更新 UI
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // ⚠️ 注意：这里假设你已经在 vite.config.ts 配置了 proxy
      // 或者你需要替换为完整的 API URL
      const response = await axios.post(
        "/ai/v1/chat/completions",
        {
          model: import.meta.env.VITE_MODEL_NAME || "meta/llama-3.1-nemotron-70b-instruct",
          messages: [
            // 将历史消息格式化为 API 需要的格式
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userContent }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`
          }
        }
      )

      const aiContent = response.data.choices?.[0]?.message?.content || "API 返回数据格式异常"

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        role: "assistant",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error calling API:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "🚫 请求失败：请检查网络连接、API Key 配置或后端代理设置。",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              AI 智能助手
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              // 只有最后一条消息，且不是 loading 状态时，可能需要动画（MessageBubble内部判断role）
              isLast={index === messages.length - 1}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-500 font-medium">AI 正在思考中...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <form onSubmit={handleSubmit} className="relative group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题 (Shift + Enter 换行)..."
              disabled={isLoading}
              className="min-h-[60px] max-h-[200px] w-full resize-none rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 pr-16 text-base focus-visible:ring-0 focus-visible:border-blue-500 transition-all shadow-sm"
            />
            
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {["解释量子计算", "写一个 Python 爬虫", "优化 React 性能", "翻译这段话"].map((text) => (
              <Button
                key={text}
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-full bg-transparent border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setInput(text)}
                disabled={isLoading}
              >
                {text}
              </Button>
            ))}
          </div>
          
          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            AI 生成的内容可能不准确，请核实重要信息。
          </p>
        </div>
      </footer>
    </div>
  )
}