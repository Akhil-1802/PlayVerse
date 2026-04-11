const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomRouter = require('./routes/room.route');
const typingRoomRouter = require('./routes/typingRoom.route');
const Room = require('./models/room.model');
const Message = require('./models/message.model');
const TypingRoom = require('./models/typingRoom.model');
const { pickRandom } = require('./utils/helperfunction');
const { getTypingText } = require('./utils/typingTexts');



const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/room', roomRouter);
app.use('/api/typing', typingRoomRouter);

const server = http.createServer(app);
const io = new Server(server,{
    cors :{
        origin : "*"
    }
})
//for room timers
const roomtimers = {};
io.on('connection',async(socket)=>{
    console.log(socket.id);
    socket.on("join_room", async ({ name, room_id }) => {
        console.log(name, room_id);
    //Making a player join a room using socket.io
    socket.join(room_id);

    const room = await Room.findOne({ room_id });
    //If playeralready exists in the room then update the socket id else add the player to the room
    const playerExists = room.players.find(p => p.name === name);

    if (playerExists) {
        // Update the socket id for the existing player
        await Room.updateOne(
            { room_id, "players.name": name },
            {
                $set: { "players.$.socketId": socket.id }
            }
        );

    } else {
        //Update the complete playerinformation
        await Room.updateOne(
            { room_id },
            {
                $push: {
                    players: {
                        name,
                        socketId: socket.id,
                        score: 0
                    }
                }
            }
        );

    }
    //Get players in the room and emit it to all the clients in the room
    const players = await Room.findOne({ room_id })
    console.log(players)
    if(players && players.players.length > 0){
        const creatorID = players.players[0].socketId;
        io.to(creatorID).emit("creator", true);
    }
    io.to(room_id).emit("get_players", players?.players || []);

});
    //Socket connection for getting the messages and checking the word
    socket.on('send_message',async({name , message,room_id})=>{
        console.log(name,room_id,message)
        const room = await Room.findOne({room_id}); //CHeck the room
        console.log(room)
        if(room.word.toLowerCase() === message.toLowerCase()){ //if the word is correct then update the score of the player and add the player to the guessed players array
            if(room.guessed_players.includes(name)){ //if player already guessed the word then return
                console.log("Player already guessed the word");
                io.to(socket.id).emit("already_guessed", "You have already guessed the word");
                return;
            };
            io.to(socket.id).emit("guessedCorrect",room.word)
            const guessScore = room.guessed_players.length + 1; //maintain a guess score based on the number of players who guessed the word before
            let score = 0;
            if(guessScore === 1) score = 100;
            else if(guessScore === 2) score = 50;
            else if(guessScore === 3) score = 25;
            else score = 10;
            await Room.updateOne({ //update the room information by adding the player to the guessed players array and updating the score of the player
                room_id : room_id,
                "players.socketId": socket.id
            },{
                $push : {
                    guessed_players : name,
                },
                $inc : {
"players.$.score": score
                }
            })

            
            await Message.updateOne({ //update the message as well
                room_id : room_id,
            },{
                $push : {
                    messages : {
                        name, message,color:"green"
                    }
                }
            })
            //send updateRoom information to the all clients in the room
            const updatedRoom = await Room.findOne({room_id});
            if(updatedRoom.guessed_players.length === updatedRoom.players.length -1 ){ //if all players except the drawer guessed the word then end the game
                endRound(room_id);
            }
            console.log(updatedRoom)
            io.to(room_id).emit('correct_guess', {players :updatedRoom.players,guessed_players : updatedRoom.guessed_players});
        }
        
        else{ //if word is not guessed correctly then just add the message to the messages array
            await Message.updateOne({
                room_id : room_id,
            },{
                $push : {
                    messages : {
                        name, message,color:"none"
                    }
                }
            })

        }
            
        //send the messages to the all clients
        const messages = await Message.findOne({room_id}).select('messages');
        console.log(messages)
        io.to(room_id).emit('game_message',messages)
    })

    //function for end game
    const endGame = async (room_id) => {

    const room = await Room.findOne({ room_id }).select("players");

    // sort players by score (descending)
    const players = room.players.sort((a, b) => b.score - a.score);

    const winner = players[0];

    io.to(room_id).emit("game_end", {
        winner,
        players
    });

    }


    //function next turn
    const nextTurn = async (room_id) => {
        const index = await Room.findOne({room_id}).select("currentDrawerIndex players round rounds words");
        //reset the guessed players array for the next turn
        if(index.currentDrawerIndex >= index.players.length){ //if all players have drawn then start from the first player
            if(index.round + 1 > index.rounds){ //if all rounds are completed then end the game
                endGame(room_id);
                return;
            }
            const player = index.players[0];
            console.log("turn_end_console")
            console.log(player,index);
            await Room.updateOne({room_id},{
                currentDrawerIndex : 0,
                drawer : player.socketId,
                round : index.round + 1,
                guessed_players : []
            })
            io.to(room_id).emit("new_round",index.round + 1);
        }
        let words = pickRandom(index.words,3); //get 3 random words from the room's words array for the next turn
        console.log("next_turn_console")
        console.log(words)
        const room = await Room.findOne({room_id});
        console.log(room)
        const player = room.players[room.currentDrawerIndex];
        await Room.updateOne({room_id},{
            guessed_players : [],
            drawer : player.socketId,
            currentDrawerIndex : room.currentDrawerIndex + 1
        })
        console.log(player)
        io.to(player.socketId).emit("choose_word",words);
        const updatedRoom = await Room.findOne({room_id}); 
        io.to(updatedRoom.drawer).emit("drawer", {drawer : true,drawerId : updatedRoom.drawer}); //send the new drawer information to all clients in the room
        socket.to(room_id).emit("drawerId",updatedRoom.drawer)
    }


    //function for end round
    const endRound = async(room_id) => {
        if(roomtimers[room_id]){ //if there is already a timer for the room then clear it
            clearTimeout(roomtimers[room_id]);
            delete roomtimers[room_id];
        }
        const room = await Room.findOne({room_id}).select("players guessed_players drawer"); //get the room information
        if(room.guessed_players.length > 0){ //if there are players who guessed the word then update the score of the drawer based on the number of players who guessed the word
            let drawerScore = 0;
            console.log("drawerscore",room.drawer)
            if(room.guessed_players.length === 1) drawerScore = 50;
            else if(room.guessed_players.length === 2) drawerScore = 75;
            else if(room.guessed_players.length >= 3) drawerScore = 100;
            await Room.updateOne({room_id,"players.socketId": room.drawer},{ //update the score of the drawer
                $inc : {
                    "players.$.score" : drawerScore
                }
            })
            const updatedRoom = await Room.findOne({room_id}).select("players")
            io.to(room_id).emit("get_players",updatedRoom.players)
        }

            await Room.updateOne({room_id},{
                $set : {
                    gameState : 'choosing',
                    word : '',
                }
    
            }) //update the game state to choosing for the next round  
            
        
        io.to(room_id).emit("clear_canvas"); //emit round end event to all clients in the room and show score board
        io.to(room_id).emit("round_end"); //emit round end event to all clients in the room and show score board
        nextTurn(room_id); //move to the next turn automatically
    }

    
    //function for start_round
    const startRound = async(room_id) => {
        const time = 60 * 1000 //1 minute for each round
        const duration = Date.now() + time; //get the end time for the round
        io.to(room_id).emit("round_started",{duration,gameState : "drawing"}); //emit the round started event to all clients in the room with the end time for the round
        if(roomtimers[room_id]){ //if there is already a timer for the room then clear it
            clearTimeout(roomtimers[room_id]);
        }
        
        roomtimers[room_id] = setTimeout(() => {
            endRound(room_id);
        },time)//after 1 minute end the round and show the score board)
    }
    //connection for start_game purpose
    socket.on("start_game",async(room_id) =>{
        
        const Findroom = await Room.findOne({room_id}).select("players");
        if(Findroom.players.length == 1){
            io.to(room_id).emit("game_not_started",{error :"Atleast need 2 players"});
            return;
        }
        socket.to(room_id).emit("game_start",{round:1})
        await Room.updateOne(
  { room_id },
  {
    $set: {
      guessed_players: [],
      currentDrawerIndex: 0,
      round: 1,
      "players.$[].score": 0   //reset all scores safely
    }
  }
);

        await Message.updateOne({room_id},{
            $set:{
                messages : []
            }
        })
        const room = await Room.findOne({room_id}); //get the room information
        io.to(room_id).emit("get_players", room.players); //emit the updated players information to all clients in the room
        let words = pickRandom(room.words,3); //get 3 random words from the room's words array
        const player = room.players[room.currentDrawerIndex]; //get the current drawer information
        console.log("start_game_console")
        console.log(player)
        await Room.updateOne({room_id},{
            currentDrawerIndex : room.currentDrawerIndex + 1,
            drawer : player.socketId
        })

        const updatedRoom = await Room.findOne({room_id}); //get the updated room information
        io.to(player.socketId).emit("choose_word",words); //send the random words to the drawer to choose from
        io.to(updatedRoom.drawer).emit("drawer", {drawer : true,drawerId : updatedRoom.drawer}); //send the particular drawer true value
        socket.to(room_id).emit("drawerId",updatedRoom.drawer)
    })
    socket.on("word_chosen",async ({room_id,word,socket_id})=>{
        await Room.updateOne(
  { room_id },
  {
    $set: {
      word: word,
      gameState: "drawing"
    },
    $push: {
      usedWords: word
    },
    $pull: {
      words: word
    }
  }
); //start the round after the drawer has chosen the word 
        io.to(socket_id).emit("word_selected",word); //emit word chosen success event to the drawer client to show the canvas and start the game
        socket.to(room_id).emit("word_length",word.length);
        startRound(room_id); //start the round after the drawer has chosen the word
    })

    //for reseting the game
    socket.on("reset_game",async({room_id})=>{
        const room = await Room.findOne({room_id}).select("players");
        await Room.updateOne({room_id},{
            currentDrawerIndex : 0,
            gameState : 'choosing',
            guessed_players : [],
            drawer : room.players[0].socketId,
            word : ''
        })

        const updatedRoom = await Room.findOne({room_id});
        io.to(updatedRoom.drawer).emit("creator", true);
        io.to(room_id).emit("get_players", updatedRoom.players);
    })

    
    //for drawing on canvas
    socket.on("draw", async ({ room_id, prevX, prevY, x, y ,color,tool,eraserSize}) => {

  // only drawer allowed
  console.log("Draw Event", socket.id, room_id, prevX, prevY, x, y);
  const room = await Room.findOne({ room_id });

  if (socket.id !== room.drawer) return;

  if(room.gameState !== 'drawing') return; //only allow drawing when the game state is drawing

  if(room.word === '') return; //only allow drawing when the word is chosen
  socket.to(room_id).emit("draw", { prevX, prevY, x, y ,color,tool,eraserSize});

});
    socket.on("leave_room", async ({room_id}) => {
        console.log("Leave Room", socket.id);
  await Room.updateOne(
    { room_id },
    {
      $pull: { players: { socketId: socket.id } }
    }
  )
})

    // ─── Typing Game ───────────────────────────────────────────────

    socket.on('typing_join', async ({ room_id, name }) => {
        const room = await TypingRoom.findOne({ room_id });
        if (!room) return;

        socket.join(room_id);

        const exists = room.players.find(p => p.name === name);
        if (exists) {
            await TypingRoom.updateOne(
                { room_id, 'players.name': name },
                { $set: { 'players.$.socketId': socket.id } }
            );
        } else {
            if (room.players.length >= 2) {
                socket.emit('typing_error', { message: 'Room is full' });
                return;
            }
            await TypingRoom.updateOne(
                { room_id },
                { $push: { players: { name, socketId: socket.id, progress: 0, finished: false } } }
            );
        }

        const updated = await TypingRoom.findOne({ room_id });
        io.to(room_id).emit('typing_players', updated.players);

        // first player is creator
        if (updated.players[0]?.socketId === socket.id) {
            socket.emit('typing_creator', true);
        }
    });

    socket.on('typing_start', async ({ room_id }) => {
        const room = await TypingRoom.findOne({ room_id });
        if (!room) return;
        if (room.players.length < 2) {
            socket.emit('typing_error', { message: 'Need 2 players to start' });
            return;
        }
        if (room.players[0]?.socketId !== socket.id) return;

        const text = getTypingText(room.duration);
        await TypingRoom.updateOne({ room_id }, { status: 'countdown', text });

        // 3-2-1 countdown then start
        io.to(room_id).emit('typing_countdown', { count: 3 });
        setTimeout(() => io.to(room_id).emit('typing_countdown', { count: 2 }), 1000);
        setTimeout(() => io.to(room_id).emit('typing_countdown', { count: 1 }), 2000);
        setTimeout(async () => {
            const duration = room.duration * 1000;
            const endsAt = Date.now() + duration;
            await TypingRoom.updateOne({ room_id }, { status: 'playing' });
            io.to(room_id).emit('typing_start_game', { text, endsAt });

            // auto-end when timer runs out
            setTimeout(async () => {
                const r = await TypingRoom.findOne({ room_id });
                if (!r || r.status !== 'playing') return;
                await TypingRoom.updateOne({ room_id }, { status: 'finished' });
                const sorted = [...r.players].sort((a, b) => b.progress - a.progress);
                io.to(room_id).emit('typing_game_over', { players: sorted, winner: sorted[0] });
            }, duration);
        }, 3000);
    });

    socket.on('typing_progress', async ({ room_id, charIndex, progress }) => {
        await TypingRoom.updateOne(
            { room_id, 'players.socketId': socket.id },
            { $set: { 'players.$.progress': progress } }
        );
        // broadcast charIndex to opponent so they can show cursor position
        socket.to(room_id).emit('typing_opponent_progress', { charIndex, progress });

        // check if player finished
        if (progress >= 100) {
            const room = await TypingRoom.findOne({ room_id });
            if (!room || room.status !== 'playing') return;
            await TypingRoom.updateOne(
                { room_id, 'players.socketId': socket.id },
                { $set: { 'players.$.finished': true } }
            );
            await TypingRoom.updateOne({ room_id }, { status: 'finished' });
            const updated = await TypingRoom.findOne({ room_id });
            const sorted = [...updated.players].sort((a, b) => b.progress - a.progress);
            io.to(room_id).emit('typing_game_over', { players: sorted, winner: sorted[0] });
        }
    });

    socket.on('typing_leave', async ({ room_id }) => {
        await TypingRoom.updateOne(
            { room_id },
            { $pull: { players: { socketId: socket.id } } }
        );
        socket.leave(room_id);
        socket.to(room_id).emit('typing_opponent_left');
    });

    socket.on('typing_rematch', async ({ room_id }) => {
        await TypingRoom.updateOne({ room_id }, {
            status: 'waiting',
            text: '',
            'players.$[].progress': 0,
            'players.$[].finished': false,
        });
        const updated = await TypingRoom.findOne({ room_id });
        io.to(room_id).emit('typing_players', updated.players);
        io.to(updated.players[0]?.socketId).emit('typing_creator', true);
    });
})

module.exports = server;