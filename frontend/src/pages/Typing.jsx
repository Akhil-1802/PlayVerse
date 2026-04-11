import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Typing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [createForm, setCreateForm] = useState({ name: "", duration: 30 });
  const [joinForm, setJoinForm] = useState({ name: "", roomId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    if (!createForm.name.trim()) return setError("Please enter your name.");
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/typing/create`, {
        name: createForm.name,
        duration: createForm.duration,
      });
      navigate(`/typing/room/${data.room_id}`, {
        state: { name: createForm.name, duration: createForm.duration },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setError("");
    if (!joinForm.name.trim()) return setError("Please enter your name.");
    if (!joinForm.roomId.trim()) return setError("Please enter a Room ID.");
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/typing/join`, {
        name: joinForm.name,
        room_id: joinForm.roomId.toUpperCase(),
      });
      navigate(`/typing/room/${joinForm.roomId.toUpperCase()}`, {
        state: { name: joinForm.name },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab) => { setActiveTab(tab); setError(""); };

  const durations = [
    { value: 30, label: "30s" },
    { value: 45, label: "45s" },
    { value: 60, label: "1 min" },
  ];

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
      <header className="flex flex-col items-center text-center pt-10 md:pt-14 pb-8 md:pb-10 px-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full mb-4">
          1v1 Race
        </span>
        <div className="text-5xl md:text-6xl mb-3">⌨️</div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Typing Challenge
        </h1>
        <p className="mt-3 text-white/40 text-sm md:text-base max-w-sm leading-relaxed">
          Race a friend in real-time. Type faster, finish first, win the glory.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-6 md:mb-8 px-4">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 w-full max-w-xs">
          {["create", "join"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide capitalize transition-all duration-200
                ${activeTab === tab
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                  : "text-white/40 hover:text-white"
                }`}
            >
              {tab === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <main className="flex justify-center px-4 pb-16 md:pb-20">
        <div className="w-full max-w-md rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/20">
          <div className="rounded-3xl bg-[#111114] p-6 md:p-8 flex flex-col gap-5 md:gap-6">

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <span className="text-red-400">⚠</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {activeTab === "create" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={createForm.name}
                    disabled={loading}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/60 transition disabled:opacity-40"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Duration</label>
                  <div className="flex gap-3">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        disabled={loading}
                        onClick={() => setCreateForm({ ...createForm, duration: d.value })}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40
                          ${createForm.duration === d.value
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                            : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                          }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="mt-2 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : "Create Room →"}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={joinForm.name}
                    disabled={loading}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/60 transition disabled:opacity-40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">Room ID</label>
                  <input
                    type="text"
                    placeholder="Enter room ID"
                    value={joinForm.roomId}
                    disabled={loading}
                    onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/60 transition disabled:opacity-40"
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="mt-2 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining...</> : "Join Room →"}
                </button>
              </>
            )}

          </div>
        </div>
      </main>

      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
