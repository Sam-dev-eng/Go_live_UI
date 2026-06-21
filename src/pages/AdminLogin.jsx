import { useState } from "react"
import { useNavigate } from "react-router"
import { adminLogin } from "../services/adminService"

/**
 * AdminLogin page — /admin/login
 *
 * Premium glassmorphism design with animated gradient background.
 * On successful login, the adminToken is saved by adminService and
 * the user is redirected to /admin/dashboard.
 */
export default function AdminLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await adminLogin(username, password)
      navigate("/admin/dashboard", { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.")
      } else {
        setError("Connection error. Is the backend running?")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Animated gradient orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <div style={styles.logoRing}>
            <span style={styles.logoIcon}>⚡</span>
          </div>
          <h1 style={styles.brandName}>GoLive</h1>
          <span style={styles.brandBadge}>Admin Console</span>
        </div>

        <p style={styles.subtitle}>Sign in to manage your live streams</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            <span style={styles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} id="admin-login-form">
          <div style={styles.fieldGroup}>
            <label htmlFor="admin-username" style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="admin-password" style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonLoading } : styles.button}
            onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.button)}
          >
            {loading ? (
              <span style={styles.spinnerRow}>
                <span style={styles.spinner} />
                Authenticating…
              </span>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          GoLive Admin Console · Secure Access Only
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 10px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-40px, 30px) scale(1.1); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(139, 92, 246, 0); }
        }
      `}</style>
    </div>
  )
}

// ── Inline styles ────────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: "100vh",
    background: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  orb1: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
    top: "-200px",
    left: "-150px",
    animation: "orbFloat1 12s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
    bottom: "-150px",
    right: "-100px",
    animation: "orbFloat2 15s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)",
    top: "40%",
    right: "20%",
    animation: "orbFloat3 10s ease-in-out infinite",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
    animation: "fadeIn 0.5s ease-out",
  },

  brand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pulseRing 3s ease-in-out infinite",
    marginBottom: 4,
  },
  logoIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  brandName: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    background: "linear-gradient(135deg, #c4b5fd, #93c5fd)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },
  brandBadge: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#8b5cf6",
    background: "rgba(139,92,246,0.12)",
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid rgba(139,92,246,0.25)",
  },

  subtitle: {
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    marginBottom: 32,
    lineHeight: 1.5,
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: 13.5,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 16,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.02em",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    fontSize: 16,
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "13px 16px 13px 44px",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    width: "100%",
    background: "rgba(139,92,246,0.08)",
    border: "1px solid rgba(139,92,246,0.5)",
    borderRadius: 12,
    padding: "13px 16px 13px 44px",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxShadow: "0 0 0 3px rgba(139,92,246,0.12)",
    boxSizing: "border-box",
  },

  button: {
    marginTop: 8,
    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
    letterSpacing: "0.02em",
  },
  buttonHover: {
    background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 8px 28px rgba(139,92,246,0.45)",
    marginTop: 8,
    border: "none",
    borderRadius: 12,
    padding: "14px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
    marginTop: 28,
    marginBottom: 0,
    letterSpacing: "0.03em",
  },
}
