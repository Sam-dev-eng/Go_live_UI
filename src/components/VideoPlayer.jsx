import { useEffect, useRef, useState, useCallback } from "react"
import { Room, RoomEvent } from "livekit-client"
import { getLiveKitToken } from "../services/liveKidServices"

export default function VideoPlayer({ streamId, chatActive = false }) {
  const videoContainerRef = useRef(null)
  const audioContainerRef = useRef(null)
  const roomRef = useRef(null)
  const playerRef = useRef(null)

  const [error, setError] = useState("")
  const [connected, setConnected] = useState(false)
  // Browsers block audio autoplay — viewer must unmute intentionally.
  const [isMuted, setIsMuted] = useState(true)

  // Sync the muted attribute on all attached <audio> elements whenever
  // isMuted changes (e.g. when the user clicks the Unmute button).
  const applyMuteToAudioElements = useCallback((muted) => {
    if (!audioContainerRef.current) return
    audioContainerRef.current
      .querySelectorAll("audio")
      .forEach((el) => { el.muted = muted })
  }, [])

  useEffect(() => {
    let mounted = true

    const connectViewer = async () => {
      try {
        const data = await getLiveKitToken({
          streamId,
          role: "VIEWER",
        })

        const room = new Room()
        roomRef.current = room

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (!mounted) return

          if (track.kind === "video") {
            // ── Attach the host's screen/camera video track ──────────────
            const el = track.attach()
            el.autoplay = true
            el.playsInline = true
            el.className = "w-full h-full object-contain"

            if (videoContainerRef.current) {
              videoContainerRef.current.innerHTML = ""
              videoContainerRef.current.appendChild(el)
            }
          } else if (track.kind === "audio") {
            // ── Attach the host's microphone or device-sound audio track ─
            const el = track.attach()
            el.autoplay = true
            // Start muted to satisfy browser autoplay policy — the viewer
            // can unmute by clicking the Unmute button below.
            el.muted = true
            el.style.display = "none"

            if (audioContainerRef.current) {
              audioContainerRef.current.appendChild(el)
            }
          }
        })

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach()
        })

        await room.connect(data.livekit_url, data.token)

        if (mounted) setConnected(true)
      } catch (err) {
        console.error(err)
        if (mounted) setError("Unable to connect to stream")
      }
    }

    if (streamId) {
      connectViewer()
    }

    return () => {
      mounted = false
      roomRef.current?.disconnect()
    }
  }, [streamId])

  const handleUnmute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    applyMuteToAudioElements(nextMuted)
  }

  const goFullScreen = () => {
    if (playerRef.current?.requestFullscreen) {
      playerRef.current.requestFullscreen()
    }
  }

  return (
    <div
      ref={playerRef}
      className="aspect-video w-full bg-black rounded-lg overflow-hidden relative"
    >
      {/* Hidden audio sink — <audio> elements are invisible but play sound */}
      <div ref={audioContainerRef} aria-hidden="true" />

      {/* Video canvas */}
      <div ref={videoContainerRef} className="w-full h-full" />

      {/* Waiting overlay */}
      {!connected && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Waiting for stream...
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400">
          {error}
        </div>
      )}

      {/* ── Unmute / Volume control ──────────────────────────────────── */}
      {connected && (
        <button
          onClick={handleUnmute}
          title={isMuted ? "Unmute stream audio" : "Mute stream audio"}
          className={`absolute transition-all duration-300 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
            isMuted
              ? "bg-yellow-500/90 text-black hover:bg-yellow-400"
              : "bg-black/60 text-white hover:bg-black/80"
          } ${
            chatActive
              ? "bottom-[208px] lg:bottom-3 left-3"
              : "bottom-3 left-3"
          }`}
        >
          {isMuted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
              </svg>
              Unmute
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06ZM15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
              Mute
            </>
          )}
        </button>
      )}

      {/* Fullscreen button */}
      <button
        onClick={goFullScreen}
        title="Fullscreen"
        className={`absolute transition-all duration-300 z-30 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/90 ${
          chatActive
            ? "bottom-[208px] lg:bottom-3 lg:right-[336px] right-3"
            : "bottom-3 right-3"
        }`}
      >
        ⛶ Fullscreen
      </button>
    </div>
  )
}