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

    await room.localParticipant.setScreenShareEnabled(true)

    setIsLive(true)
  }

  const stopStream = async () => {
    await roomRef.current?.localParticipant.setScreenShareEnabled(false)
    roomRef.current?.disconnect()

    await endStream(streamId, hostKey)

    setIsLive(false)
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

        <button
          onClick={startScreenShare}
          disabled={isLive}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          {isLive ? "Live Now" : "Start Screen Share"}
        </button>

        {isLive && (
          <button
            onClick={stopStream}
            className="bg-red-600 px-4 py-2 rounded ml-3"
          >
            End Stream
          </button>
        )}
      </div>
      <HostChat streamId={streamId} />
    </Layout>
  )
}