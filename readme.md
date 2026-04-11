# 🎮 PlayVerse

A multiplayer gaming platform built with React, Node.js, Socket.IO and MongoDB.

🌐 **Live:** [playverse10.netlify.app](https://playverse10.netlify.app)

---

## Games

| Game | Mode | Status |
|------|------|--------|
| 🎨 Scribble | Multiplayer — draw & guess | ✅ Live |
| ⌨️ Typing Challenge — Time Race | 1v1 — finish text before timer | ✅ Live |
| ⌨️ Typing Challenge — Round Battle | Up to 6 players — advance rounds | ✅ Live |

---

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Socket.IO Client, React Router v7, Axios

**Backend** — Node.js, Express, Socket.IO, Mongoose

**Database** — MongoDB Atlas

**Hosting** — Netlify (frontend)

---

## Features

### 🎨 Scribble
- Create or join a room with a custom room ID
- Choose number of rounds (3, 5, 7)
- Real-time drawing synced across all players
- Guess the word by typing in the chat
- Correct guesses are blurred so others can't see the answer
- Score system based on guess order and drawing performance

### ⌨️ Typing Challenge — Time Race
- 1v1 only
- Choose duration: 30s, 45s, or 1 minute
- Both players type the same text simultaneously
- Wrong keystrokes are blocked — you must type the correct character to advance
- Opponent's cursor shown as a live purple blinking bar inside the text
- Progress bars update in real time for both players
- Winner is whoever finishes first or is furthest ahead when time runs out

### ⌨️ Typing Challenge — Round Battle
- Up to 6 players
- Choose rounds: 3, 5, or 7
- All players get the same text each round
- 30s timer for round 1, increasing each round as texts get longer and harder
- Complete the text to advance to the next round — fail and you're eliminated
- Players can be on different rounds simultaneously
- Live scoreboard shows each player's current round or eliminated status

---

## Getting Started

### Prerequisites
- Node.js 20+

---

### Run Locally

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend → http://localhost:5173  
Backend → http://localhost:3000

---

## Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
```

---

## Project Structure

```
PlayVerse/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── services/
        └── utils/
```

---

## License

MIT
