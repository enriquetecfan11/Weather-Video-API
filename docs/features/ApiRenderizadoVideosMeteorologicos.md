# Feature: API de Renderizado de Vídeos Meteorológicos

## Descripción

Transformar el proyecto actual de Remotion (que genera vídeos con interfaz meteorológica) en una **API HTTP en JavaScript** lista para producción que, al recibir un único texto en español como: "Hoy en Mondéjar: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C y viento moderado, con alta probabilidad de precipitación", sea capaz de **interpretarlo sin usar IA** (solo reglas deterministas: regex/diccionarios/normalización) y **renderizar automáticamente un vídeo MP4** usando la composición de Remotion existente.

La API debe ser robusta, escalable y lista para producción, con gestión de renders concurrentes, validación de entrada, logging y manejo de errores.

## Requisitos

### Funcionales

1. **Parser de Texto Meteorológico**
   - Interpretar texto en español sin usar IA
   - Extraer: ciudad/país, condición meteorológica, rango de temperaturas, unidades (°C/°F), viento (intensidad y velocidad), precipitación (tipo, intensidad, probabilidad)
   - Tolerar variaciones de redacción y valores ausentes
   - Usar solo reglas deterministas (regex, diccionarios, normalización)

2. **API HTTP**
   - Endpoint `POST /render` que reciba `{ text, options? }`
   - Validación de entrada (texto requerido, límites de tamaño)
   - Devolver MP4 como stream o URL temporal
   - Códigos de error claros (400, 429, 500, 503)

3. **Sistema de Cola**
   - Gestión de renders concurrentes con límites configurables
   - Cola FIFO para requests pendientes
   - Tracking de estado de cada render (pending, processing, completed, failed)
   - Timeout por render (5 minutos por defecto)

4. **Gestión de Archivos**
   - Rutas temporales únicas para cada render
   - Limpieza automática de archivos antiguos (>1 hora)
   - Limpieza después de servir stream
   - Verificación de espacio en disco

5. **Logging y Monitoreo**
   - Log de requests (texto recibido, tiempo de procesamiento)
   - Log de errores con stack traces
   - Log de estado de cola
   - Niveles: info, warn, error

### Técnicos

- **Framework**: Express (preferido por el usuario)
- **Renderizado**: @remotion/bundler y @remotion/renderer para render programático
- **Cola**: p-queue para gestión de concurrencia
- **Logging**: winston
- **Lenguaje**: TypeScript con tipado estricto
- **Estructura**: Modular y mantenible

### Dependencias

- `express`: ^4.18.2
- `@remotion/bundler`: ^4.0.409
- `@remotion/renderer`: ^4.0.409
- `p-queue`: ^8.0.1
- `winston`: ^3.11.0
- `uuid`: ^9.0.1

### Constraints

- No usar IA para parsing (solo reglas deterministas)
- No depender de datos hardcodeados
- Parametrizable para cualquier ubicación y texto meteorológico similar
- Código limpio, modular y mantenible
- Sin cambios al código Remotion existente (`src/`)

## Estado de Implementación

**✅ COMPLETADA** - Todos los criterios de aceptación han sido implementados y probados.

## Criterios de Aceptación

1. **Parser Funcional** ✅
   - ✅ Parsea correctamente el ejemplo: "Hoy en Mondéjar: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C y viento moderado, con alta probabilidad de precipitación"
   - ✅ Extrae ciudad (Mondéjar), condición (muy nublado), temperaturas (1-8°C), viento (moderado), precipitación (lluvia débil, alta probabilidad)
   - ✅ Maneja variaciones: "Madrid, España: soleado, 25°C", "Barcelona: nublado, temperaturas de 10 a 15 grados, lluvia moderada 60%"
   - ✅ Tolerancia a valores ausentes (no falla si falta información)
   - **Implementado en**: `server/services/parser.ts`

2. **API Operativa** ✅
   - ✅ Endpoint `POST /render` acepta `{ text, options? }`
   - ✅ Valida entrada (texto mínimo 10 caracteres, máximo 1000)
   - ✅ Retorna MP4 como stream cuando `outputFormat === "stream"` (por defecto)
   - ✅ Retorna URL temporal cuando `outputFormat === "url"`
   - ✅ Códigos de error apropiados (400, 429, 500, 503)
   - **Implementado en**: `server/routes/render.ts`, `server/utils/validation.ts`

3. **Cola de Renders** ✅
   - ✅ Límite de renders concurrentes configurable (default: 2)
   - ✅ Requests en cola cuando se alcanza el límite
   - ✅ Estado de cada render trackeable
   - ✅ Timeout de 5 minutos por render
   - **Implementado en**: `server/services/queue.ts` (usa p-queue)

