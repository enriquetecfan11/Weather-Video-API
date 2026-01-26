# CHANGELOG

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Añadido
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
- Duración del outro aumentada de 2 a 4 segundos
- Duración total del video ajustada de 17 a 22 segundos

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
