# Índice de Features

Lista de todas las features documentadas en el proyecto.

## Features Implementadas

### [API de Renderizado de Vídeos Meteorológicos](./ApiRenderizadoVideosMeteorologicos.md)
API HTTP que parsea texto meteorológico en español y renderiza vídeos MP4 automáticamente usando Remotion.

**Estado**: ✅ Implementada

**Archivos principales**:
- `server/index.ts` - Servidor Express
- `server/routes/render.ts` - Endpoint POST /render
- `server/services/parser.ts` - Parser determinista
- `server/services/renderer.ts` - Renderizado Remotion
- `server/services/queue.ts` - Cola de renders

## Features Planificadas

_No hay features planificadas actualmente._

---

Para crear una nueva feature, usar el comando `/new-feature <nombre-feature>` o seguir el template en [AGENTS.md](../../AGENTS.md).
