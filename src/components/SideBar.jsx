export default function Sidebar({ sidebarOpen, setSidebarOpen }) {

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static
        top-0 left-0
        h-full
        w-64
        bg-black
        border-r border-gray-800
        p-5
        transform
        transition-transform
        duration-300
        z-50
        
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >

        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 lg:hidden">

          <h2 className="font-bold">
            Menu
          </h2>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xl"
          >
            ✕
          </button>

        </div>

        <nav className="space-y-4 text-gray-300">

          <div className="hover:text-white cursor-pointer">
            Home
          </div>

          <div className="hover:text-white cursor-pointer">
            Following
          </div>

          <div className="hover:text-white cursor-pointer">
            Channels
          </div>

          <div className="hover:text-white cursor-pointer">
            Games
          </div>

        </nav>

        <div className="mt-10">

          <h3 className="text-sm text-gray-500 mb-3">
            LIVE CHANNELS
          </h3>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Shroud</span>
              <span className="text-green-500">LIVE</span>
            </div>

            <div className="flex justify-between">
              <span>Valkyrae</span>
              <span className="text-green-500">LIVE</span>
            </div>

          </div>

        </div>

      </aside>
    </>
  )
}