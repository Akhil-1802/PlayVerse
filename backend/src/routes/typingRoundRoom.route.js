const router = require('express').Router();
const { createTypingRoundRoom, joinTypingRoundRoom } = require('../controllers/typingRoundRoom.controller');

router.post('/create', createTypingRoundRoom);
router.post('/join', joinTypingRoundRoom);

module.exports = router;
