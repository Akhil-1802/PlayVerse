# 🎮 PlayVerse

A multiplayer gaming platform built with React, Node.js, Socket.IO and MongoDB.

🌐 **Live:** [playverse10.netlify.app](https://playverse10.netlify.app)

PlayVerse is an interactive online gaming hub where players can engage in real-time multiplayer games including drawing challenges and typing races. Whether you're sketching with friends or competing in fast-paced typing battles, PlayVerse offers a fun and competitive environment for all skill levels.

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
- MongoDB Atlas account (for database)

---

### Run Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PlayVerse
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   - Frontend → http://localhost:5173
   - Backend → http://localhost:3000

---

## Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.

---

## Project Structure

```
PlayVerse/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       │   ├── room.controller.js
│       │   ├── typingRoom.controller.js
│       │   └── typingRoundRoom.controller.js
│       ├── models/
│       │   ├── message.model.js
│       │   ├── room.model.js
│       │   ├── typingRoom.model.js
│       │   └── typingRoundRoom.model.js
│       ├── routes/
│       │   ├── room.route.js
│       │   ├── typingRoom.route.js
│       │   └── typingRoundRoom.route.js
│       └── utils/
│           ├── db.js
│           ├── helperfunction.js
│           ├── typingTexts.js
│           └── words.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   └── Canvas.jsx
│       ├── hooks/
│       │   └── userRoom.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Room.jsx
│       │   ├── Scribble.jsx
│       │   ├── Typing.jsx
│       │   ├── TypingRoom.jsx
│       │   └── TypingRoundRoom.jsx
│       ├── services/
│       │   └── userServices.js
│       └── utils/
│           └── socket.js
├── LICENSE
└── readme.md
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT
