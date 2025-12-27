# ============================================
# SHARED - Build shared packages
# ============================================
FROM base AS shared
COPY --from=deps /app/node_modules ./node_modules
COPY packages/database ./packages/database
COPY packages/common ./packages/common

# Generate Prisma Client FIRST
WORKDIR /app/packages/database
RUN pnpm prisma generate
RUN pnpm build

# Build common package
WORKDIR /app/packages/common
RUN pnpm build

WORKDIR /app
