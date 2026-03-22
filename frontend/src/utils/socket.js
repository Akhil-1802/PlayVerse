import { io } from "socket.io-client";

export const socket = io("http://localhost:3000",{
    autoConnect : true,
    auth :{
        name : localStorage.getItem('name') || 'Anonymous',
    }
})