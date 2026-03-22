import React from "react";
import { Link } from "react-router-dom";

const games = [
  {
    name: "Scribble",
    description: "Draw, guess & laugh with friends in real-time",
    emoji: "🎨",
    accent: "from-purple-500 to-pink-500",
    glow: "hover:shadow-purple-500/40",
    badge: "Multiplayer",
    path: "/scribble",
  },
  {
    name: "Typing Challenge",
    description: "Race against time and test your typing speed",
    emoji: "⌨️",
    accent: "from-cyan-500 to-blue-500",
    glow: "hover:shadow-cyan-500/40",
    badge: "Solo / Versus",
    path: "/typing",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-white/10">
        <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          PLAYVERSE
        </span>
        <div className="flex gap-6 text-sm text-white/50 font-medium">
          <a href="#" className="hover:text-white transition">Games</a>
          <a href="#" className="hover:text-white transition">About</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex flex-col items-center justify-center text-center pt-20 pb-12 px-4">
        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 tracking-widest uppercase">
          Your Gaming Universe
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            PlayVerse
          </span>
        </h1>
        <p className="mt-5 text-white/40 text-lg max-w-md">
          Pick a game and challenge your friends.
        </p>
      </header>

      {/* Game Cards */}
      <main className="flex flex-col md:flex-row gap-6 justify-center items-stretch px-8 md:px-20 pb-20 flex-1">
        {games.map((game) => (
          <Link
            key={game.name}
            to={game.path}
            className={`
              group relative flex-1 max-w-sm md:max-w-none rounded-3xl p-[2px]
              bg-gradient-to-br ${game.accent}
              shadow-2xl ${game.glow} hover:shadow-2xl
              transition-all duration-300 hover:-translate-y-2
            `}
          >
            <div className="h-full rounded-3xl bg-[#111114] p-10 flex flex-col items-start gap-4 text-left">
              <span className="text-xs font-semibold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full">
                {game.badge}
              </span>
              <div className="text-7xl mt-2 group-hover:scale-110 transition-transform duration-300">
                {game.emoji}
              </div>
              <h2 className={`text-4xl font-black bg-gradient-to-r ${game.accent} bg-clip-text text-transparent`}>
                {game.name}
              </h2>
              <p className="text-white/40 text-base leading-relaxed">
                {game.description}
              </p>
              <div className={`mt-auto flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${game.accent} bg-clip-text text-transparent`}>
                Play Now
                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
              </div>
            </div>
          </Link>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>

    </div>
  );
}
