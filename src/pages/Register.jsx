import { useState } from "react"
import { register } from "../services/authService"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"


export default function Register() {
  const {loginUser} = useAuth();  
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  const handleRegister = async () => {

    try {

      await register({
        username,
        email,
        password
      })

      alert("Account created successfully")
      loginUser();
      navigate("/home")
    } catch (error) {

      console.error("Registration failed")

    }

  }

  return (

    <div className="flex items-center justify-center min-h-screen bg-[#0e0e10] text-white">

      <div className="bg-[#18181b] p-6 rounded-lg w-80">

        <h1 className="text-xl font-bold mb-4">
          Create Account
        </h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="w-full mb-3 p-2 bg-[#0e0e10] rounded"
        />

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
          onClick={handleRegister}
          className="bg-purple-600 w-full py-2 rounded"
        >
          Register
        </button>

      </div>

    </div>

  )
}
