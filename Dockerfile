FROM node:22.15.1-slim AS client_builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV VITE_API_URL="/api"
RUN corepack enable

COPY ./apps/client/package.json ./apps/client/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./apps/client/ ./
RUN pnpm run build


FROM golang:1.24.3-alpine AS builder

WORKDIR /app

COPY ./apps/api/go.mod ./apps/api/go.sum ./

RUN --mount=type=cache,id=go,target=/go/pkg/mod go mod download

COPY ./apps/api/ ./
COPY --from=client_builder /app/dist ./static

RUN --mount=type=cache,id=go,target=/go/pkg/mod go build -o /app/api .


FROM scratch

WORKDIR /app

COPY --from=builder /app/api ./api

ENTRYPOINT ["/app/api"]