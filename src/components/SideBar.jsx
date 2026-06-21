import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { getTrendingStreams } from "../services/streamService"
import { Home, Compass, Users, Gamepad2, Trophy, X } from "lucide-react"

const NAV = [
  { icon: Home,      label: "Home",     path: "/" },
  { icon: Compass,   label: "Discover", path: "/" },
  { icon: Users,     label: "Following",path: "/" },
  { icon: Gamepad2,  label: "Gaming",   path: "/?category=gaming" },
  { icon: Trophy,    label: "Esports",  path: "/?category=esports" },
]

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [trending, setTrending] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTrendingStreams()
        setTrending(data.slice(0, 6))
      } catch { /* silent */ }
    }
    fetch()
    const id = setInterval(fetch, 15000)
    return () => clearInterval(id)
  }, [])

  const go = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-full w-60 z-50
          bg-[#0d0d15] border-r border-white/5
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile close row */}
        <div className="flex items-center justify-between px-4 py-4 lg:hidden border-b border-white/5">
          <span className="font-bold text-sm text-zinc-300">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Primary nav */}
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path && !location.search
            return (
              <button
                key={label}
                onClick={() => go(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  active
                    ? "bg-violet-600/20 text-violet-300 border border-violet-600/25"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={active ? "text-violet-400" : ""} />
                {label}
              </button>
            )
          })}

          {/* Trending section */}
          <div className="pt-5">
            <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Trending Now
            </p>
            <div className="space-y-1">
              {trending.length === 0 ? (
                <p className="px-3 text-xs text-zinc-700 italic">No active streams</p>
              ) : (
                trending.map((s) => (
                  <button
                    key={s.stream_id}
                    onClick={() => go(`/watch/${s.stream_id}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group text-left"
                  >
                    {/* Avatar placeholder */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600/60 to-purple-800/60 shrink-0 flex items-center justify-center text-[10px] font-bold text-violet-200">
                      {s.title?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 group-hover:text-white truncate transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {s.viewer_count ?? 0} watching
                      </p>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 live-dot shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}