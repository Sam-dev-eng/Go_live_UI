import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import Chat from "../components/Chat"
import Layout from "../components/Layout"
import VideoPlayer from "../components/VideoPlayer"
import { getStreamById } from "../services/streamService"

export default function Watch() {
  const { streamId } = useParams()
  const navigate = useNavigate()
  console.log("Stream ID:", streamId)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const data = await getStreamById(streamId)
        console.log("Fetched stream data:0-----------------------")
        setStream(data)
      } catch (err) {
        console.error("Failed to load stream")
      }
    }

    if (streamId) {
      fetchStream()
    }
  }, [streamId])

  if (!stream) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e10] text-white">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          {isEnded ? (
            <div className="aspect-video w-full bg-[#18181b] rounded-lg border border-gray-800 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden shadow-2xl">
              <div className="z-10 flex flex-col items-center">
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 animate-pulse">
                  ENDED
                </div>
                <h3 className="text-2xl font-black text-white mb-2">This Stream Has Ended</h3>
                <p className="text-gray-400 text-sm max-w-md mb-6">
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
            <VideoPlayer streamId={streamId} />
          )}

          <div className="mt-6 bg-[#18181b] border border-gray-800 p-5 rounded-xl">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {stream.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="bg-purple-950/40 text-purple-400 border border-purple-900/30 px-3 py-1 rounded-full text-xs font-semibold">
                {stream.category || "General"}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${isEnded ? "bg-gray-600" : "bg-red-600 animate-ping"}`}></span>
                {isEnded ? "0 watching" : `${stream.viewer_count || 0} watching`}
              </span>
              <span className="text-gray-500 text-sm">
                Status: {isEnded ? "Ended" : "Live"}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Chat 
            streamId={streamId}
            onViewerCountUpdate={(count) => {
              // Only update if not ended
              setStream((prev) => {
                if (!prev) return null
                if (prev.status === "ENDED") return prev
                return { ...prev, viewer_count: count }
              })
            }}
            onStreamEnded={() => {
              setStream((prev) => prev ? { ...prev, status: "ENDED", viewer_count: 0 } : null)
            }}
          />
        </div>
      </div>
    </Layout>
  )
}