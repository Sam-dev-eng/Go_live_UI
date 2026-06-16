import apiClient from "../api/apiClient"

export const getLiveKitToken = async ({ streamId, role, hostKey }) => {
  const response = await apiClient.post("/livekit/token", {
    stream_id: streamId,
    role,
    host_key: hostKey,
  })

  return response.data
}