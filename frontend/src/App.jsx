import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Scribble from "./pages/Scribble"
import Typing from "./pages/Typing"
import TypingRoom from "./pages/TypingRoom"
import TypingRoundRoom from "./pages/TypingRoundRoom"
import Room from "./pages/Room"

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scribble" element={<Scribble />} />
        <Route path="/typing" element={<Typing />} />
        <Route path="/typing/room/:room_id" element={<TypingRoom />} />
        <Route path="/typing/rounds/:room_id" element={<TypingRoundRoom />} />
        <Route path="/room/:room_id" element={<Room />} />
      </Routes>
  )
}

export default App
