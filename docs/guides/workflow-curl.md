# Workflow Completo con curl

Esta guía muestra el flujo completo para usar la API desde la línea de comandos con `curl`, incluyendo verificación del sistema, gestión de la cola y manejo de errores.

## Configuración Inicial

Define la URL base según tu entorno:

```bash
# Sin Docker (puerto 3000)
export API_URL="http://localhost:3000"

# Con Docker (puerto 8020)
export API_URL="http://localhost:8020"
```

## Paso 1: Verificar que el Servidor Está Activo

```bash
# Health check básico
curl -s $API_URL/health | jq

# Respuesta esperada:
# {
#   "status": "ok",
#   "timestamp": "2026-01-26T12:00:00.000Z",
#   "uptime": 3600
# }
```

## Paso 2: Verificar Estado Completo del Sistema

Antes de renderizar, verifica que todos los componentes estén funcionando:

```bash
# Test completo del sistema
curl -s $API_URL/test | jq

# Verifica que status sea "ok" y que todos los checks pasen
curl -s $API_URL/test | jq '.status, .summary'
```

**Si algún check falla**, revisa los logs y la configuración antes de continuar.

## Paso 3: Verificar Estado de la Cola

Antes de hacer un render, verifica si la cola puede aceptar más trabajos:

```bash
# Consultar estado de la cola
curl -s $API_URL/queue/status | jq

# Verificar específicamente si está llena
curl -s $API_URL/queue/status | jq '.isFull, .available, .utilization'
```

**Si `isFull` es `true`**, espera antes de hacer el render (ver Paso 4).

## Paso 4: Renderizar Vídeo (Stream)

### Opción A: Render simple (stream directo)

```bash
# Render básico - guarda el vídeo directamente
curl -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hoy en Madrid: soleado, 25°C, viento suave del noreste"
  }' \
  --output weather-video.mp4 \
  --progress-bar

# Ver headers de respuesta (incluye job ID y tiempo de procesamiento)
curl -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hoy en Madrid: soleado, 25°C, viento suave"
  }' \
  --output weather-video.mp4 \
  -D headers.txt \
  --progress-bar

# Ver job ID y tiempo de procesamiento
cat headers.txt | grep -i "X-Job-Id\|X-Processing-Time"
```

### Opción B: Render con opciones personalizadas

```bash
curl -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Barcelona: nublado, temperaturas de 10 a 15 grados, lluvia moderada 60%",
    "options": {
      "outputFormat": "stream",
      "quality": 90,
      "fps": 30,
      "width": 1080,
      "height": 1920
    }
  }' \
  --output barcelona-weather.mp4 \
  --progress-bar
```

### Opción C: Render con formato URL (para descarga posterior)

```bash
# Obtener URL del vídeo
RESPONSE=$(curl -s -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Valencia: soleado, 28°C, viento moderado",
    "options": {
      "outputFormat": "url"
    }
  }')

# Extraer URL y job ID
VIDEO_URL=$(echo $RESPONSE | jq -r '.videoUrl')
JOB_ID=$(echo $RESPONSE | jq -r '.jobId')
EXPIRES_AT=$(echo $RESPONSE | jq -r '.expiresAt')

echo "Video URL: $VIDEO_URL"
echo "Job ID: $JOB_ID"
echo "Expira en: $EXPIRES_AT"

# Descargar el vídeo usando la URL
curl -s "$API_URL$VIDEO_URL" --output valencia-weather.mp4
```

## Paso 5: Manejo de Errores

### Error 429 - Cola llena

```bash
# Si recibes un 429, espera y reintenta
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{"text": "Madrid: soleado, 25°C"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "429" ]; then
  RETRY_AFTER=$(echo "$BODY" | jq -r '.retryAfter // 60')
  echo "Cola llena. Esperando $RETRY_AFTER segundos..."
  sleep $RETRY_AFTER
  
  # Reintentar
  curl -X POST $API_URL/render \
    -H "Content-Type: application/json" \
    -d '{"text": "Madrid: soleado, 25°C"}' \
    --output weather-video.mp4
fi
```

### Error 400 - Validación fallida

```bash
# Ver detalles del error
curl -s -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{"text": "Texto muy corto"}' | jq

# Respuesta esperada:
# {
#   "error": "El texto debe tener entre 10 y 1000 caracteres"
# }
```

### Error 500/503 - Error del servidor

