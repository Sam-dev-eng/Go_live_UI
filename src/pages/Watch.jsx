import { useEffect, useState } from "react"
import { useParams } from "react-router"
import Chat from "../components/Chat"
import Layout from "../components/Layout"
import VideoPlayer from "../components/VideoPlayer"
import { getStreamById } from "../services/streamService"
import apiClient from "../api/apiClient"

export default function Watch() {
  const { streamId } = useParams()
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

    fetchStream()
  }, [streamId])

  useEffect(() => {
  if (!streamId) return

  const join = async () => {
    try {
      await apiClient.patch(`/streams/${streamId}/viewer-join`)
    } catch (err) {
      console.error("Failed to join viewer", err)
    }
  }

  join()

  return () => {
    apiClient.patch(`/streams/${streamId}/viewer-leave`)
  }
}, [streamId])

 if (!stream) {
    return <p className="text-gray-400 p-6">Loading stream...</p>
  }

  return (
    <Layout>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">

          <VideoPlayer streamId={streamId} />

          <div className="mt-4">

            <h1 className="text-xl font-bold">
              {stream.title}
            </h1>

            <p className="text-gray-400 text-sm">
                {stream.viewer_count || 0} watching
            </p>

            <p className="text-gray-400 text-sm">
                Live stream
            </p>

          </div>

        </div>

        <div className="lg:col-span-1">
            <Chat streamId={streamId} />
        </div>

      </div>

    </Layout>
  )
}