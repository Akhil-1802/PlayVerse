import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

export default function TypingRoom() {
  const { room_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.state?.name || "Anonymous";

  const [players, setPlayers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [countdown, setCountdown] = useState(null);       // 3,2,1 or null
  const [phase, setPhase] = useState("waiting");          // waiting | countdown | playing | finished
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [endsAt, setEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [myProgress, setMyProgress] = useState(0);
  const [wrongKey, setWrongKey] = useState(false);
  const [opponentCharIndex, setOpponentCharIndex] = useState(-1);
  const [result, setResult] = useState(null);             // { players, winner }
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // ── Socket setup ──────────────────────────────────────────────
  useEffect(() => {
    socket.emit("typing_join", { room_id, name });

    socket.on("typing_players", (p) => setPlayers(p));
    socket.on("typing_creator", () => setIsCreator(true));
    socket.on("typing_error", ({ message }) => setError(message));
    socket.on("typing_countdown", ({ count }) => {
      setPhase("countdown");
      setCountdown(count);
    });
    socket.on("typing_start_game", ({ text, endsAt }) => {
      setText(text);
      setEndsAt(endsAt);
      setTyped("");
      setMyProgress(0);
      setOpponentCharIndex(-1);
      setPhase("playing");
      setCountdown(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
    socket.on("typing_opponent_progress", ({ charIndex }) => {
      setOpponentCharIndex(charIndex);
    });
    socket.on("typing_game_over", ({ players, winner }) => {
      setResult({ players, winner });
      setPhase("finished");
      clearInterval(timerRef.current);
    });
    socket.on("typing_opponent_left", () => setOpponentLeft(true));

    return () => {
      socket.emit("typing_leave", { room_id });
      socket.off("typing_players");
      socket.off("typing_creator");
      socket.off("typing_error");
      socket.off("typing_countdown");
      socket.off("typing_start_game");
      socket.off("typing_opponent_progress");
      socket.off("typing_game_over");
      socket.off("typing_opponent_left");
    };
  }, [room_id]);

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (!endsAt || phase !== "playing") return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [endsAt, phase]);

  // ── Handle typing ─────────────────────────────────────────────
  const handleTyping = useCallback((e) => {
    if (phase !== "playing") return;
    const value = e.target.value;

    // only allow advancing if the new character matches
    if (value.length > typed.length) {
      const newChar = value[value.length - 1];
      const expectedChar = text[typed.length];
      if (newChar !== expectedChar) {
        setWrongKey(true);
        setTimeout(() => setWrongKey(false), 400);
        return;
      }
    }
    setWrongKey(false);

    setTyped(value);
    const charIndex = value.length;
    const progress = Math.min(100, Math.round((charIndex / text.length) * 100));
    setMyProgress(progress);
    socket.emit("typing_progress", { room_id, charIndex, progress });
  }, [phase, text, typed, room_id]);

  // Render text with my typed chars coloured + opponent cursor inline
  const renderText = () => {
    return text.split("").map((char, i) => {
      const isMyChar = i < typed.length;
      const isOpponentCursor = i === opponentCharIndex;
      const isMyCursor = i === typed.length;

      let charClass = "text-white/30";
      if (isMyChar) {
        charClass = "text-cyan-400";
      }

      return (
        <span key={i} className="relative inline">
          {isOpponentCursor && (
            <span className="inline-block w-0.5 h-[1.1em] bg-purple-400 animate-pulse align-middle mx-[1px] rounded-full" />
          )}
          <span className={`${
            isMyCursor
              ? wrongKey
                ? "text-red-400 bg-red-500/30 rounded px-[1px] border-b-2 border-red-400"
                : "border-b-2 border-cyan-400 text-white"
              : charClass
          }`}>
            {char}
          </span>
        </span>
      );
    });
  };

  const opponent = players.find(p => p.name !== name);
  const me = players.find(p => p.name === name);

  const handleStart = () => {
    if (players.length < 2) return setError("Need 2 players to start.");
    setError("");
    socket.emit("typing_start", { room_id });
  };

  const handleRematch = () => {
    setResult(null);
    setTyped("");
    setMyProgress(0);
    setOpponentCharIndex(-1);
    setPhase("waiting");
    socket.emit("typing_rematch", { room_id });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 border-b border-white/10">
        <a href="/" className="text-xl md:text-2xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          PLAYVERSE
        </a>
        <div className="flex items-center gap-4 text-xs text-white/40 font-semibold tracking-wide">
          <span>ROOM <span className="text-white/70">{room_id}</span></span>
          {phase === "playing" && (
            <span className={`font-black text-sm ${timeLeft <= 10 ? "text-red-400" : "text-white/70"}`}>
              {timeLeft}s
            </span>
          )}
        </div>
      </nav>

      <main className="flex flex-col flex-1 px-4 md:px-10 py-6 md:py-10 gap-6 max-w-3xl mx-auto w-full">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <span className="text-red-400">⚠</span>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Opponent left banner */}
        {opponentLeft && (
          <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3">
            <span className="text-yellow-300">⚠</span>
            <p className="text-yellow-300 text-sm font-medium">Your opponent left the room.</p>
          </div>
        )}

        {/* Player legend */}
        {(phase === "playing" || phase === "finished") && (
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 bg-cyan-400 rounded-full" />
              <span className="text-cyan-400">{name} <span className="text-white/30">(you)</span></span>
            </span>
            {opponent && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse rounded-full" />
                <span className="text-purple-400">{opponent.name}</span>
              </span>
            )}
          </div>
        )}

        {/* Countdown overlay */}
        {phase === "countdown" && countdown !== null && (
          <div className="flex items-center justify-center py-10">
            <span className="text-8xl md:text-9xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent animate-ping-once">
              {countdown}
            </span>
          </div>
        )}

        {/* Waiting lobby */}
        {phase === "waiting" && (
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/20">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col items-center gap-5">
              <p className="text-xs font-bold tracking-widest uppercase text-white/30">Lobby</p>

              <div className="flex gap-4 w-full justify-center">
                {[0, 1].map((i) => (
                  <div key={i} className={`flex-1 max-w-[160px] rounded-2xl border px-4 py-4 flex flex-col items-center gap-2 text-sm
                    ${players[i] ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 border-dashed"}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black
                      ${i === 0 ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"}`}>
                      {players[i] ? players[i].name[0].toUpperCase() : "?"}
                    </div>
                    <span className={players[i] ? "text-white font-semibold" : "text-white/20"}>
                      {players[i]?.name || "Waiting..."}
                    </span>
                    {i === 0 && <span className="text-xs text-white/30 tracking-widest">HOST</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className={`w-2 h-2 rounded-full ${players.length === 2 ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                {players.length === 2 ? "Both players ready" : "Waiting for opponent to join..."}
              </div>

              <div className="text-xs text-white/20 font-mono bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                Room ID: <span className="text-white/60 font-bold tracking-widest">{room_id}</span>
              </div>

              {isCreator && (
                <button
                  onClick={handleStart}
                  disabled={players.length < 2}
                  className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Start Match →
                </button>
              )}
              {!isCreator && (
                <p className="text-white/30 text-sm">Waiting for host to start the match...</p>
              )}
            </div>
          </div>
        )}

        {/* Typing area */}
        {(phase === "playing" || phase === "finished") && text && (
          <div className="flex flex-col gap-4">
            {/* Text display */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 leading-8 text-base md:text-lg font-mono select-none">
              {renderText()}
            </div>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleTyping}
              disabled={phase !== "playing"}
              rows={3}
              placeholder={phase === "playing" ? "Start typing here..." : ""}
              className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm md:text-base text-white placeholder-white/20 outline-none transition resize-none disabled:opacity-40 disabled:cursor-not-allowed font-mono ${
                wrongKey ? "border-red-500/60 bg-red-500/5" : "border-white/10 focus:border-cyan-500/50"
              }`}
            />
          </div>
        )}

        {/* Game Over modal */}
        {phase === "finished" && result && (
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/20">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col items-center gap-5">
              <div className="text-4xl">🏆</div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {result.winner?.name === name ? "You Won! 🎉" : `${result.winner?.name} Won!`}
              </h2>

              <ul className="flex flex-col gap-2 w-full">
                {result.players.map((p, i) => (
                  <li key={i} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-white/30 font-bold">#{i + 1}</span>
                      <span className={`font-semibold ${p.name === name ? "text-cyan-400" : "text-purple-400"}`}>{p.name}</span>
                    </span>
                    <span className="text-white/50 text-sm font-bold">{p.progress}%</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 w-full">
                {isCreator && (
                  <button
                    onClick={handleRematch}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Rematch →
                  </button>
                )}
                <button
                  onClick={() => navigate("/typing")}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
