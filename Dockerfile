# Base Stage
FROM node:22-alpine AS base

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Development Stage
FROM base AS development
COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

USER node

# Build Stage
FROM base AS build
COPY --chown=node:node package.json pnpm-lock.yaml ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm run build

# Production Stage
FROM base AS production

ENV NODE_ENV=production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
