# ─── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ARG CACHE_BUST=2

# Declare all VITE build-time variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_MAPBOX_TOKEN
ARG VITE_API_URL

# Expose them to Vite during build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV VITE_API_URL=$VITE_API_URL

# Copy root package files
COPY package*.json ./

# Copy client package files
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN npm install --prefix client --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app (VITE_ vars are now available)
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

# Copy built client from builder stage
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "api/index.js"]