import { useEffect, useState , useRef } from "react"
import socketClient from "../api/socketClient"

export default function Chat({ streamId, compact=false , onNewMessage  }) {

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
  if (!chatContainerRef.current) return

  const container = chatContainerRef.current

  const isNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 100

  if (isNearBottom) {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    })

  }

}

  useEffect(()=> {
    scrollToBottom()
  },[messages])

  useEffect(() => {

    socketClient.onConnect = () => {

      socketClient.subscribe(
        `/topic/streams/${streamId}/chat`,
        (message) => {
            
          const newMessage = JSON.parse(message.body)

          setMessages((prev) => [...prev, newMessage])
          if(onNewMessage) onNewMessage(newMessage)
        }
      )

    }

    socketClient.activate()

    return () => {
      socketClient.deactivate()
    }

  }, [streamId])

  const sendMessage = () => {

    if (!input.trim()) return

    socketClient.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({
        stream_id: streamId,
        sender_name: "Anonymous",
        content: input
      })
    })

    setInput("")
  }

  return (
  <div
    className={`
      bg-[#18181b] rounded-lg flex flex-col min-h-0
      ${compact ? "h-full rounded-none" : "h-[500px]"}
    `}
  >
    {!compact && (
      <div className="p-3 border-b border-gray-700 font-semibold shrink-0">
        Live Chat
      </div>
    )}

    {/* Messages */}
    <div
      ref={chatContainerRef}
      className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 text-sm"
    >
      {messages.map((msg, i) => (
        <div key={i}>
          <span className="text-purple-400">
            {msg.sender_name || msg.senderName || "Anonymous"}
          </span>

          <span className="ml-2 text-gray-200">
            {msg.content}
          </span>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div className="p-3 border-t border-gray-700 flex gap-2 shrink-0">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage()
        }}
        className="flex-1 min-w-0 bg-[#0e0e10] px-3 py-2 rounded text-sm"
        placeholder="Send a message"
      />

      <button
        onClick={sendMessage}
        className="bg-purple-600 px-3 py-2 rounded text-sm shrink-0"
      >
        Send
      </button>
    </div>
  </div>
)
}