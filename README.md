# NestQuest Real Estate Platform

[![CI](https://github.com/linganago/estate-final/actions/workflows/ci.yml/badge.svg)](https://github.com/linganago/estate-final/actions/workflows/ci.yml)

Production: https://estate-final-production.up.railway.app/

NestQuest is a full-stack MERN real estate application for browsing properties, creating listings, managing user profiles, uploading listing media, and chatting in real time between buyers and listing owners.

## Highlights

- Email/password authentication with JWT stored in an httpOnly cookie.
- Google sign-in through Firebase Authentication.
- Property listings with create, update, delete, search, filters, sorting, and pagination.
- Cloudinary image upload for listing and profile media.
- Mapbox listing maps and geocoding.
- Real-time buyer-owner messaging with Socket.IO, unread badges, typing indicators, and REST fallback.
- Production Express server that serves both the API and the built React client.
- Security hardening with Helmet, CORS allowlisting, auth rate limiting, bcrypt password hashing, and server-side route validation.
- Docker and Railway deployment support.
- Jest and Supertest integration coverage for auth and listings.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Redux Toolkit, Redux Persist, Tailwind CSS, React Router |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT cookies, bcryptjs, Firebase Google Auth |
| Media | Cloudinary |
| Maps | Mapbox GL |
| Testing | Jest, Supertest, mongodb-memory-server |
| Deployment | Railway, Docker |

## Architecture

```txt
client/                      React application
  src/components/            Shared UI, listing, chat, auth, image components
  src/context/               Socket.IO client provider
  src/pages/                 Route-level screens
  src/redux/                 Persisted user session state

api/                         Express application
  controllers/               Request handlers
  middleware/                Validation and auth middleware
  models/                    Mongoose schemas
  routes/                    API route modules
  services/                  Listing business logic
  utils/                     Cloudinary, errors, JWT helpers
  app.js                     Express app, security, CORS, static client serving
  index.js                   Mongo connection and HTTP/Socket server bootstrap
  socket.js                  Socket.IO auth and chat events
```

## Local Development

### Requirements

- Node.js 20+
- npm 9+
- MongoDB Atlas database
- Firebase project with Authentication enabled
- Cloudinary account
- Mapbox public token

### Install

```bash
npm install
npm install --prefix client
```

### Configure Environment

Create `.env` in the repository root:

```env
MONGO=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<64-byte-random-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_FIREBASE_API_KEY=<firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_FIREBASE_MEASUREMENT_ID=<measurement-id>
VITE_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-upload-preset>
VITE_MAPBOX_TOKEN=<mapbox-public-token>
VITE_API_URL=
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Run

Start the API:

```bash
npm run dev
```

Start the Vite client:

```bash
npm run dev --prefix client
```

Local URLs:

| Service | URL |
| --- | --- |
| API | http://localhost:3000 |
| Client | http://localhost:5173 |

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production Express server |
| `npm run dev` | Start the API with nodemon |
| `npm run build` | Install client dependencies and build the React app |
| `npm test` | Run Jest integration tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run build --prefix client` | Build only the React client |
| `npm run lint --prefix client` | Run the frontend ESLint checks |

## API Overview

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/signin` | Sign in and set the JWT cookie |
| `POST` | `/api/auth/google` | Complete Firebase Google sign-in against the app database |
| `GET` | `/api/auth/signout` | Clear the auth cookie |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/user/update/:id` | Update profile fields |
| `DELETE` | `/api/user/delete/:id` | Delete account |
| `GET` | `/api/user/listings/:id` | Get listings owned by a user |
| `GET` | `/api/user/contact/:id` | Get listing owner contact details |

### Listings

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/listing/create` | Create a listing |
| `POST` | `/api/listing/update/:id` | Update a listing |
| `DELETE` | `/api/listing/delete/:id` | Delete a listing |
| `GET` | `/api/listing/get/:id` | Get one listing |
| `GET` | `/api/listing/get` | Search and filter listings |

### Chat

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/chat/conversations` | Get or create a conversation |
| `GET` | `/api/chat/conversations` | List conversations for the signed-in user |
| `GET` | `/api/chat/conversations/:id/messages` | Load conversation messages |
| `POST` | `/api/chat/conversations/:id/messages` | Send a message through REST fallback |

### Socket.IO Events

| Direction | Event | Payload |
| --- | --- | --- |
| Client to server | `join_conversation` | `{ conversationId }` |
| Client to server | `leave_conversation` | `{ conversationId }` |
| Client to server | `send_message` | `{ conversationId, text }` |
| Client to server | `typing` | `{ conversationId }` |
| Client to server | `stop_typing` | `{ conversationId }` |
| Server to client | `joined` | `{ conversationId }` |
| Server to client | `new_message` | message document |
| Server to client | `conversation_updated` | conversation preview data |
| Server to client | `user_typing` | `{ userId }` |
| Server to client | `user_stopped_typing` | `{ userId }` |
| Server to client | `error` | `{ message }` |

## Production Deployment

The deployed application is hosted on Railway:

```txt
https://estate-final-production.up.railway.app/
```

Railway runs one Node service. Express serves `/api/*`, Socket.IO, and the built React assets from `client/dist`.

### Railway Variables

Set these in Railway service variables:

```env
CLIENT_URL=https://estate-final-production.up.railway.app
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
JWT_SECRET=<64-byte-random-secret>
MONGO=<mongodb-atlas-connection-string>
NODE_ENV=production
PORT=3000
VITE_API_URL=
VITE_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-upload-preset>
VITE_FIREBASE_API_KEY=<firebase-api-key>
VITE_FIREBASE_APP_ID=<firebase-app-id>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_FIREBASE_MEASUREMENT_ID=<measurement-id>
VITE_MAPBOX_TOKEN=<mapbox-public-token>
```

Important: Vite variables are baked into the frontend at build time. After changing any `VITE_*` value, redeploy the Railway service.

### Firebase Google Auth Checklist

Firebase Authentication authorized domains:

```txt
localhost
127.0.0.1
<project-id>.firebaseapp.com
<project-id>.web.app
estate-final-production.up.railway.app
```

Google OAuth redirect URI:

```txt
https://<project-id>.firebaseapp.com/__/auth/handler
```

For this deployment:

```txt
https://mern-estate-aff00.firebaseapp.com/__/auth/handler
```

### Build and Start

Railway uses:

```bash
npm run build
npm start
```

Docker uses the included multi-stage `Dockerfile`.

## Security Notes

- Do not commit `.env` or production secrets.
- Rotate any secret that was pasted into chat, logs, screenshots, or issue trackers.
- JWTs are stored in httpOnly cookies.
- Passwords are hashed with bcrypt.
- Auth endpoints are rate-limited.
- CORS is restricted to configured origins and Railway's public service domain.
- Helmet uses `same-origin-allow-popups` so Firebase popup auth can complete in production.
- Socket.IO validates the JWT before allowing room joins or message events.

## CI

GitHub Actions runs the project CI workflow:

```txt
.github/workflows/ci.yml
```

Badge:

```md
[![CI](https://github.com/linganago/estate-final/actions/workflows/ci.yml/badge.svg)](https://github.com/linganago/estate-final/actions/workflows/ci.yml)
```

## Troubleshooting

### Google sign-in shows `redirect_uri_mismatch`

Add the Firebase auth handler URL to the Google OAuth client:

```txt
https://mern-estate-aff00.firebaseapp.com/__/auth/handler
```

### Google sign-in shows `auth/unauthorized-domain`

Add the Railway domain to Firebase Authentication authorized domains:

```txt
estate-final-production.up.railway.app
```

### Sign-in works but private requests fail

Check the deployed response includes:

```txt
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=None
```

Also confirm `NODE_ENV=production`, `CLIENT_URL` is the production URL, and the browser is using HTTPS.

### Socket.IO does not connect

Keep `VITE_API_URL` empty when the React app and API are served from the same Railway service. If deploying frontend and API separately, set `VITE_API_URL` to the backend URL.

## License

ISC
