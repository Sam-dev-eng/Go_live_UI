import apiClient from "../api/apiClient"

export const login = async (data) => {

  const response = await apiClient.post("/auth/login", data)

  return response.data

}

export const register = async (data) => {
  const response = await apiClient.post("/auth/register", data)
  return response.data
}

export const getCurrentUser = async ()=> {
    const response = await apiClient.get("/auth/me")
    return response.data;
}
