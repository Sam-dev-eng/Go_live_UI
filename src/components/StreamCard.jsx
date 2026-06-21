import { useNavigate } from "react-router"
import VideoPlayer from "./VideoPlayer"
import { Eye } from "lucide-react"

export default function StreamCard({ stream_id, title, category, viewer_count }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/watch/${stream_id}`)}
      className="cursor-pointer group rounded-xl overflow-hidden bg-[#111118] border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/20 hover:-translate-y-0.5"
    >
      {/* Thumbnail / live player */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <VideoPlayer streamId={stream_id} />

        {/* Click catcher — lets card navigate without hijacking player controls */}
        <div className="absolute inset-0 z-10 bg-transparent" />

        {/* LIVE pill */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full pointer-events-none shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" />
          LIVE
        </div>

        {/* Viewer count */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-black/70 text-white/90 text-[10px] px-2 py-0.5 rounded-full pointer-events-none backdrop-blur-sm">
          <Eye size={10} />
          {viewer_count ?? 0}
        </div>
      </div>

      {/* Meta */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors line-clamp-1">
          {title}
        </p>
        {category && (
          <span className="inline-block mt-1 text-[10px] font-medium text-violet-400 bg-violet-900/20 border border-violet-800/30 px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
      </div>
    </div>
  )
}