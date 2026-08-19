FROM node:22-alpine AS dependencies
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

FROM dependencies AS build
COPY backend/tsconfig.json backend/eslint.config.js ./
COPY backend/prisma ./prisma
COPY backend/src ./src
RUN npm run build

FROM node:22-alpine AS production-dependencies
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY backend/package.json ./package.json
USER node
EXPOSE 3333
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/server.js"]
