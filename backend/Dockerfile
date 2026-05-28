# Stage 1: Install dependencies and generate Prisma Client
FROM node:20-alpine AS deps
WORKDIR /app

# Copy dependency definition files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client (uses the custom output path in schema.prisma)
RUN npx prisma generate

# Stage 2: Build the TypeScript backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies and project source files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TS code to JS (outputs to dist/)
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy required files for execution and migrations
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

EXPOSE 4000
ENV PORT 4000

# Startup script:
# 1. Run Prisma database migrations to keep the database schema in sync.
# 2. Start the production Node server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
