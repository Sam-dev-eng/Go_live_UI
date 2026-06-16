import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import StreamCard from "../components/StreamCard"
import { getLiveStreams } from "../services/streamService"
import StreamCardSkeleton from "../components/skeletons/StreamCardSkeleton"


export default function Home() {

    const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchStreams = async () => {
      try {
        const data = await getLiveStreams()
        setStreams(data)
      } catch (err) {
        console.error("Failed to load streams", err)
      } finally {
        setLoading(false)

      }

    }

    fetchStreams()

  }, [])

  return (
    <Layout>

      <h2 className="text-xl font-bold mb-6">
        Live Now 
      </h2>

      {loading && (
        <p className="text-gray-400">Loading streams...</p>
      )}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
      ">

        {streams?.map((stream) => (
           <StreamCard key={stream.stream_id} {...stream} />
        //    <StreamCardSkeleton key={stream.id}/>
        ))}

      </div>

    </Layout>
  )
}