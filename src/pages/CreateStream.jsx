import { useState } from "react"
import Layout from "../components/Layout"
import { createStream } from "../services/streamService"
import { useNavigate } from "react-router"

export default function CreateStream() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("SCREEN_SHARE")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!title.trim() || !category.trim()) {
      alert("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const stream = await createStream({
        title: title.trim(),
        category: category.trim(),
        type
      })
      navigate(`/stream-setup/${stream.stream_id}?hostKey=${stream.host_key}`)
    } catch (err) {
      console.error("Failed to create stream", err)
      alert("Failed to create stream. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-zinc-950/40 border border-zinc-900 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Go Live
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Start your live broadcast session in seconds.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                Stream Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your stream"
                className="w-full bg-[#0e0e10] border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white p-3.5 rounded-xl text-sm transition-all focus:outline-none placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Gaming, Esports, Music, Football"
                className="w-full bg-[#0e0e10] border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white p-3.5 rounded-xl text-sm transition-all focus:outline-none placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                Stream Source
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType("CAMERA")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                    type === "CAMERA"
                      ? "bg-purple-950/20 border-purple-500 text-purple-400"
                      : "bg-[#0e0e10] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  <span className="text-sm font-bold">Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("SCREEN_SHARE")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                    type === "SCREEN_SHARE"
                      ? "bg-purple-950/20 border-purple-500 text-purple-400"
                      : "bg-[#0e0e10] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                  </svg>
                  <span className="text-sm font-bold">Screen Share</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Start Stream Session"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
