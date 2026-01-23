# Arquitectura del Sistema

## Visión General

El sistema transforma texto meteorológico en español en vídeos MP4 usando Remotion, a través de una API HTTP robusta y escalable.

## Arquitectura de Alto Nivel

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /render
       │ { text, options? }
       ▼
┌─────────────────────────────────────┐
│         API Express Server          │
│  ┌───────────────────────────────┐  │
│  │  Validación de entrada        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Parser Texto → JSON          │  │
│  │  (determinista, regex)        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Cola de Renders              │  │
│  │  (límites concurrentes)       │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Remotion Renderer            │  │
│  │  (programático)               │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Gestión de Archivos          │  │
│  │  (temp, limpieza)             │  │
│  └───────────┬───────────────────┘  │
└──────────────┼───────────────────────┘
               ▼
        MP4 (stream/URL)
```

## Componentes Principales

### 1. API Express Server (`server/index.ts`)

Servidor HTTP que:
- Recibe requests en `POST /render`
- Proporciona health check en `GET /health`
- Maneja middleware de logging y errores
- Coordina el flujo completo de renderizado

**Características**:
- Express 4.18.2
- Middleware de validación JSON
- Manejo centralizado de errores
- Logging de todas las requests

### 2. Parser de Texto (`server/services/parser.ts`)

Servicio determinista que extrae información meteorológica usando:
- **Regex patterns** para ubicación, temperaturas, viento
- **Diccionarios normalizados** para condiciones e intensidades
- **Normalización de texto** (minúsculas, sin acentos)

**Extrae**:
- Ciudad y país
- Condición meteorológica
- Temperaturas (simple o rango) y unidades
- Viento (intensidad, velocidad, dirección)
- Precipitación (tipo, intensidad, probabilidad)

**Sin dependencias externas** - 100% determinista

### 3. Cola de Renders (`server/services/queue.ts`)

Sistema de gestión de renders concurrentes usando `p-queue`:
- **Límite de concurrencia** configurable (default: 2)
- **Cola FIFO** para requests pendientes
- **Tracking de estado** de cada job (pending, processing, completed, failed)
- **Timeouts** configurables (default: 5 minutos)
- **Limpieza automática** de jobs antiguos

### 4. Remotion Renderer (`server/services/renderer.ts`)

Wrapper que ejecuta el renderizado programático:
- **Compilación** con `@remotion/bundler`
- **Selección de composición** `WeatherForecast`
- **Renderizado** con `@remotion/renderer`
- **Configuración** de FPS, resolución, calidad
- **Progreso** trackeable durante renderizado

### 5. Gestión de Archivos (`server/utils/fileManager.ts`)

Sistema de archivos temporales:
- **Generación de rutas únicas** con UUID
- **Limpieza automática** de archivos >1 hora
- **Limpieza después de stream**
- **Verificación de directorio** temporal

### 6. Utilidades

- **Validación** (`server/utils/validation.ts`): Validación completa de requests
- **Logging** (`server/utils/logger.ts`): Sistema de logging con winston
- **Tipos** (`server/types/api.ts`): Tipos TypeScript compartidos

## Flujo de Datos Detallado

1. **Request recibido**: Cliente envía `POST /render` con texto
2. **Validación**: Se valida formato y límites del texto
3. **Parsing**: Texto se parsea a estructura `ParsedWeatherData`
4. **Job creado**: Se crea un job en la cola con estado "pending"
5. **Encolado**: Job se añade a la cola (p-queue)
6. **Procesamiento**: Cuando hay slot disponible:
   - Estado cambia a "processing"
   - Se compila bundle de Remotion
   - Se renderiza el vídeo
   - Archivo se guarda en `temp/`
7. **Respuesta**: 
   - Si `outputFormat === "stream"`: Se sirve el stream y se elimina archivo
   - Si `outputFormat === "url"`: Se retorna URL y se programa limpieza
8. **Limpieza**: Archivos antiguos se eliminan automáticamente

## Tecnologías

### Backend
- **Node.js**: Entorno de ejecución
- **Express** 4.18.2: Framework web
- **TypeScript** 5.3.3: Tipado estático

### Renderizado
- **Remotion** 4.0.409: Framework de vídeo
- **@remotion/bundler**: Compilación de composiciones
- **@remotion/renderer**: Renderizado programático
- **React** 18.2.0: Biblioteca de UI

### Utilidades
- **p-queue** 8.0.1: Gestión de cola con concurrencia
- **winston** 3.11.0: Sistema de logging
- **uuid** 9.0.1: Generación de IDs únicos

## Escalabilidad

### Límites Configurables
- **Renders concurrentes**: `MAX_CONCURRENT_RENDERS` (default: 2)
- **Timeout por render**: `RENDER_TIMEOUT` (default: 5 minutos)
- **Límite de texto**: 10-1000 caracteres

### Gestión de Recursos
- **Cola FIFO**: Maneja picos de tráfico ordenadamente
- **Limpieza automática**: Archivos y jobs antiguos se eliminan automáticamente
- **Tracking de estado**: Permite monitoreo y debugging

### Consideraciones de Producción
- Aumentar `MAX_CONCURRENT_RENDERS` según recursos del servidor
- Monitorear uso de CPU y memoria durante renders
- Considerar almacenamiento en disco para archivos temporales
- Implementar rate limiting por IP (futuro)
- Considerar caché de renders similares (futuro)

## Seguridad

- **Validación estricta** de entrada
- **Sanitización** de rutas de archivos
- **Límites de tamaño** de texto
- **Manejo seguro** de archivos temporales
- **Logging** de todas las operaciones

## Monitoreo

- **Logs estructurados** con winston
- **Health check endpoint** para verificar estado
- **Tracking de jobs** para debugging
- **Métricas de tiempo** de procesamiento
