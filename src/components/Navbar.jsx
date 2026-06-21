import { useState, useEffect } from "react"
import { Menu, Search, X, Radio } from "lucide-react"
import { useNavigate, useSearchParams, useLocation } from "react-router"
import { useAuth } from "../context/AuthContext"

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate("/")
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 transition-all duration-300 ${
        scrolled
          ? "bg-[#08080d]/90 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/40"
          : "bg-[#08080d] border-b border-white/5"
      }`}
    >
      {/* Left — Logo + Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-zinc-400 hover:text-white lg:hidden transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <Menu size={22} />
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-purple-900/40">
            <Radio size={14} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight gradient-text hidden sm:block">
            GoLive
          </span>
        </button>
      </div>

      {/* Centre — Nav links (desktop) */}
      <nav className="hidden lg:flex items-center gap-1">
        {[
          { label: "Discover", path: "/" },
          { label: "Gaming",   path: "/?category=gaming" },
          { label: "Esports",  path: "/?category=esports" },
          { label: "Football", path: "/?category=football" },
        ].map(({ label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/6 transition-all duration-200"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right — Search + Auth */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/8 text-white text-sm px-4 py-2 pr-9 rounded-full focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all placeholder-zinc-600 w-40 md:w-56"
            placeholder="Search streams…"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-violet-400 transition-colors"
          >
            <Search size={15} />
          </button>
        </form>

        {user && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/6 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => { logout(); navigate("/") }}
              className="text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}