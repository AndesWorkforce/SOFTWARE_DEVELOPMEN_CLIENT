# =============================================================================
# Stage 1 — base: Node + pnpm
# =============================================================================
FROM node:20-alpine AS base

# Enable Corepack so pnpm is available without a separate install
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =============================================================================
# Stage 2 — deps: install all dependencies (including devDeps for build)
# =============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
# --frozen-lockfile ensures reproducible installs in CI/CD
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3 — builder: compile the Next.js application
#
# NEXT_PUBLIC_* variables are embedded into the JS bundle at BUILD TIME.
# Each environment (dev / staging / prod) must be built with its own values.
# Pass them through --build-arg when running `docker build`.
#
# Example:
#   docker build \
#     --build-arg NEXT_PUBLIC_ENV=production \
#     --build-arg NEXT_PUBLIC_API_BASE_URL_PROD=https://api-gateway.test.andes-workforce.com \
#     -t andes-client:prod .
# =============================================================================
FROM base AS builder

# Build-time arguments (injected by docker build --build-arg or CI pipeline)
ARG NEXT_PUBLIC_ENV=development
ARG NEXT_PUBLIC_API_BASE_URL_DEV=http://localhost:3001
ARG NEXT_PUBLIC_API_BASE_URL_STAGING=https://api-staging.andesworkforce.com
ARG NEXT_PUBLIC_API_BASE_URL_PROD=https://api-gateway.test.andes-workforce.com

# Expose as environment variables so Next.js picks them up during `next build`
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_API_BASE_URL_DEV=$NEXT_PUBLIC_API_BASE_URL_DEV
ENV NEXT_PUBLIC_API_BASE_URL_STAGING=$NEXT_PUBLIC_API_BASE_URL_STAGING
ENV NEXT_PUBLIC_API_BASE_URL_PROD=$NEXT_PUBLIC_API_BASE_URL_PROD

# Disable Next.js telemetry in CI/CD
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Reuse installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

RUN pnpm build

# =============================================================================
# Stage 4 — runner: minimal production image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security best practice: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the standalone output (smallest possible image)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next start is replaced by the standalone server.js
CMD ["node", "server.js"]
