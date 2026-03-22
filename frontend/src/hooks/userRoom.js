import {createRoom, joinRoom} from "../services/userServices.js"
import { useState } from "react";


const useRoom = () =>{
    const [loading, setLoading] = useState(false);
    const [error , setError] = useState(null);
    const createroom = async(roomData) =>{
        setLoading(true);
        setError(null);

        try {
            const data = await createRoom(roomData);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create room");
            throw err;
        }
        finally{
            setLoading(false);
        }
    };

    const joinroom = async(roomData) =>{
        setLoading(true);
        setError(null);
        try {
            const data = await joinRoom(roomData);
            return data;
        } catch (error) {
            setError(error.response?.data?.message || "Failed to join room");
            throw error
        }
        finally{
            setLoading(false);
        }
    }
    return {loading, error,createroom,joinroom};
}


export default useRoom;