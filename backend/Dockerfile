FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

FROM base AS builder
ENV NODE_ENV=development
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
