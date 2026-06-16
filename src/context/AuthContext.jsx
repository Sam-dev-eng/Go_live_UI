import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser } from "../services/authService"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loginUser = (data) => {

    localStorage.setItem("accessToken", data.accessToken)
    localStorage.setItem("refreshToken", data.refreshToken)

    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    setUser(null)
  }

  /*
  ----------------------------------
  Restore User On App Load
  ----------------------------------
  */

  useEffect(() => {

    const loadUser = async () => {

      const token = localStorage.getItem("accessToken")

      if (!token) {
        setLoading(false)
        return
      }

      try {

        const userData = await getCurrentUser()

        setUser(userData)

      } catch (error) {

        logout()

      } finally {

        setLoading(false)

      }

    }

    loadUser()

  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
