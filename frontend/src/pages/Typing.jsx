import React from "react";

export default function Typing() {
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

      {/* Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-5 gap-5 md:gap-6 py-12">

        <div className="text-6xl md:text-7xl mb-1 md:mb-2">⌨️</div>

        <span className="text-xs font-semibold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full">
          Solo / Versus
        </span>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Typing Challenge
        </h1>

        <p className="text-white/40 text-sm md:text-base max-w-sm leading-relaxed">
          Race against time and test your typing speed against players worldwide.
        </p>

        {/* WIP Card */}
        <div className="mt-2 md:mt-4 w-full max-w-sm rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/20">
          <div className="rounded-3xl bg-[#111114] px-6 md:px-10 py-7 md:py-8 flex flex-col items-center gap-3">
            <div className="text-3xl">🚧</div>
            <p className="text-white font-bold text-lg">Work In Progress</p>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              We're crafting something awesome. The Typing Challenge will be live very soon — stay tuned!
            </p>
          </div>
        </div>

        <a
          href="/"
          className="mt-1 md:mt-2 px-8 py-3 rounded-xl text-sm font-bold tracking-wide border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all duration-200"
        >
          ← Back to Games
        </a>

      </main>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs pb-6 tracking-widest">
        © 2025 PLAYVERSE · ALL RIGHTS RESERVED
      </footer>

    </div>
  );
}
