export default function ChatSkeleton() {

  return (
    <div className="space-y-3 animate-pulse">

      {[...Array(6)].map((_, i) => (

        <div key={i} className="flex gap-2">

          <div className="bg-gray-700 w-16 h-3 rounded"></div>

          <div className="bg-gray-700 w-40 h-3 rounded"></div>

        </div>

      ))}

    </div>
  )
}
