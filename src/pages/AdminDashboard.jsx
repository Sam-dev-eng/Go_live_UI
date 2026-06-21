import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import {
  getAllStreams,
  getStreamStats,
  forceEndStream,
  adminLogout,
  isAdminAuthenticated,
} from "../services/adminService"
import VideoPlayer from "../components/VideoPlayer"

const STATUS_COLORS = {
  LIVE:    { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.3)" },
  CREATED: { bg: "rgba(234,179,8,0.12)",  text: "#facc15", border: "rgba(234,179,8,0.3)" },
  ENDED:   { bg: "rgba(107,114,128,0.12)", text: "#9ca3af", border: "rgba(107,114,128,0.3)" },
}

const TABS = ["Overview", "All Streams", "Live Now", "By Category"]

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [streams, setStreams]     = useState([])
  const [stats, setStats]         = useState(null)
  const [activeTab, setActiveTab] = useState("Overview")
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [ending, setEnding]       = useState(null) // streamId being force-ended
  const [watchingStreamId, setWatchingStreamId] = useState(null) // currently playing stream in modal (optional backup)

  // ── Guard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminAuthenticated()) navigate("/admin/login", { replace: true })
  }, [navigate])

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError("")
      const [streamsData, statsData] = await Promise.all([getAllStreams(), getStreamStats()])
      setStreams(streamsData)
      setStats(statsData)
    } catch (err) {
      if (err.response?.status === 401) {
        adminLogout()
        navigate("/admin/login", { replace: true })
      } else {
        setError("Failed to load data. Check backend connection.")
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Force end ─────────────────────────────────────────────────────────────
  async function handleForceEnd(streamId) {
    if (!window.confirm("Force-end this stream? This cannot be undone.")) return
    setEnding(streamId)
    try {
      await forceEndStream(streamId)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end stream.")
    } finally {
      setEnding(null)
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function handleLogout() {
    adminLogout()
    navigate("/admin/login", { replace: true })
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const liveStreams = streams.filter(s => s.status === "LIVE")

  const byCategory = liveStreams.reduce((acc, s) => {
    const cat = s.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = { count: 0, viewers: 0 }
    acc[cat].count++
    acc[cat].viewers += s.viewer_count ?? s.viewerCount ?? 0
    return acc
  }, {})

  // ── Render helpers ────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} onRetry={fetchData} onLogout={handleLogout} />

  const watchingStream = streams.find(s => (s.stream_id ?? s.streamId) === watchingStreamId)

  return (
    <div style={s.root}>
      <style>{KEYFRAMES}</style>

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarBrand}>
          <div style={s.brandLogo}>⚡</div>
          <div>
            <div style={s.brandTitle}>GoLive</div>
            <div style={s.brandSub}>Admin Console</div>
          </div>
        </div>

        <nav style={s.nav}>
          {TABS.map(tab => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? { ...s.navBtn, ...s.navBtnActive } : s.navBtn}
            >
              <span style={s.navIcon}>{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
        </nav>

        <button id="admin-logout-btn" onClick={handleLogout} style={s.logoutBtn}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.pageTitle}>{activeTab}</h1>
            <p style={s.pageSubtitle}>
              {activeTab === "Overview" && "Platform-wide stream statistics"}
              {activeTab === "All Streams" && `${streams.length} total streams`}
              {activeTab === "Live Now" && `${liveStreams.length} active streams`}
              {activeTab === "By Category" && `${Object.keys(byCategory).length} categories`}
            </p>
          </div>
          <button id="refresh-btn" onClick={fetchData} style={s.refreshBtn}>↻ Refresh</button>
        </header>

        <div style={s.content}>
          {activeTab === "Overview" && <OverviewTab stats={stats} />}
          {activeTab === "All Streams" && (
            <StreamTable
              streams={streams}
              ending={ending}
              onForceEnd={handleForceEnd}
              onWatch={setWatchingStreamId}
            />
          )}
          {activeTab === "Live Now" && (
            <LiveNowTab
              streams={liveStreams}
              ending={ending}
              onForceEnd={handleForceEnd}
            />
          )}
          {activeTab === "By Category" && <ByCategoryTab byCategory={byCategory} />}
        </div>
      </main>

      {/* Watch Modal Overlay (Optional fallback, e.g. for All Streams watch action) */}
      {watchingStreamId && watchingStream && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>📺 Viewing: {watchingStream.title}</h3>
                <span style={s.modalSubtitle}>
                  📁 {watchingStream.category || "General"} · 👥 {watchingStream.viewer_count ?? watchingStream.viewerCount ?? 0} watching
                </span>
              </div>
              <button style={s.closeModalBtn} onClick={() => setWatchingStreamId(null)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <VideoPlayer streamId={watchingStreamId} />
            </div>
            <div style={s.modalFooter}>
              <button
                onClick={() => {
                  if (window.confirm("Force-end this stream? This cannot be undone.")) {
                    handleForceEnd(watchingStreamId)
                    setWatchingStreamId(null)
                  }
                }}
                style={s.modalEndBtn}
              >
                🛑 Force End Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OverviewTab({ stats }) {
  if (!stats) return null
  const cards = [
    { label: "Total Streams",  value: stats.total_streams  ?? stats.totalStreams,  icon: "📡", color: "#8b5cf6" },
    { label: "Live Now",       value: stats.live_now       ?? stats.liveNow,       icon: "🔴", color: "#ef4444" },
    { label: "Ended Today",    value: stats.ended_today    ?? stats.endedToday,    icon: "✅", color: "#10b981" },
    { label: "Total Viewers",  value: stats.total_viewers  ?? stats.totalViewers,  icon: "👥", color: "#3b82f6" },
  ]
  return (
    <div style={s.statGrid}>
      {cards.map(c => (
        <div key={c.label} style={s.statCard}>
          <div style={{ ...s.statIcon, background: c.color + "22", color: c.color }}>{c.icon}</div>
          <div style={s.statValue}>{c.value ?? 0}</div>
          <div style={s.statLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

function StreamTable({ streams, ending, onForceEnd, onWatch }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {["Title", "Category", "Status", "Viewers", "Started", "Action"].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {streams.length === 0 ? (
            <tr><td colSpan={6} style={s.emptyCell}>No streams found.</td></tr>
          ) : streams.map(stream => {
            const id = stream.stream_id ?? stream.streamId
            const viewers = stream.viewer_count ?? stream.viewerCount ?? 0
            const sc = STATUS_COLORS[stream.status] || STATUS_COLORS.ENDED
            return (
              <tr key={id} style={s.tr}>
                <td style={s.td}>{stream.title}</td>
                <td style={s.td}><span style={s.catBadge}>{stream.category || "—"}</span></td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                    {stream.status}
                  </span>
                </td>
                <td style={s.td}>{viewers}</td>
                <td style={s.td} title={stream.started_at ?? stream.startedAt}>
                  {stream.status === "LIVE"
                    ? formatTime(stream.started_at ?? stream.startedAt)
                    : "—"}
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {stream.status === "LIVE" && (
                      <>
                        <button
                          onClick={() => onWatch(id)}
                          style={s.watchBtn}
                        >
                          👁️ Watch
                        </button>
                        <button
                          id={`force-end-${id}`}
                          onClick={() => onForceEnd(id)}
                          disabled={ending === id}
                          style={ending === id ? { ...s.endBtn, opacity: 0.5 } : s.endBtn}
                        >
                          {ending === id ? "Ending…" : "Force End"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LiveNowTab({ streams, ending, onForceEnd }) {
  if (streams.length === 0) return <EmptyState message="No streams are live right now." />
  return (
    <div style={s.liveGrid}>
      {streams.map(stream => {
        const id = stream.stream_id ?? stream.streamId
        const viewers = stream.viewer_count ?? stream.viewerCount ?? 0
        return (
          <div key={id} style={s.liveCard}>
            {/* Play the video stream directly inside the card */}
            <div style={s.liveVideoWrapper}>
              <VideoPlayer streamId={id} />
            </div>
            
            <div style={s.liveCardContent}>
              <div style={s.livePulseRow}>
                <span style={s.liveDot} />
                <span style={s.liveLabel}>LIVE</span>
              </div>
              <div style={s.liveTitle}>{stream.title}</div>
              <div style={s.liveMeta}>
                <span>📁 {stream.category || "Uncategorized"}</span>
                <span>👥 {viewers} viewers</span>
              </div>
              <div style={s.liveStarted}>
                Started {formatTime(stream.started_at ?? stream.startedAt)}
              </div>
              <button
                id={`live-end-${id}`}
                onClick={() => onForceEnd(id)}
                disabled={ending === id}
                style={ending === id ? { ...s.endBtnFull, opacity: 0.5 } : s.endBtnFull}
              >
                {ending === id ? "Ending stream…" : "🛑 Force End Stream"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ByCategoryTab({ byCategory }) {
  const entries = Object.entries(byCategory).sort((a, b) => b[1].count - a[1].count)
  if (entries.length === 0) return <EmptyState message="No live streams to categorize." />
  return (
    <div style={s.catGrid}>
      {entries.map(([cat, data]) => (
        <div key={cat} style={s.catCard}>
          <div style={s.catName}>{cat}</div>
          <div style={s.catStats}>
            <div style={s.catStat}>
              <span style={s.catStatVal}>{data.count}</span>
              <span style={s.catStatLbl}>Streams</span>
            </div>
            <div style={s.catDivider} />
            <div style={s.catStat}>
              <span style={s.catStatVal}>{data.viewers}</span>
              <span style={s.catStatLbl}>Viewers</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={s.emptyState}>
      <span style={s.emptyEmoji}>📭</span>
      <p style={s.emptyMsg}>{message}</p>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ ...s.root, alignItems: "center", justifyContent: "center" }}>
      <style>{KEYFRAMES}</style>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
        <div style={s.bigSpinner} />
        <p style={{ marginTop: 16 }}>Loading dashboard…</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry, onLogout }) {
  return (
    <div style={{ ...s.root, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#fca5a5" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <button onClick={onRetry}  style={s.refreshBtn}>↻ Retry</button>
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const TAB_ICONS = {
  "Overview":     "📊",
  "All Streams":  "📋",
  "Live Now":     "🔴",
  "By Category":  "📁",
}

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
`

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "#000000",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#fff",
  },
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "rgba(255,255,255,0.02)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "28px 16px",
    gap: 8,
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    height: "100vh",
  },
  sidebarBrand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "0 8px" },
  brandLogo: {
    width: 40, height: 40, borderRadius: 12,
    background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
  },
  brandTitle: { fontWeight: 700, fontSize: 16 },
  brandSub: { fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: {
    display: "flex", alignItems: "center", gap: 10,
    background: "transparent", border: "none", borderRadius: 10,
    color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500,
    padding: "10px 12px", cursor: "pointer", textAlign: "left",
    transition: "all 0.15s",
  },
  navBtnActive: {
    background: "rgba(139,92,246,0.15)",
    color: "#c4b5fd",
    border: "1px solid rgba(139,92,246,0.2)",
  },
  navIcon: { fontSize: 16 },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10, color: "#fca5a5", fontSize: 13, fontWeight: 500,
    padding: "10px 12px", cursor: "pointer", marginTop: "auto",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "32px 36px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  pageTitle: { margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" },
  pageSubtitle: { margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 },
  refreshBtn: {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "rgba(255,255,255,0.7)", padding: "8px 16px",
    cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  content: { padding: "28px 36px", flex: 1 },

  // Overview
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 },
  statCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "24px 20px",
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 },
  statValue: { fontSize: 36, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 },

  // Table
  tableWrap: { overflowX: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: {
    textAlign: "left", padding: "14px 18px",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.45)", fontWeight: 600,
    fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.1s" },
  td: { padding: "14px 18px", color: "rgba(255,255,255,0.8)" },
  emptyCell: { padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" },
  catBadge: {
    background: "rgba(59,130,246,0.1)", color: "#93c5fd",
    border: "1px solid rgba(59,130,246,0.2)", padding: "2px 8px", borderRadius: 20, fontSize: 12,
  },
  endBtn: {
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 8, color: "#fca5a5", padding: "6px 14px",
    cursor: "pointer", fontSize: 12, fontWeight: 600,
  },

  // Live Now grid
  liveGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 },
  liveCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden",
  },
  liveVideoWrapper: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#000",
  },
  liveCardContent: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  livePulseRow: { display: "flex", alignItems: "center", gap: 8 },
  liveDot: {
    width: 8, height: 8, borderRadius: "50%", background: "#4ade80",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  liveLabel: { fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: "0.1em" },
  liveTitle: { fontSize: 16, fontWeight: 600, color: "#fff" },
  liveMeta: { display: "flex", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 13 },
  liveStarted: { fontSize: 12, color: "rgba(255,255,255,0.3)" },
  endBtnFull: {
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10, color: "#fca5a5", padding: "10px",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
    marginTop: 8,
    transition: "background 0.2s",
  },

  // By Category
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  catCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: 20,
  },
  catName: { fontSize: 15, fontWeight: 600, marginBottom: 16, textTransform: "capitalize" },
  catStats: { display: "flex", alignItems: "center", gap: 16 },
  catStat: { display: "flex", flexDirection: "column", alignItems: "center" },
  catStatVal: { fontSize: 24, fontWeight: 700 },
  catStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  catDivider: { width: 1, height: 36, background: "rgba(255,255,255,0.1)" },

  // Empty
  emptyState: { textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)" },
  emptyEmoji: { fontSize: 48, display: "block", marginBottom: 12 },
  emptyMsg: { margin: 0, fontSize: 15 },

  // Loading
  bigSpinner: {
    width: 48, height: 48, border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#8b5cf6", borderRadius: "50%",
    animation: "spin 0.8s linear infinite", margin: "0 auto",
  },

  // Watch modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#0c0c0e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    width: "90%",
    maxWidth: 800,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
    display: "block",
  },
  closeModalBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50%",
    width: 32,
    height: 32,
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  modalBody: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    background: "#000",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  modalEndBtn: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10,
    color: "#fca5a5",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  watchBtn: {
    background: "rgba(139,92,246,0.15)",
    border: "1px solid rgba(139,92,246,0.25)",
    borderRadius: 8,
    color: "#c4b5fd",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.2s",
  },
}
