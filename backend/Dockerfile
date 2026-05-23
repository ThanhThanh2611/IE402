FROM node:22-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.js ./drizzle.config.js
COPY backend/drizzle ./drizzle
COPY frontend/public/models /frontend/public/models
EXPOSE 3000
CMD ["node", "dist/index.js"]
