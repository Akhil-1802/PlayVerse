import apiClient from "../api/client";


export const createRoom = async(roomData) =>{
    const response = await apiClient.post('/api/room/create',roomData);
    return response.data;
}

export const joinRoom = async(roomData) =>{
    const response = await apiClient.post('/api/room/join', roomData);

    return response.data;
}