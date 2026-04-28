# 🏡 MERN Estate — Full-Stack Real Estate Platform

A production-ready real estate marketplace built with **MongoDB · Express · React · Node.js**.  
Browse, list, and manage properties — with **real-time buyer ↔ owner chat** powered by Socket.IO.

---

## ✨ Feature Highlights

| Category | Features |
|---|---|
| **Auth** | JWT (httpOnly cookie), Google OAuth via Firebase, rate limiting, bcrypt |
| **Listings** | Create, update, delete, image upload (Cloudinary), interactive Mapbox map |
| **Search** | Full-text search, filters (type, offer, furnished, parking), sort & pagination |
| **💬 Real-time Chat** | Socket.IO WebSocket chat between buyers and owners, typing indicators, unread badges, message history |
| **Security** | Helmet, CORS, rate limiting, input validation (Zod) |
| **DevOps** | Docker + Compose, GitHub Actions CI, Jest integration tests |

---

## 🗂 Project Structure

```
mern-estate/
├── api/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── listing.controller.js
│   │   ├── user.controller.js
│   │   └── chat.controller.js        ← NEW
│   ├── models/
│   │   ├── user.model.js
│   │   ├── listing.model.js
│   │   ├── conversation.model.js     ← NEW
│   │   └── message.model.js          ← NEW
│   ├── routes/
│   │   ├── auth.router.js
│   │   ├── listing.route.js
│   │   ├── user.route.js
│   │   ├── upload.js
│   │   └── chat.route.js             ← NEW
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── socket.js                     ← NEW
│   ├── app.js
│   └── index.js
├── client/
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx        ← NEW
│       │   └── Contact.jsx           ← UPDATED
│       ├── context/
│       │   └── SocketContext.jsx     ← NEW
│       ├── pages/
│       │   └── Inbox.jsx             ← NEW
│       └── App.jsx                   ← UPDATED
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 🚀 Local Development — Step by Step

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20+ |
| npm | v9+ |
| MongoDB Atlas | Free tier |
| Cloudinary | Free tier |
| Firebase project | For Google OAuth |
| Mapbox account | For the map widget |

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/mern-estate.git
cd mern-estate

# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix client
```

---

### Step 2 — Configure Backend Environment

```bash
cp .env.example .env
```

Open `.env` and fill in every value:

```env
MONGO=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/mern-estate?retryWrites=true&w=majority
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

**Where to get each value:**
- `MONGO` → [MongoDB Atlas](https://cloud.mongodb.com) → your cluster → Connect → Drivers
- `CLOUDINARY_*` → [Cloudinary Console](https://cloudinary.com) → Dashboard

---

### Step 3 — Configure Frontend Environment

```bash
cp client/.env.example client/.env
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_API_URL=
```

**Where to get each value:**
- `VITE_FIREBASE_*` → [Firebase Console](https://console.firebase.google.com) → Project Settings → General → Your apps
- `VITE_MAPBOX_TOKEN` → [Mapbox Account](https://account.mapbox.com) → Tokens (use your default public token)

> Leave `VITE_API_URL` blank for local dev — Vite proxies `/api` and `/socket.io` to localhost:3000 automatically.

---

### Step 4 — Run Development Servers

Open **two** terminal tabs:

```bash
# Tab 1 — Backend (nodemon auto-reload)
npm run dev

# Tab 2 — Frontend (Vite HMR)
npm run dev --prefix client
```

| Service | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:5173 |

---

### Step 5 — Run Tests

```bash
# Unit + integration tests
npm test

# With coverage report
npm run test:coverage
```

---

## 💬 Real-Time Chat — Architecture

```
Buyer Browser                Socket.IO Server (port 3000)         Owner Browser
      |                               |                                  |
      |──join_conversation──────────>|                                  |
      |──send_message───────────────>│──new_message────────────────────>|
      |<─new_message─────────────────|                                  |
      |                              |──conversation_updated───────────>|
      |──typing─────────────────────>│──user_typing────────────────────>|
      |──stop_typing────────────────>│──user_stopped_typing────────────>|
```

**Flow:**
1. Buyer visits a listing page → clicks **"Chat with Owner"**
2. `Contact.jsx` calls `POST /api/chat/conversations` → creates or retrieves the conversation document
3. `ChatWindow.jsx` mounts → loads message history via `GET /api/chat/conversations/:id/messages`
4. Socket.IO client joins the conversation room (`join_conversation`)
5. Messages sent via `send_message` socket event are persisted to MongoDB and broadcast to the room
6. Owner sees the message in their **Inbox** page (`/inbox`) in real time

---

## 🐳 Docker — Local Container Run

```bash
cp .env.example .env          # fill in all values
cp client/.env.example client/.env   # fill in all values

