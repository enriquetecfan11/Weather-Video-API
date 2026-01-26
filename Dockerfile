# Stage 1: Build
FROM node:22.13-alpine AS builder

# Instalar dependencias del sistema necesarias para build
RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm install

# Copiar código fuente
COPY . .

# Stage 2: Runtime
FROM node:22.13-alpine AS runtime

# Instalar Chrome/Chromium y dependencias necesarias para Remotion
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    && rm -rf /var/cache/apk/*

# Crear symlink para chromium-browser (Alpine usa /usr/bin/chromium)
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser || true

# Configurar variables de entorno para Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium
ENV DISPLAY=:99

WORKDIR /app

# Copiar node_modules y código desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/server ./server

# Crear directorios para archivos temporales y salida
RUN mkdir -p temp out

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV MAX_CONCURRENT_RENDERS=2
ENV RENDER_TIMEOUT=300000
ENV TEMP_DIR=./temp
ENV OUT_DIR=./out
ENV LOG_LEVEL=info

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app && \
    chmod 755 /usr/bin/chromium

# Chromium necesita acceso a /dev/shm para funcionar correctamente
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

USER nodejs

# Comando de inicio
CMD ["npm", "run", "server"]
