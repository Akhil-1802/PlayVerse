const mongoose = require('mongoose')


const MessageSchema = mongoose.Schema({
    room_id : {
        type : Number,
        required : true
    },
    messages : {
        type : Array,
        default : []
    }
})


const Message = mongoose.model('message',MessageSchema)

module.exports = Message