docker compose up --build
```

App available at → http://localhost:3000

To stop:
```bash
docker compose down
```

---

## ☁️ Deployment

### Option A — Railway ⭐ (Recommended)

Easiest option. Supports WebSockets natively.

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Add all variables from `.env.example` in the Railway **Variables** tab
4. Set `CLIENT_URL` to your Railway public URL (e.g. `https://mern-estate-production.up.railway.app`)
5. Railway detects `npm run build` and `npm start` automatically — click **Deploy**

> Build command: `npm run build`  
> Start command: `npm start`

---

### Option B — Fly.io

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Create app (do NOT deploy yet)
fly launch --name mern-estate --region iad --no-deploy

# 4. Set all secrets
fly secrets set \
  MONGO="your_mongo_uri" \
  JWT_SECRET="your_64char_secret" \
  CLOUDINARY_CLOUD_NAME="your_name" \
  CLOUDINARY_API_KEY="your_key" \
  CLOUDINARY_API_SECRET="your_secret" \
  NODE_ENV="production" \
  CLIENT_URL="https://mern-estate.fly.dev"

# 5. Deploy
fly deploy
```

Add this `fly.toml` to your project root:

```toml
app = "mern-estate"
primary_region = "iad"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

---

### Option C — DigitalOcean App Platform

1. Push to GitHub
2. [DigitalOcean App Platform](https://cloud.digitalocean.com/apps) → **Create App** → GitHub
3. Select your repo, set:
   - **Build command:** `npm run build`
   - **Run command:** `npm start`
4. Add all environment variables
5. Set `CLIENT_URL` to your `*.ondigitalocean.app` URL

> WebSockets are supported on Basic plan and above.

---

### Option D — VPS (Ubuntu 22.04) with PM2 + Nginx

**On your server:**

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & build
git clone https://github.com/your-username/mern-estate.git /var/www/mern-estate
cd /var/www/mern-estate
cp .env.example .env        # fill in all values
npm run build

# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start api/index.js --name mern-estate
pm2 save
pm2 startup              # follow the printed command to enable on boot
```

**Nginx config** (`/etc/nginx/sites-available/mern-estate`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # ⚠️  These two lines are REQUIRED for WebSocket / Socket.IO to work
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mern-estate /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Add free SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

### Frontend Env Variables in Production

When Express serves the built React app (the default), there is one process and one URL — leave `VITE_API_URL` blank.

If you deploy the **frontend separately** (e.g., Vercel for client + Railway for API), set:

```env
VITE_API_URL=https://your-backend.railway.app
```

The `SocketContext.jsx` already reads `import.meta.env.VITE_API_URL || ''` so the socket will connect to the correct server.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ username, email, password }` | Register |
| POST | `/api/auth/signin` | `{ email, password }` | Login (sets httpOnly cookie) |
| POST | `/api/auth/google` | `{ name, email, photo }` | Google OAuth |
| GET | `/api/auth/signout` | — | Logout (clears cookie) |

### Listings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/listing/create` | ✅ | Create a listing |
| PUT | `/api/listing/update/:id` | ✅ | Update listing (owner only) |
| DELETE | `/api/listing/delete/:id` | ✅ | Delete listing (owner only) |
| GET | `/api/listing/get/:id` | — | Get single listing |
| GET | `/api/listing/get` | — | Search listings (query params) |

### Chat

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/chat/conversations` | ✅ | Get or create conversation |
| GET | `/api/chat/conversations` | ✅ | List all my conversations |
| GET | `/api/chat/conversations/:id/messages` | ✅ | Load message history |
| POST | `/api/chat/conversations/:id/messages` | ✅ | Send message (REST fallback) |

### Socket.IO Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `join_conversation` | `{ conversationId }` | Join a chat room |
| `leave_conversation` | `{ conversationId }` | Leave a chat room |
| `send_message` | `{ conversationId, text }` | Send a message |
| `typing` | `{ conversationId }` | Emit typing indicator |
| `stop_typing` | `{ conversationId }` | Clear typing indicator |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `new_message` | Message object | New message broadcast to room |
| `user_typing` | `{ userId }` | Other participant is typing |
| `user_stopped_typing` | `{ userId }` | Other participant stopped |
| `conversation_updated` | `{ conversationId, lastMessage, lastMessageAt }` | Inbox preview update |
| `joined` | `{ conversationId }` | Room join confirmed |
| `error` | `{ message }` | Server-side error |

---

## 🔒 Security Notes

- JWT stored in **httpOnly cookie** — not readable by JavaScript
- Auth endpoints rate-limited: **30 requests / 15 minutes per IP**
- All chat REST routes require a valid JWT cookie
- Socket.IO connection requires valid JWT cookie (verified server-side before any event is handled)
- Conversation access is re-validated on every Socket.IO event — users cannot read or write to conversations they don't belong to
- Helmet sets 11 security headers on every response

---

## 📄 License

ISC
