#------ Dependencies stage -------#
FROM node:25-alpine AS deps

WORKDIR /app

# Copy only necessary files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install pnpm and dependencies
RUN npm install -g pnpm \
    && pnpm install

#------ Build stage ------#
FROM node:25-alpine AS build

WORKDIR /app

# Copy application code and dependencies
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

RUN npm install -g pnpm \
    && pnpm --filter api build \
    && pnpm --filter api prisma:generate

#----- Final stage -------#
FROM node:25-alpine AS final

WORKDIR /app

# Copy built application and necessary files
COPY --from=deps /app/apps/api/node_modules/ ./apps/api/node_modules
COPY --from=deps /app/node_modules/ ./node_modules
COPY --from=build /app/apps/api/dist/ ./apps/api
COPY --from=build /app/apps/api/prisma/ ./apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

ENV NODE_ENV=production

CMD [ "node", "apps/api/server.js" ]