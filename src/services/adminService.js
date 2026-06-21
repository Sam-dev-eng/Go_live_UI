import apiClient from "../api/apiClient"

/**
 * Admin API service — all functions use apiClient which automatically
 * attaches the adminToken from localStorage as the Bearer token.
 *
 * Each function wraps a single API call and returns the unwrapped data
 * so callers don't need to know about axios response structure.
 */

/**
 * Authenticates the admin and stores the JWT in localStorage.
 *
 * On success, saves `adminToken` and `adminTokenExpiry` to localStorage.
 * The interceptor in apiClient.js will pick up adminToken on all subsequent calls.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string, expiresAt: string}>}
 * @throws Will re-throw axios errors (401 on bad credentials)
 */
export async function adminLogin(username, password) {
  const { data } = await apiClient.post("/admin/auth/login", { username, password })
  localStorage.setItem("adminToken", data.token)
  localStorage.setItem("adminTokenExpiry", data.expires_at)
  return data
}

/**
 * Clears admin session from localStorage.
 * Call this on logout or when the token is detected as expired.
 */
export function adminLogout() {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminTokenExpiry")
}

/**
 * Checks whether a valid adminToken is currently stored.
 * Does NOT verify signature — just presence. The server will reject
 * expired tokens with 401, at which point the UI redirects to login.
 *
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  return Boolean(localStorage.getItem("adminToken"))
}

/**
 * Fetches all streams regardless of status.
 * Requires a valid admin JWT (attached automatically by apiClient interceptor).
 *
 * @returns {Promise<Array>} list of stream objects
 */
export async function getAllStreams() {
  const { data } = await apiClient.get("/admin/streams/all")
  return data
}

/**
 * Fetches aggregate dashboard stats.
 * Requires a valid admin JWT.
 *
 * @returns {Promise<{total_streams, live_now, ended_today, total_viewers}>}
 */
export async function getStreamStats() {
  const { data } = await apiClient.get("/admin/streams/stats")
  return data
}

/**
 * Force-ends a live stream by ID.
 * Bypasses host key check — admin JWT is the authority.
 * Requires a valid admin JWT.
 *
 * @param {string} streamId UUID of the stream to force-end
 * @returns {Promise<Object>} updated stream object with status ENDED
 */
export async function forceEndStream(streamId) {
  const { data } = await apiClient.delete(`/admin/streams/${streamId}/force-end`)
  return data
}
