# AGENTS.md - Convenciones del Repositorio

Este documento define las convenciones, flujos de trabajo y estándares para el desarrollo en este repositorio.

## Estructura del Proyecto

```
testing/
├── src/                    # Código fuente Remotion (componentes React)
├── server/                 # Servidor API Node.js/Express
├── docs/                   # Documentación spec-driven
│   ├── features/          # Especificaciones de features
│   ├── architecture/      # Documentación arquitectónica
│   ├── setup/            # Configuración y setup
│   └── ...
├── scripts/              # Scripts de automatización
├── temp/                 # Archivos temporales (gitignored)
└── out/                  # Vídeos renderizados
```

## Convenciones de Código

### TypeScript
- **Tipado estricto**: Habilitado en `tsconfig.json`
- **Nombres de archivos**: PascalCase para componentes, camelCase para utilidades
- **Exportaciones**: Named exports preferidos sobre default exports

### Estructura de Carpetas
- `src/components/`: Componentes React de Remotion
- `src/utils/`: Utilidades y constantes
- `src/hooks/`: Custom hooks de React
- `server/routes/`: Endpoints de la API
- `server/services/`: Lógica de negocio
- `server/utils/`: Utilidades del servidor
- `server/types/`: Tipos TypeScript compartidos

### Naming Conventions
- **Componentes**: PascalCase (`WeatherForecast.tsx`)
- **Utilidades**: camelCase (`parser.ts`, `fileManager.ts`)
- **Tipos/Interfaces**: PascalCase (`WeatherForecastProps`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_WEATHER_FORECAST_PROPS`)

## Flujo de Trabajo Spec-Driven

1. **Especificación**: Crear feature spec en `docs/features/` con las 4 secciones requeridas
2. **Validación**: Ejecutar `/validate` antes de implementar
3. **Implementación**: Seguir la especificación como guía
4. **Documentación**: Actualizar CHANGELOG.md después de cada feature

## Git Workflow

- **Commits**: Mensajes descriptivos en español
- **Branches**: `feature/nombre-feature`, `fix/nombre-fix`
- **PRs**: Incluir referencia a la feature spec correspondiente

## Testing

- Tests unitarios para parser (determinista)
- Tests de integración para endpoints API
- Validación manual de renders Remotion

## Dependencias

- **Producción**: Express, Remotion, p-queue, winston
- **Desarrollo**: TypeScript, tipos de Express
- **No incluir**: Dependencias innecesarias, librerías pesadas

## Logging

- Usar sistema de logging centralizado (`server/utils/logger.ts`)
- Niveles: info, warn, error
- Incluir contexto relevante (request ID, timestamps)

## Manejo de Errores

- Errores de validación: 400
- Errores de cola llena: 429
- Errores de renderizado: 500
- Errores temporales: 503
- Siempre incluir mensajes descriptivos en español

## Performance

- Límite de renders concurrentes: Configurable (default: 2)
- Timeout por render: 5 minutos
- Limpieza automática de archivos temporales: >1 hora
- Monitoreo de uso de recursos

## Seguridad

- Validación estricta de entrada
- Límites de tamaño de texto (máx 1000 caracteres)
- Sanitización de rutas de archivos
- No exponer rutas internas del sistema
