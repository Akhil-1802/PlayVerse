import { io } from "socket.io-client";

export const socket = io("https://playverse-bg0l.onrender.com",{
    autoConnect : true,
    auth :{
        name : localStorage.getItem('name') || 'Anonymous',
    }
})