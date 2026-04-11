const TypingRoundRoom = require('../models/typingRoundRoom.model');

const createTypingRoundRoom = async (req, res) => {
  try {
    const { name, totalRounds } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const room_id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new TypingRoundRoom({
      room_id,
      creator: name,
      totalRounds: totalRounds || 3,
      players: [{ name, socketId: '', currentRound: 0, finished: false }],
    });
    await room.save();
    res.status(200).json({ message: 'Room created', room_id });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const joinTypingRoundRoom = async (req, res) => {
  try {
    const { name, room_id } = req.body;
    if (!name || !room_id) return res.status(400).json({ message: 'Name and Room ID are required' });

    const room = await TypingRoundRoom.findOne({ room_id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.players.length >= 6) return res.status(400).json({ message: 'Room is full' });
    if (room.status !== 'waiting') return res.status(400).json({ message: 'Match already started' });

    res.status(200).json({ message: 'Joined successfully', room_id });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { createTypingRoundRoom, joinTypingRoundRoom };
