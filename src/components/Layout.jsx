import { useState } from "react"
import Navbar from "./Navbar"
import Sidebar from "./SideBar"

export default function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-[#0e0e10] min-h-screen text-white">

      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">

        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>

      </div>

    </div>
  )
}