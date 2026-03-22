const router = require("express").Router();
const {createRoom ,joinRoom} = require('../controllers/room.controller');

router.post('/create', createRoom);
router.post('/join', joinRoom);
module.exports = router