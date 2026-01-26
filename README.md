# Weather Video API

<div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/version-0.1.0-green.svg" alt="Version">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs">
</div>

> API HTTP de producción que parsea texto meteorológico en español y renderiza vídeos MP4 automáticamente usando Remotion. Sistema robusto con gestión de cola, validación de entrada y logging completo.

## 📋 Table of Contents

- [Features](#-features)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Tech Stack](#-tech-stack)
- [Documentación](#-documentación)
- [Roadmap](#-roadmap)
- [Authors](#-authors)

## ✨ Features

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

### Requisitos Previos
- Node.js >= 18.0.0
- npm >= 9.0.0
- Espacio en disco suficiente para archivos temporales (recomendado: >1GB)

### Instalación Local
1. Instalar dependencias con `npm install`
2. Configurar variables de entorno (opcional) - ver `.env.example`
3. Iniciar servidor de desarrollo con `npm run dev` o producción con `npm run server`

El servidor se iniciará en `http://localhost:3000` por defecto.

### Deployment con Docker

**Nota**: El proyecto usa **Debian (node:22-bookworm-slim)** como imagen base. Chrome Headless Shell se descarga automáticamente durante el build - no requiere configuración manual.

**Opción rápida (script automatizado)**:
```bash
./rebuild-docker.sh
```

**Opción manual**:
1. Crear archivo `.env` desde `.env.example`
2. Ejecutar `docker-compose up -d --build`
3. El servicio estará disponible en el puerto **8020**

**Opciones del script de regeneración**:
- `./rebuild-docker.sh -f` - Reconstrucción sin caché
- `./rebuild-docker.sh -c` - Limpiar volúmenes y archivos temporales
- `./rebuild-docker.sh -l -t` - Reconstruir, mostrar logs y verificar servicio
- `./rebuild-docker.sh -h` - Ver todas las opciones

**Notas importantes**:
- El entrypoint ajusta automáticamente permisos de directorios montados (`temp/`, `out/`)
- Chrome Headless Shell se descarga automáticamente (~109 MB) durante el build
- El primer build puede tardar más tiempo debido a la descarga de dependencias

Para más detalles, consulta la [guía de instalación](./docs/setup/).

## 📡 Uso

### Endpoint Principal
**POST /render** - Renderiza un vídeo meteorológico desde texto en español.

El endpoint acepta texto meteorológico en español (10-1000 caracteres) y opciones de renderizado configurables (calidad, FPS, resolución, formato de salida).

### Endpoints Adicionales
- **GET /health** - Verifica el estado básico del servidor
- **GET /test** - Verifica el estado completo del sistema
- **GET /queue/status** - Consulta el estado de la cola de renders
- **GET /diagnostics** - Diagnóstico completo del sistema

### Formatos de Respuesta
- **Stream** (por defecto): El vídeo se envía directamente como stream MP4
- **URL**: Retorna una URL temporal para descargar el vídeo posteriormente

Para ejemplos completos de uso con curl, JavaScript y automatización, consulta la [guía de workflow con curl](./docs/guides/workflow-curl.md).

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

## 📚 Documentación

Documentación completa disponible en la carpeta `docs/`:

- [Documentación principal](./docs/index.md) - Índice completo de documentación
- [Guía de instalación](./docs/setup/) - Instalación y configuración detallada
- [Workflow con curl](./docs/guides/workflow-curl.md) - Guía completa para usar la API
- [Arquitectura](./docs/architecture/) - Documentación arquitectónica del sistema
- [Referencia técnica](./docs/reference/) - Referencias de APIs y endpoints
- [Troubleshooting](./docs/troubleshooting/) - Solución de problemas comunes
- [Optimización](./docs/optimization/) - Notas de rendimiento
- [Seguridad](./docs/audit/) - Auditoría y seguridad

## 🗺️ Roadmap

### Completado ✅
- Parser determinista de texto meteorológico
- API HTTP con Express
- Sistema de cola de renders
- Gestión de archivos temporales

### Próximamente
- Soporte para múltiples idiomas en el parser
- Métricas y monitoreo avanzado

## 👥 Authors

**Enrique Rodriguez Vela** - *Full-stack Development* 
- GitHub: [@enriquetecfan11](https://github.com/enriquetecfan11)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/enriquetecfan11">Enrique Rodriguez Vela</a>
</div>
