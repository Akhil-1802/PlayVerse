const TypingRoom = require('../models/typingRoom.model');

const createTypingRoom = async (req, res) => {
  try {
    const { name, duration } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const room_id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new TypingRoom({
      room_id,
      creator: name,
      duration: duration || 30,
      players: [{ name, socketId: '', progress: 0, finished: false }],
    });
    await room.save();
    res.status(200).json({ message: 'Room created', room_id });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const joinTypingRoom = async (req, res) => {
  try {
    const { name, room_id } = req.body;
    if (!name || !room_id) return res.status(400).json({ message: 'Name and Room ID are required' });

    const room = await TypingRoom.findOne({ room_id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.players.length >= 2) return res.status(400).json({ message: 'Room is full' });
    if (room.status !== 'waiting') return res.status(400).json({ message: 'Match already started' });

    res.status(200).json({ message: 'Joined successfully', room_id });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { createTypingRoom, joinTypingRoom };
