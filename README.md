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

El servidor se iniciará en `http://localhost:3000` por defecto.

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
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hoy en Madrid: soleado, 25°C, viento suave"
  }' \
  --output weather-video.mp4
```

**Con curl (URL):**
```bash
curl -X POST http://localhost:3000/render \
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
const response = await fetch('http://localhost:3000/render', {
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
- `429 Too Many Requests`: Cola llena (demasiados renders concurrentes)
- `500 Internal Server Error`: Error en el renderizado
- `503 Service Unavailable`: Servicio temporalmente no disponible (timeout, etc.)

### Health Check: `GET /health`

Verifica el estado del servidor.

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
