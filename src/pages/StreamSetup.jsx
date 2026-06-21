import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router"
import { Room } from "livekit-client"
import Layout from "../components/Layout"
import { getStreamById, startStream, endStream } from "../services/streamService"
import { getLiveKitToken } from "../services/liveKidServices"
import HostChat from "../components/HostChat"

export default function StreamSetup() {
  const { streamId } = useParams()
  const [searchParams] = useSearchParams()
  const hostKey = searchParams.get("hostKey")

  const [stream, setStream] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [isMouthpieceEnabled, setIsMouthpieceEnabled] = useState(true)
  const [isDeviceSoundEnabled, setIsDeviceSoundEnabled] = useState(true)
  const roomRef = useRef(null)

  useEffect(() => {
    const fetchStream = async () => {
      const data = await getStreamById(streamId)
      setStream(data)
    }

    fetchStream()
  }, [streamId])

  const startScreenShare = async () => {
    if (!hostKey) {
      alert("Missing host key")
      return
    }

    try {
      await startStream(streamId, hostKey)
    } catch (err) {
      console.log("Stream may already be live", err)
    }

    const data = await getLiveKitToken({
      streamId,
      role: "HOST",
      hostKey,
    })

    const room = new Room()
    roomRef.current = room

    await room.connect(data.livekit_url, data.token)

    // Publish screen share track with option for system audio
    await room.localParticipant.setScreenShareEnabled(true, { audio: isDeviceSoundEnabled })

    // Publish local microphone based on starting preferences
    await room.localParticipant.setMicrophoneEnabled(isMouthpieceEnabled)

    setIsLive(true)
  }

  const stopStream = async () => {
    await roomRef.current?.localParticipant.setScreenShareEnabled(false)
    await roomRef.current?.localParticipant.setMicrophoneEnabled(false)
    roomRef.current?.disconnect()

    await endStream(streamId, hostKey)

    setIsLive(false)
  }

  const toggleMouthpiece = async () => {
    const nextVal = !isMouthpieceEnabled
    setIsMouthpieceEnabled(nextVal)
    if (roomRef.current) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(nextVal)
    }
  }

  const toggleDeviceSound = async () => {
    const nextVal = !isDeviceSoundEnabled
    setIsDeviceSoundEnabled(nextVal)
    if (roomRef.current) {
      roomRef.current.localParticipant.trackPublications.forEach((pub) => {
        if (pub.trackSource === "screen_share_audio") {
          if (nextVal) {
            pub.unmute()
          } else {
            pub.mute()
          }
        }
      })
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (!stream) {
    return <p className="p-6 text-gray-400">Loading stream setup...</p>
  }

  const watchUrl = `${window.location.origin}/watch/${streamId}`

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Go Live</h1>

      <div className="bg-[#18181b] p-6 rounded-lg max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Watch Link</p>

          <div className="flex gap-2">
            <input
              value={watchUrl}
              readOnly
              className="flex-1 bg-[#0e0e10] p-2 rounded"
            />

            <button
              onClick={() => copy(watchUrl)}
              className="bg-purple-600 px-3 rounded"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startScreenShare}
            disabled={isLive}
            className="bg-green-600 px-4 py-2 rounded disabled:opacity-50 font-bold"
          >
            {isLive ? "Live Now" : "Start Screen Share"}
          </button>

          {isLive && (
            <button
              onClick={stopStream}
              className="bg-red-600 px-4 py-2 rounded font-bold"
            >
              End Stream
            </button>
          )}
        </div>

        {/* Audio controls */}
        <div className="border-t border-zinc-800 pt-6 mt-4">
          <h3 className="text-sm font-bold mb-4 text-purple-400 uppercase tracking-widest">
            Audio Stream Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mouthpiece */}
            <button
              onClick={toggleMouthpiece}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 ${
                isMouthpieceEnabled
                  ? "bg-purple-650/10 border-purple-500/40 text-purple-300"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isMouthpieceEnabled ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-600"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    {isMouthpieceEnabled ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Mouthpiece</p>
                  <p className="text-xs text-zinc-400">Device Microphone</p>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 ${isMouthpieceEnabled ? "bg-purple-600" : "bg-zinc-800"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 transform ${isMouthpieceEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>

            {/* Device Sound */}
            <button
              onClick={toggleDeviceSound}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 ${
                isDeviceSoundEnabled
                  ? "bg-purple-650/10 border-purple-500/40 text-purple-300"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDeviceSoundEnabled ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-600"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Device Sound</p>
                  <p className="text-xs text-zinc-400">System/Tab Audio</p>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 ${isDeviceSoundEnabled ? "bg-purple-600" : "bg-zinc-800"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 transform ${isDeviceSoundEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>
          {isLive && (
            <p className="text-xs text-zinc-500 mt-3 text-center">
              * Note: Chrome/Firefox require selecting "Share audio" in the popup menu to cast system sound.
            </p>
          )}
        </div>
      </div>
      <HostChat streamId={streamId} />
    </Layout>
  )
}