import apiClient from "../api/apiClient"

export const getLiveStreams = async () => {
  const response = await apiClient.get("/streams?status=LIVE")
  return response.data
}

export const getStreamById = async (id) => {
  if (!id) {
    throw new Error("streamId is undefined")
  }

  const response = await apiClient.get(`/streams/${id}`)
  return response.data
}

export const createStream = async (data) => {
  const response = await apiClient.post("/streams", {
    title: data.title,
    category: data.category,
    streamType: data.type
  })
  return response.data
}

export const startStream = async (streamId, hostKey) => {
  const response = await apiClient.patch(
    `/streams/${streamId}/start`,
    {},
    {
      headers: {
        "X-Host-Key": hostKey,
      },
    }
  )

  return response.data
}

export const endStream = async (streamId, hostKey) => {
  const response = await apiClient.patch(
    `/streams/${streamId}/end`,
    {},
    {
      headers: {
        "X-Host-Key": hostKey,
      },
    }
  )

  return response.data
}