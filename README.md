# Weather Video API

<div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/version-0.1.0-green.svg" alt="Version">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs">
</div>

> API HTTP de producción que parsea texto meteorológico en español y renderiza vídeos MP4 automáticamente usando Remotion. Sistema robusto con gestión de cola, validación de entrada y logging completo.

## 📋 Table of Contents

- [Características](#-características)
- [Instalación](#-instalación)
- [Deployment con Docker](#-deployment-con-docker)
- [Uso de la API](#-uso-de-la-api)
- [Tech Stack](#-tech-stack)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Authors](#-authors)

## ✨ Características

### API HTTP
- **Parser determinista**: Extrae información meteorológica de texto en español sin usar IA
- **Renderizado automático**: Genera vídeos MP4 usando composiciones Remotion
- **Gestión de cola**: Sistema de cola con límites de concurrencia configurables
- **Validación robusta**: Validación completa de entrada con mensajes de error claros
- **Logging completo**: Sistema de logging con winston para monitoreo y debugging
- **Limpieza automática**: Gestión automática de archivos temporales

### Vídeos Generados
- Animaciones fluidas con interpolación y efectos spring
- Diseño moderno con gradientes y efectos visuales
- Nubes animadas que se desplazan
- Tarjetas informativas con condición, sensación térmica y viento
- Resolución configurable (por defecto 1080x1920)
- Layout adaptativo que se ajusta a nombres largos

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm run server
```

El servidor se iniciará en `http://localhost:3000` por defecto (o en el puerto configurado en `PORT`).

**Nota para Docker**: Cuando uses Docker, el servicio estará disponible en el puerto **8020**.

## 🐳 Deployment con Docker

### Requisitos Previos

- Docker >= 20.10
- Docker Compose >= 2.0 (opcional, pero recomendado)

### Configuración Rápida

1. **Crear archivo `.env`** (si no existe):
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

2. **Build y ejecutar con Docker Compose**:
   ```bash
   # Desarrollo/Producción
   docker-compose up -d --build
   ```

### Build Manual

Si prefieres construir y ejecutar manualmente:

```bash
# Construir imagen
docker build -t weather-video-api .

# Ejecutar contenedor
docker run -d \
  --name weather-video-api \
  -p 8020:3000 \
  --env-file .env \
  -v $(pwd)/temp:/app/temp \
  -v $(pwd)/out:/app/out \
  weather-video-api
```

**Nota**: El puerto 8020 del host se mapea al puerto 3000 del contenedor.

### Verificar Deployment

```bash
# Health check
curl http://localhost:8020/health

# Test completo del sistema
curl http://localhost:8020/test

# Ver logs
docker-compose logs -f api

# Detener servicios
docker-compose down
```

**Nota**: El servicio está expuesto en el puerto **8020** en lugar del puerto 3000 por defecto.

### Variables de Entorno

Asegúrate de configurar las siguientes variables en tu `.env`:

```env
PORT=3000
MAX_CONCURRENT_RENDERS=2
RENDER_TIMEOUT=300000
TEMP_DIR=./temp
OUT_DIR=./out
LOG_LEVEL=info
GROQ_API_KEY=your_groq_api_key_here  # Opcional
```

### Volúmenes

- `temp/`: Archivos temporales (se limpian automáticamente después de 1 hora)
- `out/`: Vídeos renderizados (opcional, para persistir renders)

### Troubleshooting

**Problema**: Chrome/Chromium no funciona en el contenedor
- **Solución**: El Dockerfile ya incluye Chromium. Si persiste, verifica los logs del contenedor.

**Problema**: Error de permisos en volúmenes
- **Solución**: Asegúrate de que los directorios `temp/` y `out/` existan y tengan permisos correctos.

**Problema**: El contenedor se reinicia constantemente
- **Solución**: Revisa los logs con `docker-compose logs api` y verifica las variables de entorno.

## 📡 Uso de la API

### Endpoint: `POST /render`

Renderiza un vídeo meteorológico desde texto en español.

#### Request Body

```json
{
  "text": "Hoy en Mondéjar: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C y viento moderado, con alta probabilidad de precipitación",
  "options": {
    "outputFormat": "stream",
    "quality": 80,
    "fps": 30,
    "width": 1080,
    "height": 1920
  }
}
```

**Parámetros:**
- `text` (requerido): Texto meteorológico en español (10-1000 caracteres)
- `options` (opcional):
  - `outputFormat`: `"stream"` (por defecto) o `"url"`
  - `quality`: Número entre 0-100 (por defecto: 80)
  - `fps`: Frames por segundo, 1-60 (por defecto: 30)
  - `width`: Ancho del vídeo, 100-7680 (por defecto: 1080)
  - `height`: Alto del vídeo, 100-4320 (por defecto: 1920)

#### Response: Stream (por defecto)

Cuando `outputFormat` es `"stream"` o no se especifica:

- **Content-Type**: `video/mp4`
- **Status**: `200 OK`
- **Body**: Stream del archivo MP4

**Headers adicionales:**
- `X-Job-Id`: ID del job de renderizado
- `X-Processing-Time`: Tiempo de procesamiento en milisegundos

#### Response: URL

Cuando `outputFormat` es `"url"`:

```json
{
  "videoUrl": "/videos/temp-abc123.mp4",
  "expiresAt": "2026-01-23T12:00:00Z",
  "jobId": "render-1234567890-abc123"
}
```

#### Ejemplos de Uso

**Con curl (stream):**
```bash
# Sin Docker (puerto 3000)
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hoy en Madrid: soleado, 25°C, viento suave"
  }' \
  --output weather-video.mp4

# Con Docker (puerto 8020)
curl -X POST http://localhost:8020/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hoy en Madrid: soleado, 25°C, viento suave"
  }' \
  --output weather-video.mp4
```

**Con curl (URL):**
```bash
# Sin Docker
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Barcelona: nublado, temperaturas de 10 a 15 grados, lluvia moderada 60%",
    "options": {
      "outputFormat": "url"
    }
  }'

# Con Docker
curl -X POST http://localhost:8020/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Barcelona: nublado, temperaturas de 10 a 15 grados, lluvia moderada 60%",
    "options": {
      "outputFormat": "url"
    }
  }'
```

**Con JavaScript (fetch):**
```javascript
// Sin Docker (puerto 3000) o con Docker (puerto 8020)
const apiUrl = process.env.API_URL || 'http://localhost:8020'; // Ajusta según tu configuración
const response = await fetch(`${apiUrl}/render`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hoy en Mondéjar: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C y viento moderado, con alta probabilidad de precipitación'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Usar url para mostrar el vídeo
```

#### Códigos de Error

- `400 Bad Request`: Error de validación (texto inválido, parámetros incorrectos)
- `429 Too Many Requests`: Cola llena (demasiados renders concurrentes o en cola)
  - Incluye información del estado de la cola en la respuesta
  - Header `Retry-After` sugerido (60 segundos)
- `500 Internal Server Error`: Error en el renderizado
- `503 Service Unavailable`: Servicio temporalmente no disponible (timeout, etc.)

**Ejemplo de respuesta 429:**
```json
{
  "error": "Cola de renders llena. Intenta de nuevo más tarde.",
  "queueStatus": {
    "processing": 2,
    "queueSize": 2,
    "maxConcurrent": 2,
    "maxQueueSize": 4,
    "available": 0,
    "isFull": true,
    "utilization": 1.0
  },
  "retryAfter": 60
}
```

### Health Check: `GET /health`

Verifica el estado básico del servidor.

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T12:00:00.000Z",
  "uptime": 3600
}
```

### Test Endpoint: `GET /test`

Verifica el estado completo del sistema, incluyendo dependencias, directorios, Chrome/Chromium, cola y parser.

```bash
curl http://localhost:3000/test
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T12:00:00.000Z",
  "checks": {
    "server": {
      "status": "ok",
      "details": {
        "uptime": 3600,
        "nodeVersion": "v18.17.0",
        "platform": "linux",
        "memory": {
          "used": 150,
          "total": 200,
          "unit": "MB"
        }
      }
    },
    "directories": {
      "status": "ok",
      "message": "Directorios accesibles",
      "details": {
        "tempDir": "./temp",
        "outDir": "./out"
      }
    },
    "remotion": {
      "status": "ok",
      "message": "Dependencias de Remotion disponibles",
      "details": {
        "bundler": "ok",
        "renderer": "ok"
      }
    },
    "chrome": {
      "status": "ok",
      "message": "Chrome/Chromium encontrado",
      "details": {
        "path": "/usr/bin/chromium-browser"
      }
    },
    "environment": {
      "status": "ok",
      "message": "Variables de entorno verificadas",
      "details": {
        "PORT": "3000",
        "MAX_CONCURRENT_RENDERS": "2",
        "RENDER_TIMEOUT": "300000",
        "TEMP_DIR": "./temp",
        "OUT_DIR": "./out",
        "GROQ_API_KEY": "configurada"
      }
    },
    "queue": {
      "status": "ok",
      "message": "Sistema de cola operativo",
      "details": {
        "pending": 0,
        "processing": 1,
        "completed": 5,
        "failed": 0,
        "queueSize": 0,
        "maxConcurrent": 2,
        "timeout": 300000
      }
    },
    "parser": {
      "status": "ok",
      "message": "Parser funcional",
      "details": {
        "testText": "Madrid: soleado, 25°C"
      }
    }
  },
  "summary": {
    "total": 7,
    "passed": 7,
    "warnings": 0,
    "errors": 0
  }
}
```

**Códigos de respuesta:**
- `200 OK`: Todos los checks pasaron correctamente
- `503 Service Unavailable`: Uno o más checks fallaron

Este endpoint es útil para:
- Verificar que el sistema está listo para renderizar videos
- Diagnosticar problemas de configuración
- Verificar dependencias antes de desplegar
- Monitoreo de salud del sistema

### Estado de la Cola: `GET /queue/status`

Consulta el estado actual de la cola de renders para verificar si puede aceptar más trabajos.

```bash
curl http://localhost:8020/queue/status
```

Response:
```json
{
  "pending": 0,
  "processing": 1,
  "completed": 5,
  "failed": 0,
  "queueSize": 0,
  "maxConcurrent": 2,
  "maxQueueSize": 4,
  "available": 3,
  "isFull": false,
  "utilization": 0.25,
  "timeout": 300000,
  "timestamp": "2026-01-26T12:00:00.000Z"
}
```

**Campos importantes:**
- `isFull`: `true` si la cola no puede aceptar más trabajos
- `available`: Número de slots disponibles
- `utilization`: Porcentaje de uso de la cola (0.0 a 1.0)
- `queueSize`: Número de trabajos esperando en cola

**Uso recomendado para n8n:**
Antes de hacer una petición a `/render`, verifica el estado de la cola:
```javascript
const status = await fetch('http://localhost:8020/queue/status').then(r => r.json());
if (status.isFull) {
  // Esperar antes de intentar de nuevo
  await new Promise(resolve => setTimeout(resolve, 60 * 1000));
}
```

### Diagnóstico: `GET /diagnostics`

Endpoint de diagnóstico completo del sistema para ayudar a identificar problemas.

```bash
curl http://localhost:8020/diagnostics
```

Response:
```json
{
  "timestamp": "2026-01-26T12:00:00.000Z",
  "server": {
    "uptime": 3600,
    "nodeVersion": "v22.13.0",
    "platform": "linux",
    "memory": {
      "used": 150,
      "total": 200,
      "external": 10,
      "unit": "MB"
    }
  },
  "queue": {
    "processing": 1,
    "queueSize": 0,
    "maxConcurrent": 2,
    "isFull": false
  },
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3000",
    "MAX_CONCURRENT_RENDERS": "2",
    "RENDER_TIMEOUT": "300000",
    "REMOTION_BROWSER_EXECUTABLE": "/usr/bin/chromium",
    "CHROME_BIN": "/usr/bin/chromium"
  }
}
```

Útil para diagnosticar errores 500 y verificar la configuración del sistema.

## 🛠️ Tech Stack

### Backend
- **Express** 4.18.2 - Framework web
- **TypeScript** 5.3.3 - Tipado estático
- **Node.js** - Entorno de ejecución

### Renderizado
- **Remotion** 4.0.409 - Framework para crear videos con React
- **@remotion/bundler** 4.0.409 - Compilación de composiciones
- **@remotion/renderer** 4.0.409 - Renderizado programático
- **React** 18.2.0 - Biblioteca de UI

### Utilidades
- **p-queue** 8.0.1 - Gestión de cola con límites de concurrencia
- **winston** 3.11.0 - Sistema de logging
- **uuid** 9.0.1 - Generación de IDs únicos

## 📁 Estructura del Proyecto

```
testing/
├── src/                    # Código Remotion (componentes React)
│   ├── components/        # Componentes de vídeo
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utilidades Remotion
├── server/                # Servidor API
│   ├── routes/           # Endpoints
│   ├── services/         # Lógica de negocio
│   │   ├── parser.ts     # Parser de texto meteorológico
│   │   ├── renderer.ts   # Wrapper Remotion
│   │   └── queue.ts      # Cola de renders
│   ├── utils/            # Utilidades
│   │   ├── validation.ts # Validación de entrada
│   │   ├── fileManager.ts # Gestión de archivos
│   │   └── logger.ts     # Logging
│   └── types/            # Tipos TypeScript
├── docs/                  # Documentación spec-driven
├── temp/                  # Archivos temporales (gitignored)
├── out/                   # Vídeos renderizados
└── package.json
```

## 📚 Documentación

Para documentación detallada, ver:
- [Documentación principal](./docs/index.md)
- [Especificación de la API](./docs/features/ApiRenderizadoVideosMeteorologicos.md)
- [Arquitectura](./docs/architecture/index.md)
- [Referencia técnica](./docs/reference/index.md)
- [Troubleshooting](./docs/troubleshooting/index.md)

## 🗺️ Roadmap

- [x] Parser determinista de texto meteorológico
- [x] API HTTP con Express
- [x] Sistema de cola de renders
- [x] Gestión de archivos temporales
- [ ] Soporte para múltiples idiomas en el parser
- [ ] Métricas y monitoreo avanzado

Next: La api no esta funcionando como debe el video se crea siguiendo este archivo @src/utils/constants.ts:180-203 


## 👥 Authors

**Enrique Rodriguez Vela** - *Full-stack Development* 
- GitHub: [@enriquetecfan11](https://github.com/enriquetecfan11)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/enriquetecfan11">Enrique Rodriguez Vela</a>
</div>
