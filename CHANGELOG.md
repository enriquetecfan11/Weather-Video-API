# CHANGELOG

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Cambiado
- **Eliminación del outro como concepto separado**
  - El bloque 4 ahora hace fade out directamente al final del video
  - Constante `OUTRO_DURATION` renombrada a `FADE_OUT_DURATION` (1.5s)
  - Eliminada la capa visual del outro (div oscuro superpuesto)
  - Duración total del video reducida de 21.7s a 17s
  - El bloque 4 se extiende dinámicamente hasta el inicio del fade out
  - Estructura más simple: contenido → fade out → fin

### Añadido
- **Migración a Chrome Headless Shell de Remotion**
  - Cambio de Chromium del sistema a Chrome Headless Shell (descargado automáticamente por Remotion)
  - Mejor compatibilidad y rendimiento en contenedores Docker
  - No requiere configuración manual de Chrome/Chromium
- **Script entrypoint para gestión de permisos en Docker**
  - `entrypoint.sh` ajusta automáticamente permisos de directorios montados (`temp/`, `out/`)
  - Resuelve problemas de permisos con volúmenes Docker
  - Uso de `gosu` para cambio seguro de usuario

### Cambiado
- **Migración de Alpine Linux a Debian (node:22-bookworm-slim)**
  - Alpine no es compatible con Chrome Headless Shell de Remotion
  - Debian proporciona mejor compatibilidad con dependencias de Chrome
  - Imagen base más grande pero completamente funcional
- **Configuración de renderizado actualizada para Remotion v4**
  - Cambio de `quality` a `jpegQuality` (API actualizada en Remotion v4.0.0)
  - Uso de `chromeMode: "headless-shell"` en lugar de `browserExecutable`
  - Flags adicionales de Chrome para evitar problemas con X11 y D-Bus
  - Configuración de FPS y resolución ahora se aplica a través de la composición
- **Dockerfile optimizado para Chrome Headless Shell**
  - Pre-descarga de Chrome Headless Shell durante el build
  - Instalación de dependencias necesarias para Chrome (libnss3, libgbm-dev, etc.)
  - Eliminadas variables de entorno que forzaban Chromium del sistema
  - Entrypoint script para gestión automática de permisos

### Corregido
- **Error "Old Headless mode has been removed"**
  - Actualizado a nuevo modo headless de Chrome (`--headless=new`)
  - Configuración correcta de flags de Chrome para contenedores Docker
- **Error "Missing X server or $DISPLAY"**
  - Uso de Chrome Headless Shell que no requiere X11
  - Flags adicionales para evitar inicialización de X11
- **Error "Permission denied" al escribir archivos en volúmenes Docker**
  - Entrypoint script ajusta permisos automáticamente al iniciar
  - Directorios `temp/` y `out/` ahora tienen permisos correctos

### Añadido
- **Endpoint `/test` para verificación completa del sistema**
  - Verificación de estado del servidor (uptime, memoria, Node.js version)
  - Verificación de accesibilidad de directorios (temp/, out/)
  - Verificación de dependencias de Remotion
  - Verificación de Chrome/Chromium para renderizado
  - Verificación de variables de entorno críticas
  - Verificación del sistema de cola
  - Verificación del parser con texto de prueba
  - Respuesta detallada con estado de cada componente y resumen general
- **Configuración Docker completa**
  - Dockerfile multi-stage optimizado con Node.js 18 y Chromium
  - docker-compose.yml para desarrollo
  - docker-compose.prod.yml para producción con límites de recursos
  - .dockerignore para optimizar builds
  - Documentación de deployment Docker en README
- **Integración de Groq para parser mejorado**
  - Parser principal usando Groq API con modelo qwen/qwen3-32b
  - Parser determinista mantenido como fallback automático
  - Mayor precisión en extracción de información meteorológica
  - Validación y normalización de respuestas de Groq
  - Logging mejorado para tracking de Groq vs fallback
  - Variable de entorno `GROQ_API_KEY` para configuración
  - Archivo `.env.example` con todas las variables de entorno

### Mejorado
- Parser de texto meteorológico ahora es async
- Mejor manejo de rangos de temperatura (promedio correcto)
- Mejor extracción de condición meteorológica (no confunde "muy nublado" con "lluvia")
- Mejor extracción de información de viento
- **Duración del Bloque 4 (descripción completa) aumentada de 3 a 6 segundos** para mejorar la legibilidad

### Documentación
- Actualizada documentación completa en `docs/`
- Especificación de feature marcada como implementada
- Documentación de referencia actualizada con ejemplos
- Guías de setup y troubleshooting mejoradas
- Documentación de arquitectura detallada
- Guías de optimización y seguridad actualizadas

### Añadido
- Estructura spec-driven design del proyecto
- Documentación inicial de arquitectura
- Especificación de feature: API de Renderizado de Vídeos Meteorológicos
- AGENTS.md con convenciones del repositorio
- Estructura completa de documentación en `docs/`
- .gitignore para archivos temporales y dependencias
- **API HTTP completa con Express**
  - Endpoint `POST /render` para renderizar vídeos desde texto
  - Soporte para stream y URL como formato de salida
  - Validación completa de entrada
- **Parser determinista de texto meteorológico**
  - Extracción de ciudad/país, condición, temperaturas, viento, precipitación
  - Uso de regex y diccionarios (sin IA)
  - Tolerancia a variaciones de redacción
- **Sistema de cola de renders**
  - Gestión de renders concurrentes con límites configurables
  - Tracking de estado de jobs
  - Timeouts configurables
- **Servicios de renderizado**
  - Integración con @remotion/bundler y @remotion/renderer
  - Renderizado programático de vídeos MP4
  - Configuración de FPS, resolución y calidad
- **Utilidades**
  - Sistema de logging con winston
  - Gestión de archivos temporales con limpieza automática
  - Validación de requests
- **Documentación**
  - README actualizado con ejemplos de uso
  - Ejemplos curl y JavaScript
  - Documentación completa de la API

## [0.1.0] - 2026-01-23

### Añadido
- Proyecto inicial Remotion para generación de vídeos meteorológicos
- Componente WeatherForecast con animaciones
- Sistema de layout adaptativo
- Internacionalización (i18n) para múltiples idiomas
- Componentes: Cloud, TemperatureDisplay, WeatherIcon, PhenomenonCard
- Constantes de diseño y timing configuradas
- README.md inicial
