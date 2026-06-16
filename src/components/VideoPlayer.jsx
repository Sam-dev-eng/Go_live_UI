import { useEffect, useRef, useState } from "react"
import { Room, RoomEvent } from "livekit-client"
import { getLiveKitToken } from "../services/liveKidServices"

export default function VideoPlayer({ streamId }) {
  const videoContainerRef = useRef(null)
  const roomRef = useRef(null)
  const [error, setError] = useState("")
  const [connected, setConnected] = useState(false)
  const playerRef = useRef(null)
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
          if (track.kind === "video") {
            const element = track.attach()
            element.autoplay = true
            element.playsInline = true
            element.className = "w-full h-full object-contain"

            if(videoContainerRef.current){
            videoContainerRef.current.innerHTML = ""
            videoContainerRef.current.appendChild(element)
            }
          }
        })

        await room.connect(data.livekit_url, data.token)

        if (mounted) setConnected(true)
      } catch (err) {
        console.error(err)
        setError("Unable to connect to stream")
      }
    }
    if(streamId)  {
      connectViewer()
    }
    return () => {
      mounted = false
      roomRef.current?.disconnect()
    }
  }, [streamId])


  

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
    <div ref={videoContainerRef} className="w-full h-full" />

    {!connected && !error && (
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        Waiting for stream...
      </div>
    )}

    {error && (
      <div className="absolute inset-0 flex items-center justify-center text-red-400">
        {error}
      </div>
    )}

    <button
      onClick={goFullScreen}
      className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded text-sm"
    >
      Fullscreen
    </button>
  </div>
)
}