import React, { useEffect, useState } from 'react'
import { socket } from "../utils/socket"
import { useLocation, useParams } from 'react-router-dom'
import Canvas from '../components/Canvas'

function Room() {
  const { room_id } = useParams()
  const location = useLocation()
  const [players, setPlayers] = useState([])
  const [chat, setchats] = useState([])
  const [words, setWords] = useState([])
  const [round, setRound] = useState(0)
  const [start, setStarted] = useState(false)
  const [creator, setCreator] = useState(false)
  const [result, setResult] = useState(null)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState('')
  const [drawer, setDrawer] = useState(null)
  const [drawerID, setDrawerID] = useState(null)
  const [alreadyGuessed, setAlreadyGuessed] = useState('')
  const [gameNotStarted, setGameNotStarted] = useState('')
  const [gameEnd, setGameEnd] = useState(false)
  const [endTime, setEndTime] = useState(null)
  const [wordToGuess, setWordToGuess] = useState("")
  const [time, setTime] = useState(0)
  const [gameState, setGameState] = useState('choosing')
  const [word, setWord] = useState('')
  const [canvas, setCanvas] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    socket.emit("join_room", { name: location.state?.name || 'Anonymous', room_id })
    socket.on("game_start", ({ round }) => setRound(round))
    socket.on("get_players", (playersList) => setPlayers(playersList))
    socket.on("game_message", (data) => setchats(data.messages))
    socket.on("correct_guess", (data) => setPlayers(data.players))
    socket.on("guessedCorrect", (word) => setWord(word))
    socket.on("already_guessed", (msg) => {
      setAlreadyGuessed(msg)
      setTimeout(() => setAlreadyGuessed(''), 3000)
    })
    socket.on("game_not_started", ({ error }) => {
      setGameNotStarted(error)
      setTimeout(() => { setGameNotStarted(''); setStarted(false); setRound(0) }, 3000)
    })
    socket.on("round_end", () => {
      setEndTime(null); setDrawer(false); setTime(0)
      setWord(''); setGameState("choosing"); setWordToGuess("")
    })
    socket.on("choose_word", (data) => setWords(data))
    socket.on("new_round", (round) => setRound(round))
    socket.on("creator", (isCreator) => {setCreator(isCreator)
      setRound(0)
    })
    socket.on("drawer", ({ drawer, drawerId }) => { setDrawer(drawer); setDrawerID(drawerId) })
    socket.on("drawerId", (drawerId) => setDrawerID(drawerId))
    socket.on("game_end", ({ winner, players }) => {
      setResult(players); setWinner(winner)
      setStarted(false); setEndTime(null); setGameEnd(true)
    })
    socket.on("word_selected", (selectedWord) => { setWord(selectedWord); setCanvas(true) })
    socket.on("word_length", (length) => setWordToGuess("__ ".repeat(length).trim()))
    socket.on("round_started", ({ duration, gameState }) => { setEndTime(duration); setGameState(gameState) })

    return () => {
      socket.emit("leave_room", { room_id })
      socket.off("connect"); socket.off("get_players")
      socket.off("game_message"); socket.off("correct_guess"); socket.off("draw_words")
    }
  }, [room_id])

  useEffect(() => {
    if (!endTime) return
    const interval = setInterval(() => {
      setTime(Math.max(0, Math.floor((endTime - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Toasts */}
      {alreadyGuessed && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 font-semibold px-5 py-2.5 rounded-xl shadow-lg backdrop-blur-sm text-sm whitespace-nowrap">
          {alreadyGuessed}
        </div>
      )}
      {gameNotStarted && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold px-5 py-2.5 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-2 text-sm whitespace-nowrap">
          <span>⚠</span> {gameNotStarted}
        </div>
      )}

      {/* Game End Modal */}
      {gameEnd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col gap-4 relative">
              <button
                onClick={() => { setGameEnd(false); socket.emit("reset_game", { room_id }) }}
                className="absolute top-4 right-5 text-white/30 hover:text-white text-xl font-bold transition"
              >✕</button>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Game Over!</h2>
                {winner && <p className="text-white/50 text-sm mt-1">Winner: <span className="text-green-400 font-bold">{winner.name}</span></p>}
              </div>
              <ul className="flex flex-col gap-2 mt-2">
                {result && result.map((player, index) => (
                  <li key={index} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-white/30 font-bold">#{index + 1}</span>
                      <span className="font-medium">{player.name}</span>
                    </span>
                    <span className="text-purple-400 font-bold text-sm">{player.score} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10 gap-2">
        <a href="/" className="text-lg md:text-xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent shrink-0">
          PLAYVERSE
        </a>

        {/* Word display */}
        <div className="text-xs md:text-sm font-bold tracking-widest truncate text-center flex-1 px-2">
          {word.length > 0
            ? <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{word}</span>
            : <span className="text-white/40 tracking-[0.2em] md:tracking-[0.3em]">{wordToGuess}</span>
          }
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-xs text-white/40 font-semibold tracking-wide shrink-0">
          <span className="hidden sm:inline">ROOM <span className="text-white/70">{room_id}</span></span>
          <span>R<span className="text-white/70">{round}</span></span>
          {endTime != null && (
            <span className={`${time <= 10 ? 'text-red-400' : 'text-white/70'} font-black`}>{time}s</span>
          )}
          {/* Mobile chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="md:hidden bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/50 hover:text-white transition"
          >
            💬
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-3 p-2 md:p-4 overflow-hidden min-h-0">

        {/* Players Panel — horizontal scroll on mobile, vertical on desktop */}
        <div className="md:w-56 flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-white/30">Players</p>
          <ul className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
            {players.map((player, index) => (
              <li
                key={index}
                className={`rounded-xl px-3 py-2 md:py-2.5 flex justify-between items-center text-sm border transition shrink-0 md:shrink
                  ${drawerID === player.socketId
                    ? 'bg-purple-500/10 border-purple-500/40'
                    : 'bg-white/5 border-white/10'
                  }`}
              >
                <span className="font-medium flex items-center gap-1 truncate max-w-[80px] md:max-w-none">
                  {drawerID === player.socketId && <span className="text-purple-400">✏</span>}
                  {player.name}
                </span>
                <span className="text-purple-400 font-bold text-xs ml-2">{player.score}</span>
              </li>
            ))}
          </ul>

          {creator && !start && round === 0 && (
            <button
              onClick={() => { socket.emit("start_game", room_id); setStarted(true); setRound(1) }}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Game
            </button>
          )}
        </div>

        {/* Canvas */}
        <Canvas
          words={words}
          setWords={setWords}
          room_id={room_id}
          isDrawer={drawer}
          gameState={gameState}
          started={start}
          choosingWord={gameState === 'choosing' && drawer === false && round > 0}
        />

        {/* Chat Panel — hidden on mobile unless toggled */}
        <div className={`${showChat ? 'flex' : 'hidden'} md:flex md:w-80 flex-col gap-2`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-widest uppercase text-white/30">Chat</p>
            <button onClick={() => setShowChat(false)} className="md:hidden text-white/30 hover:text-white text-sm">✕</button>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: '60vh' }}>
            <ul className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {chat.map((c, index) => (
                <div key={index} className={`rounded-xl px-3 py-2 text-sm ${c.color === "green" ? "bg-green-500/10 border border-green-500/20" : "bg-white/5"}`}>
                  <p className="font-semibold text-white/60 text-xs">{c.name}</p>
                  {c.color !== "none"
                    ? <p className="text-green-400 font-medium blur-sm select-none">{c.message}</p>
                    : <p className="text-white/80">{c.message}</p>
                  }
                </div>
              ))}
            </ul>
            <div className="border-t border-white/10 p-2 flex gap-1.5">
              <input
                disabled={drawer}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    socket.emit("send_message", { room_id, name: location.state?.name, message })
                    setMessage('')
                  }
                }}
                placeholder="Type a guess..."
              />
              <button
                disabled={drawer}
                onClick={() => {
                  socket.emit("send_message", { room_id, name: location.state?.name, message })
                  setMessage('')
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-sm px-3 py-2 rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Room
