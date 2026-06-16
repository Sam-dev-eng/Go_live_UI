import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { useAuth } from "../context/AuthContext"

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  // Sync state with URL parameter if it changes
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate("/")
    }
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-black border-b border-gray-800">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl lg:hidden hover:text-purple-400 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div 
          onClick={() => navigate("/")}
          className="text-white font-black text-xl tracking-wider cursor-pointer hover:text-purple-500 transition-colors"
        >
          STREAMERLY
        </div>
      </div>

      <div className="hidden md:flex gap-6 text-gray-300 font-medium">
        <button onClick={() => navigate("/")} className="hover:text-purple-400 transition-colors">Discover</button>
        <button onClick={() => navigate("/")} className="hover:text-purple-400 transition-colors">Browse</button>
        <button onClick={() => navigate("/?category=esports")} className="hover:text-purple-400 transition-colors">Esports</button>
        <button onClick={() => navigate("/?category=football")} className="hover:text-purple-400 transition-colors">Football</button>
      </div>

      <div className="flex gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white px-3 py-1.5 pr-8 rounded-full text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 w-44 md:w-60"
            placeholder="Search category or title..."
          />
          <button type="submit" className="absolute right-2.5 text-gray-400 hover:text-purple-400 transition-colors">
            <Search size={16} />
          </button>
        </form>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-semibold text-gray-200 hover:text-purple-400 transition-colors"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}