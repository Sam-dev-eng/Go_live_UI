import apiClient from "../api/apiClient"

export const getLiveStreams = async (query = "") => {
  const url = query ? `/streams?query=${encodeURIComponent(query)}` : "/streams?status=LIVE"
  const response = await apiClient.get(url)
  return response.data
}

export const getTrendingStreams = async () => {
  const response = await apiClient.get("/streams/trending")
  return response.data
}

export const getLiveStreamsByCategory = async (category) => {
  const response = await apiClient.get(`/streams?category=${encodeURIComponent(category)}`)
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

export const likeStream = async (streamId) => {
  const response = await apiClient.patch(`/streams/${streamId}/like`)
  return response.data // { likes: <number> }
}