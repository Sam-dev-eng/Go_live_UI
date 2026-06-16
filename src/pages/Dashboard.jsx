import { useNavigate } from "react-router"
import Layout from "../components/Layout"

export default function Dashboard() {

  const navigate = useNavigate()

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">
        Streamer Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-[#18181b] p-6 rounded-lg">

          <h2 className="text-lg font-semibold mb-2">
            Go Live
          </h2>

          <p className="text-gray-400 text-sm mb-4">
            Start a new stream and broadcast to viewers.
          </p>
          <button
            onClick={() => navigate("/create-stream")}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Create Stream
          </button>

        </div>

      </div>

    </Layout>
  )
}
