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

WORKDIR /app/apps/worker-backend
RUN pnpm build

CMD ["node", "dist/index.js"]
