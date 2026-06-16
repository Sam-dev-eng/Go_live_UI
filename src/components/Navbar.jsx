import {Menu} from "lucide-react"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext";

export default function Navbar({ toggleSidebar }) {

    const navigate = useNavigate();
    const {user , logout} = useAuth();
return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-black border-b border-gray-800">

      <div className="flex items-center gap-3">

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl lg:hidden"
        >
          <Menu size={24}/>
        </button>

        <div className="text-white font-bold text-lg">
          STREAMERLY
        </div>

      </div>

      <div className="hidden md:flex gap-6 text-gray-300">
        <button>Discover</button>
        <button>Browse</button>
        <button>Esports</button>
      </div>

      <div className="flex gap-3 items-center">

        <input
          className="hidden md:block bg-gray-800 px-3 py-1 rounded text-sm"
          placeholder="Search"
        />

        <div className="flex items-center gap-3">

  {!user && (
    <>
      <button
        onClick={() => navigate("/login")}
        className="text-sm text-gray-200"
      >
        Login
      </button>

      <button
        onClick={() => navigate("/register")}
        className="bg-purple-600 px-3 py-1 rounded text-sm"
      >
        Sign Up
      </button>
    </>
  )}

  {user && (
    <>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-sm text-gray-200"
      >
        Dashboard
      </button>

      <button
        onClick={() => {
          logout()
          navigate("/")
        }}
        className="bg-red-500 px-3 py-1 rounded text-sm"
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