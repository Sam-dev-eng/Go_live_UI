import { useState } from "react"
import { register } from "../services/authService"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"
import { Radio, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export default function Register() {
  const { loginUser }           = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register({ username, email, password })
      loginUser()
      navigate("/home")
    } catch {
      setError("Registration failed. Please check your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-purple-900/40 mb-4">
            <Radio size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-500 mt-1">Start streaming on GoLive for free</p>
        </div>

        {/* Card */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 text-red-400 text-sm px-3 py-2.5 rounded-xl">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                placeholder="coolstreamer99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/8 focus:border-violet-500/60 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/8 focus:border-violet-500/60 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/8 focus:border-violet-500/60 text-white text-sm px-4 py-2.5 pr-10 rounded-xl outline-none transition-all placeholder-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/30 mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
