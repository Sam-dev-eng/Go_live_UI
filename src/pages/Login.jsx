import { useState } from "react"
import { login } from "../services/authService"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const handleLogin = async () => {

    try{
    const data = await login({
      email,
      password
    })

    loginUser(data)
    navigate("/home")
    }catch(err){
        alert("Invalid credentials")
    }
  }

  return (

    <div className="flex items-center justify-center min-h-screen bg-[#0e0e10] text-white">

      <div className="bg-[#18181b] p-6 rounded-lg w-80">

        <h1 className="text-xl font-bold mb-4">
          Login
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full mb-3 p-2 bg-[#0e0e10] rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full mb-4 p-2 bg-[#0e0e10] rounded"
        />

        <button
          onClick={handleLogin}
          className="bg-purple-600 w-full py-2 rounded"
        >
          Login
        </button>

      </div>

    </div>

  )
}


