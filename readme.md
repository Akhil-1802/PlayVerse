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

**Infrastructure** — Docker, Nginx

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for containerised setup)

---

### Run with Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/Akhil-1802/PlayVerse.git
cd PlayVerse

# Add your environment variables
cp backend/.env.example backend/.env
# Fill in MONGODB_URI in backend/.env

# Start everything
docker compose up --build
```

- Frontend → http://localhost
- Backend → http://localhost:3000

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
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## License

MIT
