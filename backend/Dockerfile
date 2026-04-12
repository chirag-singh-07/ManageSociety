FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json .eslintrc.cjs jest.config.cjs .prettierrc.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=base /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
