FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install

WORKDIR /app/packages/database
RUN pnpm prisma generate
RUN pnpm build

WORKDIR /app/packages/common
RUN pnpm build

WORKDIR /app/apps/websocket-backend
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]
