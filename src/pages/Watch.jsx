import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import Chat from "../components/Chat"
import Layout from "../components/Layout"
import VideoPlayer from "../components/VideoPlayer"
import { getStreamById } from "../services/streamService"
import { likeStream } from "../services/streamService"

/* ─────────────────────────────────────────────
   Floating heart particle — spawned on double tap
───────────────────────────────────────────────── */
function HeartParticle({ x, y, id, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1100)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      key={id}
      style={{
        position: "absolute",
        left: x - 20,
        top: y - 20,
        pointerEvents: "none",
        zIndex: 50,
        animation: "heartFloat 1.1s ease-out forwards",
        fontSize: `${28 + Math.random() * 18}px`,
        transform: `rotate(${-20 + Math.random() * 40}deg)`,
        userSelect: "none",
      }}
    >
      ❤️
    </div>
  )
}

export default function Watch() {
  const { streamId } = useParams()
  const navigate = useNavigate()

  const [stream, setStream]     = useState(null)
  const [showChat, setShowChat] = useState(true)
  const [hearts, setHearts]     = useState([])
  const [likesCount, setLikesCount] = useState(0)
  const [likesBump, setLikesBump]   = useState(false) // for the pop animation

  // Double-tap detection
  const lastTapRef = useRef(0)
  const lastClickRef = useRef(0)

  // Prevent spamming the API — debounce per 600ms
  const likeDebounceRef = useRef(null)

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const data = await getStreamById(streamId)
        setStream(data)
        setLikesCount(data.likesCount ?? data.likes_count ?? 0)
      } catch (err) {
        console.error("Failed to load stream")
      }
    }
    if (streamId) fetchStream()
  }, [streamId])

  // Spawn hearts at (x, y) relative to container and call the API
  const triggerLike = useCallback((x, y) => {
    const id = Date.now() + Math.random()
    setHearts((prev) => [...prev, { id, x, y }])
    setLikesCount((c) => c + 1)
    setLikesBump(true)
    setTimeout(() => setLikesBump(false), 350)

    // Debounce actual API call
    clearTimeout(likeDebounceRef.current)
    likeDebounceRef.current = setTimeout(() => {
      likeStream(streamId).catch(() => {/* silent fail – count is optimistic */})
    }, 600)
  }, [streamId])

  // Desktop: double click
  const handleDoubleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    triggerLike(e.clientX - rect.left, e.clientY - rect.top)
  }, [triggerLike])

  // Mobile: double tap (within 300 ms)
  const handleTouchEnd = useCallback((e) => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      const touch = e.changedTouches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      triggerLike(touch.clientX - rect.left, touch.clientY - rect.top)
    }
    lastTapRef.current = now
  }, [triggerLike])

  const removeHeart = useCallback((id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id))
  }, [])

  if (!stream) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#08080d] text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Loading stream details...</p>
        </div>
      </div>
    )
  }

  const isEnded = stream.status === "ENDED"

  return (
    <Layout>
      {/* Inject keyframe for floating hearts */}
      <style>{`
        @keyframes heartFloat {
          0%   { opacity: 1; transform: translateY(0)   scale(1);   }
          60%  { opacity: 1; transform: translateY(-70px) scale(1.25); }
          100% { opacity: 0; transform: translateY(-130px) scale(0.8);  }
        }
        @keyframes likesBump {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="flex flex-col max-w-6xl mx-auto w-full">

        {/* ── Stream Screen Container ── */}
        <div
          className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5"
          onDoubleClick={!isEnded ? handleDoubleClick : undefined}
          onTouchEnd={!isEnded ? handleTouchEnd : undefined}
          style={{ cursor: isEnded ? "default" : "pointer", userSelect: "none" }}
        >
          {isEnded ? (
            <div className="w-full h-full bg-[#111118] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
              <div className="z-10 flex flex-col items-center">
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 animate-pulse">
                  ENDED
                </div>
                <h3 className="text-2xl font-black text-white mb-2">This Stream Has Ended</h3>
                <p className="text-zinc-400 text-sm max-w-md mb-6">
                  Thanks for tuning in! The host has finished streaming this session. Check back later or discover other creators live now.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/20"
                >
                  Browse Live Streams
                </button>
              </div>
            </div>
          ) : (
            <VideoPlayer streamId={streamId} chatActive={showChat} />
          )}

          {/* Floating Hearts Layer */}
          {hearts.map((h) => (
            <HeartParticle
              key={h.id}
              id={h.id}
              x={h.x}
              y={h.y}
              onDone={() => removeHeart(h.id)}
            />
          ))}

          {/* Double-tap hint (fades quickly) */}
          {!isEnded && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-30 opacity-0 hover:opacity-0"
              style={{ animation: "none" }}>
            </div>
          )}

          {/* Floating Chat Panel */}
          {showChat && !isEnded && (
            <div className="absolute z-20 transition-all duration-300
              lg:right-0 lg:top-0 lg:bottom-0 lg:left-auto lg:w-80 lg:h-full lg:border-l lg:border-white/10
              right-0 bottom-0 left-0 h-48 border-t border-white/10"
            >
              <Chat
                streamId={streamId}
                compact={true}
                onViewerCountUpdate={(count) => {
                  setStream((prev) => {
                    if (!prev) return null
                    if (prev.status === "ENDED") return prev
                    return { ...prev, viewer_count: count }
                  })
                }}
                onStreamEnded={() => {
                  setStream((prev) => prev ? { ...prev, status: "ENDED", viewer_count: 0 } : null)
                }}
                onLikesUpdate={(count) => {
                  setLikesCount(count)
                }}
              />
            </div>
          )}
        </div>

        {/* ── Details Card ── */}
        <div className="mt-6 bg-[#111118] border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {stream.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Category */}
              <span className="bg-purple-950/40 text-purple-400 border border-purple-900/30 px-3 py-1 rounded-full text-xs font-semibold">
                {stream.category || "General"}
              </span>

              {/* Viewer count */}
              <span className="text-gray-400 text-sm flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${isEnded ? "bg-zinc-600" : "bg-red-600 animate-ping"}`}></span>
                {isEnded ? "0 watching" : `${stream.viewer_count ?? stream.viewerCount ?? 0} watching`}
              </span>

              {/* ── Likes counter ── */}
              <button
                disabled={isEnded}
                onClick={() => {
                  if (isEnded) return
                  // Allow single-click like from the button too
                  const containerEl = document.querySelector("[data-stream-screen]")
                  triggerLike(80, 80)
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 border
                  ${isEnded
                    ? "bg-zinc-900/40 border-zinc-800/30 text-zinc-600 cursor-not-allowed"
                    : "bg-rose-950/30 border-rose-800/30 text-rose-400 hover:bg-rose-900/40 hover:border-rose-700/50 cursor-pointer"
                  }`}
                style={likesBump ? { animation: "likesBump 0.35s ease-out" } : undefined}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-rose-500">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span
                  style={likesBump ? { animation: "likesBump 0.35s ease-out" } : undefined}
                >
                  {likesCount.toLocaleString()}
                </span>
              </button>

              <span className="text-zinc-500 text-sm">
                Status: {isEnded ? "Ended" : "Live"}
              </span>
            </div>
          </div>

          {!isEnded && (
            <div className="flex items-center gap-3">
              {/* Double-tap hint pill */}
              <span className="hidden sm:flex items-center gap-1.5 text-zinc-600 text-xs border border-zinc-800/50 rounded-full px-3 py-1.5">
                <span>💗</span> Double-tap to like
              </span>

              {/* Hide/Show Chat button */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-300 ${
                  showChat
                    ? "bg-purple-600/10 border-purple-500/30 text-purple-400 hover:bg-purple-600/20"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  {showChat ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.277Z" />
                  )}
                </svg>
                {showChat ? "Hide Chat" : "Show Chat"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}