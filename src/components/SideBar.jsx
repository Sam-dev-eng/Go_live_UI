import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { getTrendingStreams } from "../services/streamService"

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate()
  const [trendingStreams, setTrendingStreams] = useState([])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingStreams()
        // Limit to top 5 trending streams for clean UI
        setTrendingStreams(data.slice(0, 5))
      } catch (err) {
        console.error("Failed to load trending streams in sidebar", err)
      }
    }
    fetchTrending()
    // Poll trending streams every 15 seconds to keep it fresh and real-time
    const interval = setInterval(fetchTrending, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static
        top-0 left-0
        h-full
        w-64
        bg-black
        border-r border-gray-800
        p-5
        transform
        transition-transform
        duration-300
        z-50
        
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="font-bold text-white">
            Menu
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-4 text-gray-400 font-semibold text-sm">
          <div 
            onClick={() => navigate("/")} 
            className="hover:text-white cursor-pointer transition-colors py-1 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
            Home
          </div>

          <div 
            onClick={() => navigate("/")} 
            className="hover:text-white cursor-pointer transition-colors py-1 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-transparent"></span>
            Following
          </div>

          <div 
            onClick={() => navigate("/")} 
            className="hover:text-white cursor-pointer transition-colors py-1 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-transparent"></span>
            Channels
          </div>

          <div 
            onClick={() => navigate("/?category=gaming")} 
            className="hover:text-white cursor-pointer transition-colors py-1 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-transparent hover:bg-purple-500"></span>
            Games
          </div>

          <div 
            onClick={() => navigate("/?category=football")} 
            className="hover:text-white cursor-pointer transition-colors py-1 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-transparent hover:bg-purple-500"></span>
            Football
          </div>
        </nav>

        <div className="mt-10 border-t border-gray-900 pt-6">
          <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">
            TRENDING CHANNELS
          </h3>

          <div className="space-y-3">
            {trendingStreams.length === 0 ? (
              <p className="text-gray-600 text-xs italic">No active channels</p>
            ) : (
              trendingStreams.map((stream) => (
                <div
                  key={stream.stream_id}
                  onClick={() => navigate(`/watch/${stream.stream_id}`)}
                  className="flex justify-between items-center group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 group-hover:scale-110 transition-transform"></span>
                    <span className="text-gray-400 group-hover:text-white truncate text-xs transition-colors">
                      {stream.title}
                    </span>
                  </div>
                  <span className="text-gray-600 text-[10px] shrink-0 font-medium group-hover:text-purple-400 transition-colors">
                    {stream.viewer_count} watching
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  )
}