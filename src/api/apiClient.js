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
---------------------------------------
*/
// apiClient.interceptors.request.use(
//   (config) => {

//     const token = localStorage.getItem("accessToken")

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// /*
// ---------------------------------------
// Handle Token Refresh
// ---------------------------------------
// */
// apiClient.interceptors.response.use(

//   (response) => response,

//   async (error) => {

//     const originalRequest = error.config

//     // If token expired
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {

//       originalRequest._retry = true

//       try {

//         const refreshToken = localStorage.getItem("refreshToken")

//         if (!refreshToken) {
//           throw new Error("No refresh token")
//         }

//         const response = await axios.post(
//           `${API_BASE_URL}/auth/refresh`,
//           {
//             refreshToken: refreshToken
//           }
//         )

//         const newAccessToken = response.data.accessToken

//         // Save new token
//         localStorage.setItem("accessToken", newAccessToken)

//         // Update header
//         apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

//         // Retry original request
//         return apiClient(originalRequest)

//       } catch (refreshError) {

//         // Refresh failed → logout user
//         localStorage.removeItem("accessToken")
//         localStorage.removeItem("refreshToken")

//         window.location.href = "/login"

//         return Promise.reject(refreshError)

//       }

//     }

//     return Promise.reject(error)

//   }
// )

export default apiClient
