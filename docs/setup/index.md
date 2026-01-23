# Setup y Configuración

## Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Espacio en disco suficiente para archivos temporales (recomendado: >1GB)

## Instalación

```bash
# Clonar o navegar al proyecto
cd testing

# Instalar dependencias
npm install
```

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto (opcional):

```env
# Puerto del servidor
PORT=3000

# Límite de renders concurrentes
MAX_CONCURRENT_RENDERS=2

# Timeout por render en milisegundos (5 minutos)
RENDER_TIMEOUT=300000

# Directorio para archivos temporales
TEMP_DIR=./temp

# Directorio de salida (para renders manuales)
OUT_DIR=./out

# Nivel de logging (info, warn, error, debug)
LOG_LEVEL=info

# API Key de Groq para parser mejorado (opcional, usa fallback determinista si no está)
GROQ_API_KEY=your_groq_api_key_here
```

Si no se crea el archivo `.env`, se usarán los valores por defecto.

**Nota sobre Groq**: Si no se configura `GROQ_API_KEY`, el sistema usará automáticamente el parser determinista como fallback. El parser con Groq ofrece mayor precisión en la extracción de información meteorológica.

## Scripts Disponibles

### Desarrollo

- `npm start`: Inicia Remotion Studio para desarrollo de composiciones
- `npm run dev`: Inicia servidor API en modo desarrollo con watch (tsx watch)
- `npm run server`: Inicia servidor API en modo producción

### Producción

- `npm run render`: Renderiza vídeo manualmente usando CLI de Remotion

## Estructura de Carpetas

```
testing/
├── src/                    # Código Remotion (componentes React)
│   ├── components/        # Componentes de vídeo
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utilidades Remotion
├── server/                # Servidor API
│   ├── routes/           # Endpoints
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Utilidades
│   └── types/            # Tipos TypeScript
├── docs/                  # Documentación
├── temp/                  # Archivos temporales (gitignored)
├── out/                   # Vídeos renderizados
└── package.json
```

## Iniciar el Servidor

### Modo Desarrollo

```bash
npm run dev
```

El servidor se reiniciará automáticamente cuando cambies archivos.

### Modo Producción

```bash
npm run server
```

El servidor estará disponible en `http://localhost:3000` (o el puerto configurado).

## Verificar Instalación

1. **Verificar dependencias**:
   ```bash
   npm list --depth=0
   ```

2. **Probar health check**:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Probar renderizado**:
   ```bash
   curl -X POST http://localhost:3000/render \
     -H "Content-Type: application/json" \
     -d '{"text": "Madrid: soleado, 25°C"}' \
     --output test-video.mp4
   ```

## Solución de Problemas de Instalación

### Error: "Cannot find module"

```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

Cambiar el puerto en `.env` o matar el proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Error: "Remotion not found"

Asegúrate de que todas las dependencias de Remotion estén instaladas:
```bash
npm install @remotion/cli @remotion/bundler @remotion/renderer remotion
```
