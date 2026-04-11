const Message = require("../models/message.model");
const Room = require("../models/room.model");
const { shuffle } = require("../utils/helperfunction");
const {words} = require("../utils/words");
//Creating the room

const shuffleWords = shuffle(words);
const createRoom = async(req , res) =>{
    try {
        const {name,rounds} = req.body;
        if(!name) return res.status(400).json({
            message : "Name is required"
        })
        const room_id = Math.floor(Math.random() * 10000);
        //RoomId shouldn't be repeated so we will check if it already exists in the database
        while(await Room.findOne({room_id})){
            room_id = Math.floor(Math.random() * 10000);
        }
        const newRoom = new Room({
            room_id,
            words : shuffleWords.slice(0,50), //get 3 random words from the shuffled array
            word : "",
            creater : name,
            rounds : rounds
        })
        const newMessage = new Message({
            room_id
        })
        await newMessage.save();
        await newRoom.save();
        res.status(200).json({
            message : "Room created successfully",
            room_id
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}



//Joining the room
const joinRoom = async(req , res) =>{
    try {
        const {name , room_id} = req.body;
        if(!name || !room_id) return res.status(400).json({
            message : "Name and Room Id are required"
        })
        const room = await Room.findOne({room_id});
        if(!room) return res.status(404).json({
            message : "Room not found"
        })
        //TODO : To create room for more than 2 players
        if(room.players.length >= 7) return res.status(400).json({
            message : "Room is full"
        })

        await room.save();
        res.status(200).json({
            message : "Joined the room successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {createRoom, joinRoom}