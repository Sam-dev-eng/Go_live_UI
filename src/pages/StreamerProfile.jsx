import { useParams } from "react-router"
import Layout from "../components/Layout"

export default function StreamerProfile() {
 
  const { username } = useParams()

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-4">
        {username}
      </h1>

      <p className="text-gray-400 mb-6">
        Streamer profile page
      </p>

    </Layout>
  )
}
