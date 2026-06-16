import { useState } from "react"
import Layout from "../components/Layout"
import { createStream } from "../services/streamService"
import { useNavigate } from "react-router"


export default function CreateStream() {
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [type, setType] = useState("SCREEN_SHARE");
    const navigate = useNavigate();

    const handleCreate = async () => {
      console.log("hello")
    const stream = await createStream({
      title,
      category,
      type
    })
    console.log(stream.stream_id+" "+stream.host_key)
    navigate(`/stream-setup/${stream.stream_id}?hostKey=${stream.host_key}`)   
 // navigate(`/stream-setup/${stream?.id}`)
  }

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">
        Go Live
      </h1>

      <div className="bg-[#18181b] p-6 rounded-lg max-w-xl">

        <div className="mb-4">

          <label className="block text-sm mb-1">
            Stream Title
          </label>

          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="w-full bg-[#0e0e10] p-2 rounded"
          />

        </div>

        <div className="mb-4">

          <label className="block text-sm mb-1">
            Category
          </label>

          <input
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
            className="w-full bg-[#0e0e10] p-2 rounded"
          />

        </div>

        <div className="mb-4">

          <label className="block text-sm mb-2">
            Stream Type
          </label>

          <select
            value={type}
            onChange={(e)=>setType(e.target.value)}
            className="w-full bg-[#0e0e10] p-2 rounded"
          >

            <option value="CAMERA">Camera</option>
            <option value="SCREEN_SHARE">Screen Share</option>

          </select>

        </div>

        <button
          onClick={handleCreate}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Start stream 
        </button>

      </div>

    </Layout>
  )
}
