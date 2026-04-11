const mongoose = require('mongoose');

const TypingRoomSchema = mongoose.Schema({
  room_id: { type: String, required: true, unique: true },
  players: { type: Array, default: [] },
  creator: { type: String, required: true },
  duration: { type: Number, enum: [30, 45, 60], default: 30 },
  text: { type: String, default: '' },
  status: { type: String, enum: ['waiting', 'countdown', 'playing', 'finished'], default: 'waiting' },
});

module.exports = mongoose.model('TypingRoom', TypingRoomSchema);
