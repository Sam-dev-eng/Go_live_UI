import { useNavigate } from "react-router"

export default function StreamCard({stream_id,thumbnail,title,category,viewer_count}) {

  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/watch/${stream_id}`)}
      className="cursor-pointer"
    >
      <div className="relative">

        <img
          src={thumbnail}
          className="rounded-lg w-full h-40 object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded">
          LIVE
        </div>
        <div className="absolute bottom-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
          {viewer_count} viewers
        </div>

      </div>

      <div className="mt-2">

        <p className="text-sm font-semibold line-clamp-1">
          {title}
        </p>

        <p className="text-xs text-gray-400">
          {category}
        </p>

      </div>

    </div>
  )
}