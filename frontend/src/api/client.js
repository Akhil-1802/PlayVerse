import axios from "axios";


const apiClient = axios.create({
    baseURL : "https://playverse-bg0l.onrender.com",
    headers : {
        "Content-type" : "application/json"
    }
})

export default apiClient
