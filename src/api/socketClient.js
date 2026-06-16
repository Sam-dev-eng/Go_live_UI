import { Client } from "@stomp/stompjs";
import socketJs from "sockjs-client";

const socketClient = new Client({
    webSocketFactory : ()=> 
        new socketJs(`${import.meta.env.VITE_API_BASE_URL}/ws`),

    reconnectDelay : 5000,
    debug: (str) => {
        console.log("Stomp", str)
    }
})
export default socketClient