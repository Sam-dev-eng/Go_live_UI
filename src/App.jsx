import {BrowserRouter , Routes,Route} from "react-router"
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StreamerProfile from "./pages/StreamerProfile";
import CreateStream from "./pages/CreateStream";
import Dashboard from "./pages/Dashboard";
import StreamSetup from "./pages/StreamSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App(){
  const {loading} = useAuth();
  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen text-white">
      Loading...
    </div>
  )
}
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" 
        element={
        <Home/>
        }/>

        <Route 
        path="/home" 
        element={
        // <ProtectedRoute>
           <Home/> 
        // </ProtectedRoute>
      }/>
        <Route 
        path="/watch/:streamId" 
        element={
        // <ProtectedRoute>
           <Watch/> 
        // </ProtectedRoute>  
      }/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        <Route 
        path="/dashboard" 
        element={
        // <ProtectedRoute> 
          <Dashboard /> 
        // </ProtectedRoute> 
      } />
        <Route 
        path="/create-stream" 
        element={
        // <ProtectedRoute> 
          <CreateStream /> 
        // </ProtectedRoute>
      } />

        <Route 
        path="/streamer/:username" 
        element={ 
        // <ProtectedRoute> 
          <StreamerProfile /> 
        // </ProtectedRoute> 
      } />

        <Route 
        path="/stream-setup/:streamId" 
        element={
        // <ProtectedRoute> 
          <StreamSetup/> 
        // </ProtectedRoute>  
      }/>
      </Routes>
    </BrowserRouter>
  )
}

export default App