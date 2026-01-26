# Referencia Técnica

## APIs

### POST /render

Renderiza un vídeo meteorológico desde texto en español.

**Endpoint**: `POST /render`

**Request Body**:
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

**Parámetros**:
- `text` (string, requerido): Texto meteorológico en español (10-1000 caracteres)
- `options` (object, opcional):
  - `outputFormat` (string): `"stream"` (por defecto) o `"url"`
  - `quality` (number): 0-100 (por defecto: 80)
  - `fps` (number): 1-60 (por defecto: 30)
  - `width` (number): 100-7680 (por defecto: 1080)
  - `height` (number): 100-4320 (por defecto: 1920)

**Response (stream - por defecto)**:
- **Status**: `200 OK`
- **Content-Type**: `video/mp4`
- **Headers**:
  - `X-Job-Id`: ID del job de renderizado
  - `X-Processing-Time`: Tiempo de procesamiento en milisegundos
- **Body**: Stream del archivo MP4

**Response (URL)**:
```json
{
  "videoUrl": "/videos/temp-abc123.mp4",
  "expiresAt": "2026-01-23T12:00:00Z",
  "jobId": "render-1234567890-abc123"
}
```

**Códigos de Error**:
- `400 Bad Request`: Error de validación
- `429 Too Many Requests`: Cola llena
- `500 Internal Server Error`: Error en renderizado
- `503 Service Unavailable`: Servicio temporalmente no disponible

**Ejemplo con curl**:
```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{"text": "Hoy en Madrid: soleado, 25°C, viento suave"}' \
  --output video.mp4
```

### GET /health

Verifica el estado básico del servidor.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T12:00:00.000Z",
  "uptime": 3600
}
```

### GET /test

Verifica el estado completo del sistema, incluyendo dependencias, directorios, Chrome/Chromium, cola y parser.

**Response**:
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

**Checks realizados:**
1. **server**: Estado del servidor (uptime, memoria, versión de Node.js)
2. **directories**: Accesibilidad de directorios temp/ y out/
3. **remotion**: Disponibilidad de dependencias de Remotion
4. **chrome**: Verificación de Chrome/Chromium para renderizado
5. **environment**: Variables de entorno críticas
6. **queue**: Estado del sistema de cola
7. **parser**: Funcionalidad del parser con texto de prueba

## Tipos TypeScript

Ver `server/types/api.ts` para definiciones completas de:

- `ParsedWeatherData`: Datos parseados del texto meteorológico
- `RenderRequest`: Request body del endpoint /render
- `RenderUrlResponse`: Response cuando outputFormat es "url"
- `RenderJob`: Información de un job de render
- `RenderStatus`: Estados posibles de un render

## Parser de Texto

El parser (`server/services/parser.ts`) extrae información usando:

- **Regex patterns** para ubicación, temperaturas, viento, precipitación
- **Diccionarios normalizados** para condiciones e intensidades
- **Normalización de texto** (minúsculas, sin acentos)

### Campos Extraídos

- `city`, `country`: Ubicación
- `condition`: Condición meteorológica (Soleado, Nublado, Lluvia, etc.)
- `temperatureC`: Temperatura en Celsius
- `temperatureRange`: Rango de temperaturas (min/max)
- `temperatureUnit`: "C" o "F"
- `wind`: Descripción del viento
- `windSpeed`: Velocidad del viento
- `windDirection`: Dirección del viento
- `windUnit`: "km/h" o "mph"
- `precipitation`: Tipo, intensidad, probabilidad

## Remotion

Documentación oficial: https://www.remotion.dev/docs

**Composición utilizada**: `WeatherForecast` (definida en `src/Root.tsx`)

**Props**: Compatible con `WeatherForecastProps` (ver `src/components/WeatherForecast.tsx`)
