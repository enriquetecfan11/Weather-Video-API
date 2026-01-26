# Setup y Configuración

## Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Espacio en disco suficiente para archivos temporales (recomendado: >1GB)

## Instalación

```bash
# Clonar o navegar al proyecto
cd testing

# Instalar dependencias
npm install
```

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto (opcional):

```env
# Puerto del servidor
PORT=3000

# Límite de renders concurrentes
MAX_CONCURRENT_RENDERS=2

# Timeout por render en milisegundos (5 minutos)
RENDER_TIMEOUT=300000

# Directorio para archivos temporales
TEMP_DIR=./temp

# Directorio de salida (para renders manuales)
OUT_DIR=./out

# Nivel de logging (info, warn, error, debug)
LOG_LEVEL=info

# API Key de Groq para parser mejorado (opcional, usa fallback determinista si no está)
GROQ_API_KEY=your_groq_api_key_here
```

Si no se crea el archivo `.env`, se usarán los valores por defecto.

**Nota sobre Groq**: Si no se configura `GROQ_API_KEY`, el sistema usará automáticamente el parser determinista como fallback. El parser con Groq ofrece mayor precisión en la extracción de información meteorológica.

## Scripts Disponibles

### Desarrollo

- `npm start`: Inicia Remotion Studio para desarrollo de composiciones
- `npm run dev`: Inicia servidor API en modo desarrollo con watch (tsx watch)
- `npm run server`: Inicia servidor API en modo producción

### Producción

- `npm run render`: Renderiza vídeo manualmente usando CLI de Remotion

## Estructura de Carpetas

```
testing/
├── src/                    # Código Remotion (componentes React)
│   ├── components/        # Componentes de vídeo
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utilidades Remotion
├── server/                # Servidor API
│   ├── routes/           # Endpoints
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Utilidades
│   └── types/            # Tipos TypeScript
├── docs/                  # Documentación
├── temp/                  # Archivos temporales (gitignored)
├── out/                   # Vídeos renderizados
└── package.json
```

## Iniciar el Servidor

### Modo Desarrollo

```bash
npm run dev
```

El servidor se reiniciará automáticamente cuando cambies archivos.

### Modo Producción

```bash
npm run server
```

El servidor estará disponible en `http://localhost:3000` (o el puerto configurado).

## Verificar Instalación

1. **Verificar dependencias**:
   ```bash
   npm list --depth=0
   ```

2. **Probar health check**:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Verificar sistema completo** (recomendado):
   ```bash
   curl http://localhost:3000/test
   ```
   
   Este endpoint verifica:
   - Estado del servidor (memoria, uptime, Node.js version)
   - Accesibilidad de directorios (temp/, out/)
   - Dependencias de Remotion
   - Chrome/Chromium para renderizado
   - Variables de entorno
   - Sistema de cola
   - Parser funcional

4. **Probar renderizado**:
   ```bash
   curl -X POST http://localhost:3000/render \
     -H "Content-Type: application/json" \
     -d '{"text": "Madrid: soleado, 25°C"}' \
     --output test-video.mp4
   ```

## Solución de Problemas de Instalación

### Error: "Cannot find module"

```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

Cambiar el puerto en `.env` o matar el proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Error: "Remotion not found"

Asegúrate de que todas las dependencias de Remotion estén instaladas:
```bash
npm install @remotion/cli @remotion/bundler @remotion/renderer remotion
```

## Deployment con Docker

### Requisitos
- Docker >= 20.10
- Docker Compose >= 2.0 (o docker-compose >= 1.29)

### Uso Rápido con Script

El proyecto incluye un script automatizado para regenerar contenedores:

```bash
# Reconstrucción básica
./rebuild-docker.sh

# Reconstrucción sin caché (forzar rebuild completo)
./rebuild-docker.sh -f

# Limpiar volúmenes y archivos temporales antes de reconstruir
./rebuild-docker.sh -c

# Reconstruir, mostrar logs y verificar servicio
./rebuild-docker.sh -l -t

# Ver todas las opciones
./rebuild-docker.sh -h
```

**Opciones del script**:
- `-h, --help`: Mostrar ayuda
- `-f, --force`: Forzar reconstrucción sin caché
- `-c, --clean`: Limpiar volúmenes y archivos temporales
- `-l, --logs`: Mostrar logs después de iniciar
- `-t, --test`: Verificar que el servicio funciona después de iniciar
- `-s, --stop`: Solo detener y eliminar contenedores (no reconstruir)
- `-v, --verbose`: Mostrar más información durante el proceso

### Uso Manual

1. **Crear archivo `.env`** (si no existe):
   ```bash
   cp .env.example .env
   # Editar .env según necesidad
   ```

2. **Construir e iniciar contenedores**:
   ```bash
   docker-compose up -d --build
   ```

3. **Verificar que está funcionando**:
   ```bash
   # Health check
   curl http://localhost:8020/health
   
   # Estado completo del sistema
   curl http://localhost:8020/test
   ```

4. **Ver logs**:
   ```bash
   docker-compose logs -f
   ```

5. **Detener contenedores**:
   ```bash
   docker-compose down
   ```

### Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f api

# Reiniciar servicio
docker-compose restart

# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up -d

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v
docker rmi $(docker images | grep weather-video | awk '{print $3}')

# Acceder al contenedor
docker exec -it weather-video-api sh
```

### Puertos

- **8020**: Puerto expuesto del contenedor (mapea al puerto 3000 interno)
- **3000**: Puerto interno del contenedor (no accesible desde fuera)

### Volúmenes

Los siguientes directorios se montan como volúmenes:
- `./temp` → `/app/temp` (archivos temporales)
- `./out` → `/app/out` (vídeos renderizados)

Esto permite acceder a los archivos generados desde el host.

### Troubleshooting Docker

**El contenedor no inicia**:
```bash
# Ver logs detallados
docker-compose logs api

# Verificar configuración
docker-compose config
```

**Problemas con permisos**:
```bash
# Asegurar que los directorios existen y tienen permisos
mkdir -p temp out
chmod 755 temp out
```

**Limpiar completamente**:
```bash
# Usar el script con opción -c
./rebuild-docker.sh -c

# O manualmente
docker-compose down -v
docker system prune -a
```
