# 🎮 PlayVerse

A multiplayer gaming platform built with React, Node.js, Socket.IO and MongoDB.

## Games

| Game | Status |
|------|--------|
| 🎨 Scribble | Live |
| ⌨️ Typing Challenge | Coming Soon |

---

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Socket.IO Client, React Router v7

**Backend** — Node.js, Express, Socket.IO, Mongoose

**Database** — MongoDB Atlas

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

Frontend runs on http://localhost:5173, backend on http://localhost:3000.

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
