import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MODES = [
  {
    id: "time",
    label: "Time Race",
    emoji: "⏱",
    desc: "1v1 — finish the text before the timer runs out",
    accent: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
    focus: "focus:border-cyan-500/60",
    btn: "from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/30",
    tab: "from-cyan-500 to-blue-500 shadow-cyan-500/30",
  },
  {
    id: "rounds",
    label: "Round Battle",
    emoji: "🏆",
    desc: "Up to 6 players — advance rounds by finishing each text first",
    accent: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
    focus: "focus:border-purple-500/60",
    btn: "from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-purple-500/30",
    tab: "from-purple-500 to-pink-500 shadow-purple-500/30",
  },
];

export default function Typing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("time");
  const [activeTab, setActiveTab] = useState("create");
  const [createForm, setCreateForm] = useState({ name: "", duration: 30, totalRounds: 3 });
  const [joinForm, setJoinForm] = useState({ name: "", roomId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const m = MODES.find(x => x.id === mode);

  const handleCreate = async () => {
    setError("");
    if (!createForm.name.trim()) return setError("Please enter your name.");
    try {
      setLoading(true);
      if (mode === "time") {
        const { data } = await axios.post(`${API}/api/typing/create`, {
          name: createForm.name, duration: createForm.duration,
        });
        navigate(`/typing/room/${data.room_id}`, { state: { name: createForm.name, duration: createForm.duration } });
      } else {
        const { data } = await axios.post(`${API}/api/typing-rounds/create`, {
          name: createForm.name, totalRounds: createForm.totalRounds,
        });
        navigate(`/typing/rounds/${data.room_id}`, { state: { name: createForm.name, totalRounds: createForm.totalRounds } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    setError("");
    if (!joinForm.name.trim()) return setError("Please enter your name.");
    if (!joinForm.roomId.trim()) return setError("Please enter a Room ID.");
    const rid = joinForm.roomId.toUpperCase();
    try {
      setLoading(true);
      if (mode === "time") {
        await axios.post(`${API}/api/typing/join`, { name: joinForm.name, room_id: rid });
        navigate(`/typing/room/${rid}`, { state: { name: joinForm.name } });
      } else {
        await axios.post(`${API}/api/typing-rounds/join`, { name: joinForm.name, room_id: rid });
        navigate(`/typing/rounds/${rid}`, { state: { name: joinForm.name } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room.");
    } finally { setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(""); setActiveTab("create"); };
  const switchTab = (t) => { setActiveTab(t); setError(""); };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 md:py-5 border-b border-white/10">
        <a href="/" className="text-xl md:text-2xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          PLAYVERSE
        </a>
        <div className="flex gap-4 md:gap-6 text-sm text-white/50 font-medium">
          <a href="/" className="hover:text-white transition">Games</a>
          <a href="#" className="hover:text-white transition">About</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex flex-col items-center text-center pt-10 md:pt-14 pb-8 px-4">
        <div className="text-5xl md:text-6xl mb-3">⌨️</div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Typing Challenge
        </h1>
        <p className="mt-3 text-white/40 text-sm md:text-base max-w-sm leading-relaxed">
          Choose your battle mode and race to the top.
        </p>
      </header>

      {/* Mode selector */}
      <div className="flex justify-center px-4 mb-6">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 w-full max-w-sm">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2
                ${mode === m.id
                  ? `bg-gradient-to-r ${m.tab} text-white shadow-lg`
                  : "text-white/40 hover:text-white"
                }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode description */}
      <p className="text-center text-white/30 text-xs mb-6 px-4">{m.desc}</p>

      {/* Create / Join tabs */}
      <div className="flex justify-center mb-6 px-4">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 w-full max-w-xs">
          {["create", "join"].map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide capitalize transition-all duration-200
                ${activeTab === tab
                  ? `bg-gradient-to-r ${m.tab} text-white shadow-lg`
                  : "text-white/40 hover:text-white"
                }`}
            >
              {tab === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <main className="flex justify-center px-4 pb-16 md:pb-20">
        <div className={`w-full max-w-md rounded-3xl p-[1.5px] bg-gradient-to-br ${m.accent} shadow-2xl ${m.shadow}`}>
          <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col gap-5">

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <span className="text-red-400">⚠</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Name input — shared */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={activeTab === "create" ? createForm.name : joinForm.name}
                disabled={loading}
                onChange={(e) => activeTab === "create"
                  ? setCreateForm({ ...createForm, name: e.target.value })
                  : setJoinForm({ ...joinForm, name: e.target.value })
                }
                className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none ${m.focus} transition disabled:opacity-40`}
              />
            </div>

            {/* Create-only options */}
            {activeTab === "create" && mode === "time" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Duration</label>
                <div className="flex gap-3">
                  {[{ v: 30, l: "30s" }, { v: 45, l: "45s" }, { v: 60, l: "1 min" }].map((d) => (
                    <button key={d.v} disabled={loading}
                      onClick={() => setCreateForm({ ...createForm, duration: d.v })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40
                        ${createForm.duration === d.v
                          ? `bg-gradient-to-r ${m.accent} text-white shadow-lg`
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                        }`}
                    >{d.l}</button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "create" && mode === "rounds" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Rounds</label>
                <div className="flex gap-3">
                  {[3, 5, 7].map((r) => (
                    <button key={r} disabled={loading}
                      onClick={() => setCreateForm({ ...createForm, totalRounds: r })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40
                        ${createForm.totalRounds === r
                          ? `bg-gradient-to-r ${m.accent} text-white shadow-lg`
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                        }`}
                    >{r}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Join-only room ID */}
            {activeTab === "join" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Room ID</label>
                <input
                  type="text"
                  placeholder="Enter room ID"
                  value={joinForm.roomId}
                  disabled={loading}
                  onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none ${m.focus} transition disabled:opacity-40`}
                />
              </div>
            )}

            <button
              onClick={activeTab === "create" ? handleCreate : handleJoin}
              disabled={loading}
              className={`mt-2 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r ${m.btn} shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{activeTab === "create" ? "Creating..." : "Joining..."}</>
                : activeTab === "create" ? "Create Room →" : "Join Room →"
              }
            </button>

          </div>
        </div>
      </main>

      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
