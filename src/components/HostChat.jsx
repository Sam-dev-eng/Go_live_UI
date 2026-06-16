import { useState, useEffect } from "react"
import Chat from "./Chat"

export default function HostChat({ streamId }) {
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [position, setPosition] = useState({ x: 24, y: 120 })
  const [iconPosition, setIconPosition] = useState({
    x: window.innerWidth - 90,
    y: window.innerHeight - 90,
  })
  const [size, setSize] = useState({ width: 320, height: 500 })

  const [dragging, setDragging] = useState(false)
  const [draggingIcon, setDraggingIcon] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const startDrag = (e) => {
    if (maximized || isMobile) return
    setDragging(true)
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const startIconDrag = (e) => {
    setDraggingIcon(true)
    setOffset({
      x: e.clientX - iconPosition.x,
      y: e.clientY - iconPosition.y,
    })
  }

  const startResize = (e) => {
    if (maximized || isMobile) return
    e.stopPropagation()
    setResizing(true)
  }

  const onMove = (e) => {
    if (dragging && !isMobile) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      })
    }

    if (draggingIcon) {
      setIconPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      })
    }

    if (resizing && !isMobile) {
      setSize({
        width: Math.max(280, e.clientX - position.x),
        height: Math.max(320, e.clientY - position.y),
      })
    }
  }

  const stopAction = () => {
    setDragging(false)
    setDraggingIcon(false)
    setResizing(false)
  }

  const openChat = () => {
    setMinimized(false)
    setUnreadCount(0)
  }

  const handleNewMessage = () => {
    if (minimized) {
      setUnreadCount((prev) => prev + 1)
    }
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseUp={stopAction}
      onMouseLeave={stopAction}
      className="fixed inset-0 pointer-events-none z-[9999]"
    >
      {minimized && (
        <button
          type="button"
          onMouseDown={startIconDrag}
          onDoubleClick={openChat}
          style={{
            left: isMobile ? window.innerWidth - 75 : iconPosition.x,
            top: isMobile ? window.innerHeight - 75 : iconPosition.y,
          }}
          className="absolute pointer-events-auto bg-purple-600 text-white w-14 h-14 rounded-full shadow-lg cursor-move flex items-center justify-center text-xl hover:bg-purple-700 transition-colors"
          title="Double click to open chat"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-6 h-6 px-1 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      <div
        style={
          isMobile
            ? {
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "50vh",
                zIndex: 999
              }
            : maximized
              ? {
                  left: 20,
                  top: 20,
                  width: "calc(100vw - 40px)",
                  height: "calc(100vh - 40px)",
                }
              : {
                  left: position.x,
                  top: position.y,
                  width: size.width,
                  height: size.height,
                }
        }
        className={`
          absolute pointer-events-auto bg-[#18181b] rounded-t-2xl md:rounded-lg shadow-2xl
          border border-gray-700 flex flex-col overflow-hidden
          ${minimized ? "hidden" : ""}
        `}
      >
        <div
          onMouseDown={isMobile ? null : startDrag}
          className={`${isMobile ? "" : "cursor-move"} flex items-center justify-between px-3 py-2.5 bg-[#0e0e10] border-b border-gray-700 z-10 shrink-0`}
        >
          <p className="font-semibold text-sm text-white">Host Chat</p>

          <div className="flex gap-2">
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors"
              >
                Hide Chat
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setMinimized(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors"
                  title="Minimize"
                >
                  −
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setMaximized((prev) => !prev)}
                  className="bg-gray-800 hover:bg-gray-700 text-white w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors"
                  title={maximized ? "Restore" : "Maximize"}
                >
                  {maximized ? "↙" : "□"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <Chat streamId={streamId} compact onNewMessage={handleNewMessage} />
        </div>

        {!maximized && !isMobile && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize bg-gray-500/70 rounded-sm"
            title="Resize"
          />
        )}
      </div>
    </div>
  )
}