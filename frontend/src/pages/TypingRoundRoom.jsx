import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

export default function TypingRoundRoom() {
  const { room_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.state?.name || "Anonymous";

  const [players, setPlayers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [phase, setPhase] = useState("waiting");       // waiting | countdown | playing | round_done | finished
  const [countdown, setCountdown] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(location.state?.totalRounds || 3);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [wrongKey, setWrongKey] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(30);
  const [endsAt, setEndsAt] = useState(null);
  const [roundDone, setRoundDone] = useState(false);   // current player finished this round
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutEmitted = useRef(false);

  // ── Socket setup ──────────────────────────────────────────────
  useEffect(() => {
    socket.emit("tround_join", { room_id, name });

    socket.on("tround_players", setPlayers);
    socket.on("tround_creator", () => setIsCreator(true));
    socket.on("tround_error", ({ message }) => setError(message));

    socket.on("tround_countdown", ({ count }) => {
      setPhase("countdown");
      setCountdown(count);
    });

    socket.on("tround_new_round", ({ round, text, endsAt, duration }) => {
      setRound(round);
      setText(text);
      setEndsAt(endsAt);
      setRoundDuration(duration || 30);
      setTyped("");
      setWrongKey(false);
      setRoundDone(false);
      setTimeLeft(duration || 30);
      timeoutEmitted.current = false;
      setPhase("playing");
      setCountdown(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    socket.on("tround_you_finished", () => {
      setPhase("round_done");
      clearInterval(timerRef.current);
    });

    socket.on("tround_game_over", ({ players, winner }) => {
      setResult({ players, winner });
      setPhase("finished");
      clearInterval(timerRef.current);
    });

    socket.on("tround_eliminated", () => {
      setPhase("eliminated");
      clearInterval(timerRef.current);
    });

    socket.on("tround_player_left", () => {
      setError("A player left the room.");
    });

    return () => {
      socket.emit("tround_leave", { room_id });
      ["tround_players","tround_creator","tround_error","tround_countdown",
       "tround_new_round","tround_you_finished","tround_game_over","tround_player_left","tround_eliminated"]
        .forEach(e => socket.off(e));
    };
  }, [room_id]);

  // ── Per-round countdown timer ─────────────────────────────────
  useEffect(() => {
    if (!endsAt || phase !== "playing") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !timeoutEmitted.current) {
        timeoutEmitted.current = true;
        clearInterval(timerRef.current);
        socket.emit("tround_timeout", { room_id });
        setPhase("eliminated");
      }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [endsAt, phase]);

  // ── Typing handler ────────────────────────────────────────────
  const handleTyping = useCallback((e) => {
    if (phase !== "playing" || roundDone) return;
    const value = e.target.value;

    if (value.length > typed.length) {
      const newChar = value[value.length - 1];
      if (newChar !== text[typed.length]) {
        setWrongKey(true);
        setTimeout(() => setWrongKey(false), 400);
        return;
      }
    }
    setWrongKey(false);
    setTyped(value);

    // completed the text
    if (value.length === text.length) {
      setRoundDone(true);
      clearInterval(timerRef.current);
      socket.emit("tround_complete", { room_id });
    }
  }, [phase, typed, text, room_id, roundDone]);

  // ── Render text ───────────────────────────────────────────────
  const renderText = () => {
    return text.split("").map((char, i) => {
      const done = i < typed.length;
      const isCursor = i === typed.length;
      return (
        <span key={i} className={
          done ? "text-purple-400" :
          isCursor
            ? wrongKey
              ? "text-red-400 bg-red-500/30 rounded px-[1px] border-b-2 border-red-400"
              : "text-white border-b-2 border-purple-400"
            : "text-white/30"
        }>{char}</span>
      );
    });
  };

  const handleStart = () => {
    if (players.length < 2) return setError("Need at least 2 players to start.");
    setError("");
    socket.emit("tround_start", { room_id });
  };

  const handleRematch = () => {
    setResult(null); setTyped(""); setRound(0);
    setPhase("waiting"); setRoundDone(false);
    socket.emit("tround_rematch", { room_id });
  };

  const timerColor = timeLeft <= 10 ? "text-red-400" : timeLeft <= 20 ? "text-yellow-400" : "text-white/70";

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
            <>
              <span>ROUND <span className="text-white/70">{round}/{totalRounds}</span></span>
              <span className={`font-black text-sm ${timerColor}`}>{timeLeft}s</span>
            </>
          )}
        </div>
      </nav>

      <main className="flex flex-col flex-1 px-4 md:px-10 py-6 md:py-8 gap-5 max-w-3xl mx-auto w-full">

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <span className="text-red-400">⚠</span>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Players scoreboard — always visible during game */}
            {phase !== "waiting" && phase !== "countdown" && (
          <div className="flex flex-wrap gap-2">
            {players.map((p, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold
                ${p.name === name
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-400"
                  : "bg-white/5 border-white/10 text-white/60"
                }`}>
                <span>{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                  ${p.eliminated
                    ? "bg-red-500/20 text-red-400"
                    : p.finished
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/5 text-white/30"
                  }`}>
                  {p.eliminated ? "💀 out" : p.finished ? "✓ done" : `R${p.currentRound}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {phase === "countdown" && countdown !== null && (
          <div className="flex items-center justify-center flex-1 py-10">
            <span className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {countdown}
            </span>
          </div>
        )}

        {/* Waiting lobby */}
        {phase === "waiting" && (
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col items-center gap-5">
              <p className="text-xs font-bold tracking-widest uppercase text-white/30">Lobby · Round Battle</p>

              <div className="flex flex-wrap gap-3 justify-center w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`w-24 rounded-2xl border px-3 py-3 flex flex-col items-center gap-1.5 text-xs
                    ${players[i] ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 border-dashed"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
                      ${players[i] ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/20"}`}>
                      {players[i] ? players[i].name[0].toUpperCase() : "?"}
                    </div>
                    <span className={players[i] ? "text-white font-semibold truncate w-full text-center" : "text-white/20"}>
                      {players[i]?.name || "Empty"}
                    </span>
                    {i === 0 && players[i] && <span className="text-white/30 tracking-widest text-[10px]">HOST</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className={`w-2 h-2 rounded-full ${players.length >= 2 ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                {players.length >= 2 ? `${players.length} players ready` : "Waiting for players..."}
              </div>

              <div className="text-xs text-white/20 font-mono bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                Room ID: <span className="text-white/60 font-bold tracking-widest">{room_id}</span>
              </div>

              <div className="text-xs text-white/30 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                🏆 <span className="text-white/50 font-semibold">{totalRounds} rounds</span> · timer increases each round · texts get harder
              </div>

              {isCreator ? (
                <button
                  onClick={handleStart}
                  disabled={players.length < 2}
                  className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Battle →
                </button>
              ) : (
                <p className="text-white/30 text-sm">Waiting for host to start...</p>
              )}
            </div>
          </div>
        )}

        {/* Typing area */}
        {(phase === "playing" || phase === "round_done") && text && (
          <div className="flex flex-col gap-4">

            {/* Round progress bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white/40 tracking-widest uppercase">Round Progress</span>
                <span className="text-white/40">{round} / {totalRounds}</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: totalRounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      i < round
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : i === round - 1
                        ? "bg-gradient-to-r from-purple-500/60 to-pink-500/60"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                {roundDone && (
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                    ✓ Round complete! Waiting for next...
                  </span>
                )}
                {phase === "round_done" && !roundDone && (
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                    ⏱ Time's up!
                  </span>
                )}
              </div>
            </div>

            {/* Text display */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 leading-8 text-base md:text-lg font-mono select-none">
              {renderText()}
            </div>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleTyping}
              disabled={phase !== "playing" || roundDone}
              rows={3}
              placeholder={phase === "playing" ? "Start typing here..." : ""}
              className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm md:text-base text-white placeholder-white/20 outline-none transition resize-none disabled:opacity-40 disabled:cursor-not-allowed font-mono ${
                wrongKey ? "border-red-500/60 bg-red-500/5" : "border-white/10 focus:border-purple-500/50"
              }`}
            />
          </div>
        )}

        {/* Eliminated */}
        {phase === "eliminated" && (
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-500/20">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col items-center gap-4">
              <div className="text-5xl">💀</div>
              <h2 className="text-2xl font-black text-red-400">You've Been Eliminated!</h2>
              <p className="text-white/40 text-sm text-center">
                You ran out of time on Round {round}. You needed to finish the text within 30 seconds.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => navigate("/typing")}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition">
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        {phase === "finished" && result && (
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
            <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col items-center gap-5">
              <div className="text-4xl">🏆</div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {result.winner?.name === name ? "You Won! 🎉" : `${result.winner?.name} Won!`}
              </h2>

              <ul className="flex flex-col gap-2 w-full">
                {result.players.map((p, i) => (
                  <li key={i} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-white/30 font-bold">#{i + 1}</span>
                      <span className={`font-semibold ${p.name === name ? "text-purple-400" : "text-white/70"}`}>{p.name}</span>
                    </span>
                    <span className="text-white/50 text-sm font-bold">Round {p.currentRound}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 w-full">
                {isCreator && (
                  <button onClick={handleRematch}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5">
                    Rematch →
                  </button>
                )}
                <button onClick={() => navigate("/typing")}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition">
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
