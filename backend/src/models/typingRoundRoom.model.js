const mongoose = require('mongoose');

const TypingRoundRoomSchema = mongoose.Schema({
  room_id: { type: String, required: true, unique: true },
  creator: { type: String, required: true },
  totalRounds: { type: Number, enum: [3, 5, 7], default: 3 },
  // each player: { name, socketId, currentRound, finished, finishedAt }
  players: { type: Array, default: [] },
  status: { type: String, enum: ['waiting', 'countdown', 'playing', 'finished'], default: 'waiting' },
});

module.exports = mongoose.model('TypingRoundRoom', TypingRoundRoomSchema);
