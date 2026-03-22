const mongoose = require('mongoose');


const RoomSchema = mongoose.Schema({
    room_id : {
        type : Number,
        required : true,
        unique : true
    },
    players : {
        type : Array,
        default : []
    },
    drawer : {
        type : String
    },
    currentDrawerIndex : {
        type: Number,
        default : 0
    },
    rounds : {
        type : Number,
        default : 3
    },
    word:{
        type : String
    },
    round: {
        type: Number,
        default : 1
    },
    words:{
        type : Array,
        default : []
    },
    usedWords : {
        type : Array,
        default : []
     }
    ,
    
    guessed_players:{
        type : Array,
        default : []
    },
    creater:{
        type: String,
        required : true
    },gameState :{
        type : String,
        enum : ['choosing','drawing'],
        default : 'choosing'
    }
})

const Room = mongoose.model("room",RoomSchema);

module.exports = Room