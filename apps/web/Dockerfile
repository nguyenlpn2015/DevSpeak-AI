# ==============================================================================
# DevSpeak AI - Frontend Multi-Stage Dockerfile (Next.js 15 / Node.js 22 Alpine)
# Security: Multi-stage, non-root user (UID 1001), minimal attack surface
# ==============================================================================

# Stage 1: Dependency Installation
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Production Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application assets
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set non-root ownership
RUN chown -R nextjs:nodejs /app

USER nextjs:nodejs

EXPOSE 3001

# Zero-dependency Node.js healthcheck probing HTTP root endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3001), (res) => { if (res.statusCode < 400) process.exit(0); else process.exit(1); })" || exit 1

CMD ["npm", "start"]

