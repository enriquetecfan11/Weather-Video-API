# Documentación del Proyecto

Bienvenido a la documentación del proyecto de generación de vídeos meteorológicos con Remotion.

## Índice

- [Arquitectura](./architecture/) - Documentación arquitectónica del sistema
- [Features](./features/) - Especificaciones de features implementadas
- [Componentes](./components/) - Documentación de componentes Remotion y animaciones
- [Setup](./setup/) - Guías de instalación y configuración
- [Referencia](./reference/) - Referencias técnicas y APIs
- [Troubleshooting](./troubleshooting/) - Solución de problemas comunes
- [Optimización](./optimization/) - Notas de rendimiento
- [Auditoría](./audit/) - Seguridad y auditoría

## Descripción del Proyecto

Este proyecto transforma un sistema de generación de vídeos meteorológicos con Remotion en una API HTTP de producción que:

- Parsea texto meteorológico en español de forma determinista
- Renderiza vídeos MP4 automáticamente usando composiciones Remotion
- Gestiona múltiples renders concurrentes con sistema de cola
- Proporciona endpoints RESTful para integración

## Stack Tecnológico

- **Frontend/Render**: Remotion 4.0.409, React 18.2.0
- **Backend**: Node.js, Express
- **Lenguaje**: TypeScript 5.3.3
- **Herramientas**: @remotion/bundler, @remotion/renderer

## Estado del Proyecto

- ✅ Composición Remotion funcional
- ✅ API HTTP implementada y operativa
- ✅ Parser de texto meteorológico implementado
- ✅ Sistema de cola de renders implementado
- ✅ Gestión de archivos y logging implementados
- ✅ Documentación completa

## Quick Start

1. **Instalación**:
   ```bash
   npm install
   ```

2. **Iniciar servidor**:
   ```bash
   npm run dev    # Desarrollo
   # o
   npm run server # Producción
   ```

3. **Probar API**:
   ```bash
   curl -X POST http://localhost:3000/render \
     -H "Content-Type: application/json" \
     -d '{"text": "Madrid: soleado, 25°C"}' \
     --output video.mp4
   ```

Ver [Setup](./setup/) para instrucciones detalladas de instalación y configuración.

## Contribuir

Seguir las convenciones definidas en [AGENTS.md](../AGENTS.md) y el flujo spec-driven design.
