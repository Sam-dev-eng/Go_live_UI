import { useEffect, useState, useRef } from "react"
import socketClient from "../api/socketClient"
import { Send, MessageSquare } from "lucide-react"

export default function Chat({ streamId, compact = false, onNewMessage, onViewerCountUpdate, onStreamEnded, onLikesUpdate }) {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState("")
  const messagesEndRef            = useRef(null)
  const chatContainerRef          = useRef(null)

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return
    const el = chatContainerRef.current
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    socketClient.onConnect = () => {
      socketClient.subscribe(`/topic/streams/${streamId}/chat`, (message) => {
        const msg = JSON.parse(message.body)
        if (msg.type === "VIEWER_COUNT") {
          onViewerCountUpdate?.(msg.viewer_count)
        } else if (msg.type === "STREAM_ENDED") {
          onStreamEnded?.()
        } else if (msg.type === "LIKES_UPDATE") {
          onLikesUpdate?.(msg.likes_count)
        } else {
          setMessages((prev) => [...prev, msg])
          onNewMessage?.(msg)
        }
      })
    }
    socketClient.activate()
    return () => socketClient.deactivate()
  }, [streamId, onViewerCountUpdate, onStreamEnded, onNewMessage, onLikesUpdate])

  const sendMessage = () => {
    if (!input.trim()) return
    socketClient.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({ stream_id: streamId, sender_name: "Anonymous", content: input }),
    })
    setInput("")
  }

  const COLORS = ["text-violet-400", "text-sky-400", "text-emerald-400", "text-pink-400", "text-amber-400"]
  const colorFor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]

  return (
    <div
      className={`flex flex-col overflow-hidden transition-all duration-300 ${
        compact 
          ? "h-full w-full bg-transparent border-none rounded-none" 
          : "bg-[#111118] border border-white/6 rounded-xl h-[520px]"
      }`}
    >
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 shrink-0">
          <MessageSquare size={15} className="text-violet-400" />
          <span className="text-sm font-bold text-zinc-200">Live Chat</span>
          <span className="ml-auto text-[10px] text-zinc-600 font-medium">{messages.length} messages</span>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2"
        style={{
          scrollbarWidth: compact ? "thin" : "auto",
          scrollbarColor: compact ? "rgba(255,255,255,0.1) transparent" : "auto"
        }}
      >
        {messages.length === 0 && (
          <div className={`flex flex-col items-center justify-center h-full text-sm ${compact ? "text-zinc-400/60" : "text-zinc-700"}`}>
            <MessageSquare size={24} className="mb-2 opacity-35" />
            <p className={compact ? "text-xs font-medium text-white/50" : ""}>No messages yet.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const name = msg.sender_name || msg.senderName || "Anonymous"
          return (
            <div 
              key={i} 
              className="flex gap-2 text-sm group"
              style={compact ? { textShadow: "1px 1px 2px rgba(0, 0, 0, 0.95), 0 0 1px rgba(0, 0, 0, 0.9)" } : undefined}
            >
              <span className={`font-bold shrink-0 ${colorFor(name)}`}>{name}</span>
              <span className={compact ? "text-white break-words min-w-0 font-medium" : "text-zinc-300 break-words min-w-0"}>
                {msg.content}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`flex items-center gap-2 px-3 py-3 shrink-0 ${
        compact 
          ? "border-t border-white/5 bg-[#000]/30 backdrop-blur-md" 
          : "border-t border-white/6 bg-transparent"
      }`}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage() }}
          placeholder="Say something…"
          className={`flex-1 min-w-0 text-sm px-3 py-2 rounded-xl outline-none transition-all ${
            compact 
              ? "bg-black/40 border border-white/10 focus:border-white/20 text-white placeholder-zinc-500" 
              : "bg-white/5 border border-white/8 focus:border-violet-500/50 text-white placeholder-zinc-700"
          }`}
        />
        <button
          onClick={sendMessage}
          className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-xl transition-all"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}