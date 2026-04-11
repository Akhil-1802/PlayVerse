const router = require('express').Router();
const { createTypingRoom, joinTypingRoom } = require('../controllers/typingRoom.controller');

router.post('/create', createTypingRoom);
router.post('/join', joinTypingRoom);

module.exports = router;
