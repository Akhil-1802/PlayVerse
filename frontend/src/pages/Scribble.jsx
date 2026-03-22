import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "../hooks/userRoom";

export default function Scribble() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");

  const [createForm, setCreateForm] = useState({ name: "", rounds: "3" });
  const [joinForm, setJoinForm] = useState({ name: "", roomId: "" });
  const [validationError, setValidationError] = useState("");

  const { loading, error, createroom ,joinroom} = useRoom();

  const handleCreateRoom = async () => {
    setValidationError("");
    if (!createForm.name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    try {
      const data = await createroom(createForm);
      setCreateForm({ name: "", rounds: "3" });
      navigate("/room/" + data.room_id)
    } catch {
      // error is handled by the hook and shown via `error` state
    }
  };

  const handleJoinRoom = async () => {
    setValidationError("");
    if (!joinForm.name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    if (!joinForm.roomId.trim()) {
      setValidationError("Please enter a Room ID.");
      return;
    }
    try {
      await joinroom({...joinForm,room_id:joinForm.roomId});
      navigate("/room/" + joinForm.roomId)  
      setJoinForm({ name: "", roomId: "" });
    } catch {
      // handle join error
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setValidationError("");
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-white/10">
        <a href="/" className="text-2xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          PLAYVERSE
        </a>
        <div className="flex gap-6 text-sm text-white/50 font-medium">
          <a href="/" className="hover:text-white transition">Games</a>
          <a href="#" className="hover:text-white transition">About</a>
        </div>
      </nav>

      {/* Game Hero */}
      <header className="flex flex-col items-center text-center pt-14 pb-10 px-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full mb-5">
          Multiplayer
        </span>
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Scribble
        </h1>
        <p className="mt-4 text-white/40 text-base max-w-sm leading-relaxed">
          Draw a word, let your friends guess it. The faster they guess, the more points you earn. Real-time chaos guaranteed.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8 px-4">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          {["create", "join"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold tracking-wide capitalize transition-all duration-200
                ${activeTab === tab
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                  : "text-white/40 hover:text-white"
                }`}
            >
              {tab === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <main className="flex justify-center px-4 pb-20">
        <div className="w-full max-w-md rounded-3xl p-[1.5px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
          <div className="rounded-3xl bg-[#111114] p-8 flex flex-col gap-6">

            {/* Error Banner */}
            {displayError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <span className="text-red-400 text-lg">⚠</span>
                <p className="text-red-400 text-sm font-medium">{displayError}</p>
              </div>
            )}

            {activeTab === "create" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={createForm.name}
                    disabled={loading}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">
                    Rounds
                  </label>
                  <div className="flex gap-3">
                    {["3", "5", "7"].map((r) => (
                      <button
                        key={r}
                        disabled={loading}
                        onClick={() => setCreateForm({ ...createForm, rounds: r })}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                          ${createForm.rounds === r
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                            : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="mt-2 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room →"
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={joinForm.name}
                    disabled={loading}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/30">
                    Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter room ID"
                    value={joinForm.roomId}
                    disabled={loading}
                    onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="mt-2 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Room →"
                  )}
                </button>
              </>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>

    </div>
  );
}
