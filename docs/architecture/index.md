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

## Sistema de Animaciones y Componentes Remotion

El sistema de renderizado utiliza una arquitectura de componentes React modular para crear vídeos con animaciones fluidas y efectos visuales profesionales.

### Arquitectura de Capas Visuales

```
WeatherForecast (Composición Principal)
├── AnimatedBackground (Capa 0: Fondo gradiente)
├── Capas de Gradientes Radiales (Capa 0: Efectos de profundidad)
├── AnimatedParticles (Capa 1: Partículas estilo fuegos artificiales)
│   └── Explosion → Trail → Shrinking → Move → AnimatedDot
├── Nubes Animadas (Capa 1: Efectos atmosféricos)
└── Contenido Principal (Capa 10: Información meteorológica)
    ├── Bloque 1: Temperatura + Ciudad (0-4s)
    ├── Bloque 2: Condición, Sensación, Viento (3.5-9s)
    ├── Bloque 3: Fenómenos (9-13s)
    └── Bloque 4: Descripción completa (12-18s)
```

### Componentes de Animación

El sistema incluye componentes reutilizables de animación ubicados en `src/components/animations/`:

- **FadeIn**: Fade in con física spring configurable
- **ScaleIn**: Animación de escala con fade opcional
- **SlideIn**: Deslizamiento en 4 direcciones (up, down, left, right)
- **WordReveal**: Revelado palabra por palabra con movimiento sutil

**Configuraciones Spring**:
- `DRAMATIC`: Para entradas impactantes (temperatura principal)
- `SMOOTH`: Para transiciones suaves (tarjetas, contenido secundario)
- `SUBTLE`: Para efectos sutiles (texto secundario, detalles)

### Sistema de Partículas

Efectos visuales de fondo que crean ambiente dinámico:

1. **AnimatedParticles**: Orquesta el sistema completo
2. **Explosion**: Multiplica partículas en 10 direcciones radiales
3. **Trail**: Crea estelas múltiples con delays escalonados
4. **Shrinking**: Reduce escala con el tiempo
5. **Move**: Aplica movimiento vertical con spring physics
6. **AnimatedDot**: Punto visual base

**Características**:
- Opacidad reducida (0.6) para no interferir con contenido
- `pointerEvents: none` para no bloquear interacciones
- Z-index: 1 (sobre fondo, debajo de contenido)

### Estructura Narrativa Temporal

La composición `WeatherForecast` sigue una estructura narrativa en 4 bloques:

1. **Bloque 1 (0-4s)**: Impacto inicial
   - Temperatura con animación DRAMATIC
   - Ciudad con slide up y fade
   - Fade out al final del bloque

2. **Bloque 2 (3.5-9s)**: Contexto humano
   - Tarjetas con información (condición, sensación, viento)
   - Animaciones escalonadas (stagger de 0.15s)
   - Scale + Slide combinados

3. **Bloque 3 (9-13s)**: Fenómenos (condicional)
   - Tarjeta de precipitaciones si existe
   - Scale + Slide con fade

4. **Bloque 4 (12-18s)**: Descripción completa (condicional)
   - Texto completo centrado
   - WordReveal palabra por palabra
   - Fade in suave

5. **Outro (18-22s)**: Fade out final
   - Transición suave a negro

### Layout Adaptativo

El sistema incluye un hook `useAdaptiveLayout` que ajusta dinámicamente:

- Tamaños de fuente según longitud del contenido
- Espaciado y padding
- Posicionamiento vertical (offset top)
- Truncamiento inteligente de texto largo

**Implementado en**: `src/hooks/useAdaptiveLayout.ts`

### Utilidades de Animación

**Funciones de Easing** (`src/utils/animations.ts`):
- `clamp`: Extrapolación que mantiene valores en rango
- `easeOutCubic`: Easing cúbico de salida
- `easeInOutCubic`: Easing cúbico de entrada/salida
- `easeOutExpo`: Easing exponencial de salida

**Constantes de Timing** (`src/utils/constants.ts`):
- `SPRING_CONFIGS`: Configuraciones predefinidas de spring
- `TIMING`: Estructura temporal de bloques narrativos
- `MOBILE_DESIGN`: Constantes de diseño para formato vertical (1080x1920)

### Integración con Remotion

- **Composición**: `WeatherForecast` definida en `src/Root.tsx`
- **Props**: Compatible con `WeatherForecastProps` (datos parseados del texto)
- **Renderizado**: Programático vía `@remotion/renderer`
- **Resolución**: Configurable (default: 1080x1920 para móvil vertical)
- **FPS**: Configurable (default: 30)

Ver [Componentes](../components/) para documentación detallada de cada componente.

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