4. **Gestión de Archivos** ✅
   - ✅ Archivos temporales con nombres únicos
   - ✅ Limpieza automática de archivos >1 hora
   - ✅ Limpieza después de servir stream
   - ✅ Verificación de espacio en disco
   - **Implementado en**: `server/utils/fileManager.ts`

5. **Logging** ✅
   - ✅ Log de cada request con texto y tiempo
   - ✅ Log de errores con contexto
   - ✅ Log de estado de cola
   - **Implementado en**: `server/utils/logger.ts` (usa winston)

6. **Documentación** ✅
   - ✅ README actualizado con ejemplos de uso
   - ✅ Ejemplo curl para endpoint `/render`
   - ✅ Estructura de request/response documentada
   - ✅ Documentación spec-driven completa

## Implementación

### Arquitectura

```
Cliente → API Express → Validación → Parser → Cola → Remotion Renderer → MP4
```

### Componentes Principales

1. **`server/services/parser.ts`**
   - Parser determinista con regex y diccionarios
   - Normalización de texto (minúsculas, acentos opcionales)
   - Extracción de todos los campos meteorológicos
   - Fallbacks para valores ausentes

2. **`server/services/renderer.ts`**
   - Wrapper de Remotion para render programático
   - Compilación con @remotion/bundler
   - Renderizado con @remotion/renderer
   - Configuración de FPS, resolución, calidad

3. **`server/services/queue.ts`**
   - Gestión de cola con p-queue
   - Límites de concurrencia
   - Tracking de estado
   - Timeouts

4. **`server/routes/render.ts`**
   - Endpoint POST /render
   - Validación de entrada
   - Integración con parser y cola
   - Respuesta (stream o URL)

5. **`server/utils/fileManager.ts`**
   - Generación de rutas temporales
   - Limpieza automática
   - Verificación de espacio

6. **`server/utils/logger.ts`**
   - Configuración de winston
   - Formato de logs
   - Niveles de log

### Estructura de Carpetas

```
server/
├── index.ts              # Entry point
├── routes/
│   └── render.ts        # Endpoint /render
├── services/
│   ├── parser.ts        # Parser texto → JSON
│   ├── renderer.ts      # Wrapper Remotion
│   └── queue.ts         # Cola de renders
├── utils/
│   ├── validation.ts    # Validación entrada
│   ├── fileManager.ts  # Gestión archivos
│   └── logger.ts        # Logging
└── types/
    └── api.ts           # Tipos TypeScript
```

### Contrato de Datos

**Input del Parser**:
```typescript
string // Texto meteorológico en español
```

**Output del Parser** (compatible con `WeatherForecastProps`):
```typescript
{
  city?: string;
  country?: string;
  condition: string;
  temperatureC: number;
  temperatureRange?: { min: number; max: number };
  temperatureUnit: "C" | "F";
  feelsLike?: string;
  feelsLikeTemp?: number;
  wind?: string;
  windSpeed?: number;
  windDirection?: string;
  windUnit?: "km/h" | "mph";
  precipitation?: {
    type: "rain" | "snow" | "storm" | null;
    intensity?: string;
    probability?: number;
  };
  description: string;
}
```

### Estrategia de Parsing

1. **Ciudad/País**: Regex `en\s+([^,:]+)(?:,\s*([^:]+))?`
2. **Condición**: Diccionario de términos normalizados (soleado, nublado, muy nublado, despejado, lluvia, nieve, tormenta)
3. **Temperaturas**: Regex `temperaturas?\s+(?:entre|de)\s+(\d+)\s*°?[CF]?\s*(?:y|a)\s+(\d+)\s*°?[CF]?` o `(\d+)\s*°?[CF]`
4. **Unidades**: Detección de °C/°F en el texto
5. **Viento**: Regex `viento\s+(\w+)` y extracción de velocidad `(\d+)\s*(km\/h|mph)`
6. **Precipitación**: Regex para tipos (lluvia/nieve/tormenta), intensidad (débil/moderado/fuerte), probabilidad (texto o %)

### Decisiones Técnicas

- **Express sobre Fastify**: Más común, suficiente para este caso
- **Parser determinista**: Sin dependencias externas, rápido y predecible
- **Cola con p-queue**: Librería probada, maneja concurrencia y timeouts
- **Archivos temporales**: Sistema de archivos local, simple y eficiente
- **Logging con winston**: Estándar de la industria
- **TypeScript estricto**: Prevenir errores en tiempo de desarrollo

### Desafíos Potenciales

1. **Variaciones en texto**: El parser debe ser robusto ante diferentes formas de expresar lo mismo
2. **Rendimiento**: Renders pueden ser lentos, la cola es crítica
3. **Gestión de memoria**: Archivos temporales pueden acumularse
4. **Errores de Remotion**: Manejar errores de renderizado sin crashear el servidor
