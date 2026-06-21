import axios from "axios"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/*
---------------------------------------
Attach Access Token To Every Request

Priority:
  1. adminToken  — set by AdminLogin on successful admin login
  2. accessToken — set by the regular user auth flow

Admin requests always include the adminToken so the Bearer header
is populated before the security filter validates it.
---------------------------------------
*/
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken")
    const accessToken = localStorage.getItem("accessToken")

    const token = adminToken || accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
