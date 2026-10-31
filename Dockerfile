# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS build
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY} CI=true NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.16.1 --loglevel=error
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo run build --filter=@argiva/web...

FROM ${NODE_IMAGE} AS runner
ARG APP_VERSION=dev
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0 APP_VERSION=${APP_VERSION}
WORKDIR /app
RUN addgroup -S argiva && adduser -S argiva -G argiva \
  && mkdir -p /data/uploads && chown argiva:argiva /data/uploads
COPY --from=build --chown=argiva:argiva /repo/apps/web/.next/standalone ./
COPY --from=build --chown=argiva:argiva /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=argiva:argiva /repo/apps/web/public ./apps/web/public
USER argiva
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "apps/web/server.js"]
