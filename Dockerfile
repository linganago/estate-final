# ─── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy client package files
COPY client/package*.json ./client/

# Install ALL deps (including devDeps needed for the build)
RUN npm install --legacy-peer-deps
RUN npm install --prefix client --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
# Pass build-time env vars if needed:
# ARG VITE_FIREBASE_API_KEY
# ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
RUN npm run build --prefix client

# ─── Stage 2: Production server ───────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy only production package files
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy API source
COPY api/ ./api/

# Copy built client from previous stage
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/user/test || exit 1

CMD ["node", "api/index.js"]
