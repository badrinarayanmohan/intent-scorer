# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Tripworks Intent Scorer demo: static React build served by unprivileged nginx.
#
#   docker build -t intent-scorer .
#   docker run -p 8080:8080 -e FRAME_ANCESTORS="https://badriwhowonders.com" intent-scorer
#
# Build args:
#   VITE_BASE   path the app is served from (default "/"; e.g. "/portfolio/intent-scorer/")
# Runtime env:
#   FRAME_ANCESTORS  space-separated origins allowed to embed the demo in an <iframe>
# ---------------------------------------------------------------------------

# ---- 1. Build ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ARG VITE_BASE=/
ENV VITE_BASE=${VITE_BASE}
# Fail the image build if the scorer tests fail.
RUN npm test && npm run build

# ---- 2. Serve ---------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

ARG VITE_BASE=/
ENV APP_BASE=${VITE_BASE} \
    FRAME_ANCESTORS="https://badriwhowonders.com https://www.badriwhowonders.com"

# nginx's entrypoint renders /etc/nginx/templates/*.template with envsubst at startup.
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html${VITE_BASE}

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
