import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router"
import Layout from "../components/Layout"
import StreamCard from "../components/StreamCard"
import { getLiveStreams, getLiveStreamsByCategory } from "../services/streamService"

export default function Home() {
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchQuery = searchParams.get("search") || ""
  const categoryQuery = searchParams.get("category") || ""

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true)
      try {
        let data
        if (categoryQuery) {
          data = await getLiveStreamsByCategory(categoryQuery)
        } else {
          data = await getLiveStreams(searchQuery)
        }
        setStreams(data)
      } catch (err) {
        console.error("Failed to load streams", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStreams()
  }, [searchQuery, categoryQuery])

  // Helper to capitalize category title nicely
  const getHeaderTitle = () => {
    if (categoryQuery) {
      return `${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)} Channels`
    }
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`
    }
    return "Live Channels"
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {getHeaderTitle()}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {categoryQuery || searchQuery
              ? `Found ${streams.length} stream${streams.length === 1 ? "" : "s"}`
              : "Discover creators streaming right now"}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {(searchQuery || categoryQuery) && (
            <button
              onClick={() => navigate("/")}
              className="bg-gray-900 border border-gray-800 hover:border-purple-500 hover:bg-purple-950/20 text-purple-400 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
            >
              Clear Filter
            </button>
          )}
          <button
            onClick={() => navigate("/create-stream")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/25 animate-fade-in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.751l-3.37-3.371a1.5 1.5 0 0 1-.445-1.06V9.68a1.5 1.5 0 0 1 .445-1.06l3.37-3.37A1 1 0 0 1 21.65 6v12a1 1 0 0 1-1.71.751Z" />
            </svg>
            Go Live
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Loading active streams...</p>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-gray-950/30 border border-gray-900 rounded-2xl text-center">
          <div className="bg-purple-950/20 p-4 rounded-full text-purple-400 mb-4 border border-purple-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Live Streams Found</h3>
          <p className="text-gray-500 max-w-sm text-sm">
            {categoryQuery
              ? `There are currently no active live streams under the category "${categoryQuery}". Check back later!`
              : searchQuery 
                ? "We couldn't find any live streams matching your query. Try searching for something else or browse other categories."
                : "There are currently no active live streams. Check back later or start a new stream!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {streams.map((stream) => (
            <div key={stream.stream_id} className="transform hover:-translate-y-1 transition-all duration-300">
              <StreamCard {...stream} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}