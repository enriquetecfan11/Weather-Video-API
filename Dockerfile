# Stage 1: Build
FROM node:22-bookworm-slim AS builder

# Instalar dependencias del sistema necesarias para build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm install

# Copiar código fuente
COPY . .

# Stage 2: Runtime
FROM node:22-bookworm-slim AS runtime

# Instalar dependencias necesarias para Chrome Headless Shell de Remotion
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2 \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# No configurar REMOTION_BROWSER_EXECUTABLE para que use Chrome Headless Shell por defecto
# Remotion descargará automáticamente Chrome Headless Shell si no está configurado

WORKDIR /app

# Copiar node_modules y código desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/server ./server

# Pre-descargar Chrome Headless Shell y asegurar permisos
RUN npx remotion browser ensure && \
    find node_modules/.remotion -type f -name "*chrome-headless-shell*" -exec chmod +x {} \; 2>/dev/null || true && \
    find node_modules/.remotion -type d -exec chmod 755 {} \; 2>/dev/null || true

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
RUN groupadd -r nodejs -g 1001 && \
    useradd -r -g nodejs -u 1001 nodejs

# Chrome Headless Shell necesita acceso a /dev/shm para funcionar correctamente
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

# Asegurar que nodejs tenga permisos en /app (incluyendo node_modules/.remotion)
RUN chown -R nodejs:nodejs /app

USER nodejs

# Comando de inicio
CMD ["npm", "run", "server"]