```bash
# Consultar diagnóstico completo
curl -s $API_URL/diagnostics | jq

# Verificar estado del sistema
curl -s $API_URL/test | jq '.summary, .checks | to_entries[] | select(.value.status != "ok")'

# Si recibes 503, verifica:
# 1. Timeout: El render tardó más de 5 minutos (300000ms)
#    - Solución: Aumenta RENDER_TIMEOUT en .env
#    - O reduce calidad/resolución del vídeo
# 2. Problema con navegador: Chrome/Chromium no está disponible
#    - Solución: Verifica que Chrome está instalado y configurado
# 3. Espacio en disco: No hay espacio suficiente
#    - Solución: Limpia archivos temporales en temp/

# Revisar logs del servidor
# (En Docker: docker-compose logs -f api)
```

## Script de Ejemplo Completo

```bash
#!/bin/bash
# workflow-completo.sh

API_URL="${API_URL:-http://localhost:8020}"
TEXT="${1:-Hoy en Madrid: soleado, 25°C, viento suave del noreste}"

echo "🔍 Paso 1: Verificando servidor..."
if ! curl -s -f "$API_URL/health" > /dev/null; then
  echo "❌ Servidor no disponible"
  exit 1
fi
echo "✅ Servidor activo"

echo "🔍 Paso 2: Verificando sistema completo..."
TEST_RESULT=$(curl -s "$API_URL/test")
STATUS=$(echo "$TEST_RESULT" | jq -r '.status')
if [ "$STATUS" != "ok" ]; then
  echo "❌ Sistema no está listo"
  echo "$TEST_RESULT" | jq '.checks | to_entries[] | select(.value.status != "ok")'
  exit 1
fi
echo "✅ Sistema operativo"

echo "🔍 Paso 3: Verificando cola..."
QUEUE_STATUS=$(curl -s "$API_URL/queue/status")
IS_FULL=$(echo "$QUEUE_STATUS" | jq -r '.isFull')
if [ "$IS_FULL" = "true" ]; then
  AVAILABLE=$(echo "$QUEUE_STATUS" | jq -r '.available')
  echo "⏳ Cola llena. Slots disponibles: $AVAILABLE"
  echo "Esperando 60 segundos..."
  sleep 60
else
  AVAILABLE=$(echo "$QUEUE_STATUS" | jq -r '.available')
  echo "✅ Cola disponible. Slots: $AVAILABLE"
fi

echo "🎬 Paso 4: Renderizando vídeo..."
OUTPUT_FILE="weather-$(date +%Y%m%d-%H%M%S).mp4"
HTTP_CODE=$(curl -s -w "%{http_code}" -X POST "$API_URL/render" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\"}" \
  --output "$OUTPUT_FILE" \
  -o /dev/null)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Vídeo renderizado: $OUTPUT_FILE"
  ls -lh "$OUTPUT_FILE"
else
  echo "❌ Error al renderizar (HTTP $HTTP_CODE)"
  cat "$OUTPUT_FILE" | jq 2>/dev/null || cat "$OUTPUT_FILE"
  rm -f "$OUTPUT_FILE"
  exit 1
fi
```

**Uso del script:**

```bash
# Hacer ejecutable
chmod +x workflow-completo.sh

# Usar con texto por defecto
./workflow-completo.sh

# Usar con texto personalizado
./workflow-completo.sh "Barcelona: nublado, 15°C, lluvia moderada"
```

## Workflow para Automatización (n8n, etc.)

Para integración con sistemas de automatización:

```bash
# 1. Verificar cola antes de renderizar
QUEUE=$(curl -s $API_URL/queue/status)
if [ "$(echo $QUEUE | jq -r '.isFull')" = "true" ]; then
  echo "Cola llena, esperando..."
  exit 1
fi

# 2. Renderizar con manejo de errores
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/render \
  -H "Content-Type: application/json" \
  -d '{"text": "Tu texto aquí"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

case $HTTP_CODE in
  200)
    echo "$BODY" > video.mp4
    echo "✅ Render exitoso"
    ;;
  429)
    echo "❌ Cola llena: $(echo $BODY | jq -r '.error')"
    exit 1
    ;;
  400)
    echo "❌ Error de validación: $(echo $BODY | jq -r '.error')"
    exit 1
    ;;
  *)
    echo "❌ Error: HTTP $HTTP_CODE"
    echo "$BODY" | jq
    exit 1
    ;;
esac
```

## Tips y Mejores Prácticas

1. **Siempre verifica la cola antes de renderizar** para evitar errores 429
2. **Usa `--progress-bar` en curl** para ver el progreso de descarga
3. **Guarda los headers** con `-D headers.txt` para obtener metadata (job ID, tiempo de procesamiento)
4. **Maneja timeouts** - los renders pueden tardar varios minutos
5. **Limpia archivos temporales** - los vídeos se eliminan automáticamente después de 1 hora
6. **Usa `jq` para parsear JSON** en scripts bash
7. **Monitorea el estado** con `/queue/status` en sistemas de producción
