FROM node:20-alpine AS base

# ── Stage 1: Build frontend ───────────────────────
FROM base AS builder

WORKDIR /app

# 复制前端依赖定义文件（利用 Docker 缓存）
COPY package.json package-lock.json* ./
RUN npm ci

# 复制前端源码并构建
COPY . .
RUN npm run build

# ── Stage 2: Production image (minimal) ────────────
FROM node:20-alpine

WORKDIR /app

# 安装后端依赖
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force

# 从构建阶段复制产物
COPY --from=builder /app/dist ./dist
COPY server/index.js ./server/

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server/index.js"]
