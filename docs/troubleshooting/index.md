# Troubleshooting

## Problemas Comunes

### Renderizado Falla

**Síntoma**: Error 500 al renderizar

**Diagnóstico rápido**:
```bash
# Verificar estado del sistema
curl http://localhost:8020/diagnostics

# Verificar estado de la cola
curl http://localhost:8020/queue/status

# Verificar sistema completo
curl http://localhost:8020/test
```

**Posibles causas y soluciones**:

1. **Chrome/Chromium no disponible o sin permisos**:
   - **En Docker**: El sistema usa Chrome Headless Shell automáticamente
     - Si ves "Old Headless mode has been removed": actualizar Dockerfile a Debian
     - Si ves "Missing X server": verificar que no estás usando Alpine Linux
     - Si ves "ENOENT" con chrome-headless-shell: reconstruir contenedor sin caché
   - **En local**: Remotion descargará Chrome Headless Shell automáticamente
   - Ver logs: buscar errores "spawn", "ENOENT", "EACCES", "Old Headless mode"

2. **Remotion no instalado correctamente**:
   ```bash
   npm install @remotion/bundler @remotion/renderer
   ```

3. **Espacio en disco insuficiente**:
   - Verificar espacio disponible
   - Limpiar archivos temporales: `rm -rf temp/*`
   - Error típico: "Espacio en disco insuficiente para renderizar"

4. **Error en composición Remotion**:
   - Verificar logs del servidor para detalles
   - Probar renderizado manual: `npm run render`
   - Verificar que `src/index.tsx` exporte correctamente
   - Error típico: "Error al seleccionar la composición 'WeatherForecast'"

5. **Timeout excedido**:
   - Aumentar `RENDER_TIMEOUT` en `.env`
   - Verificar rendimiento del sistema
   - Error típico: "Timeout al renderizar el vídeo"

6. **Error al parsear texto**:
   - Verificar formato del texto meteorológico
   - El texto debe tener entre 10-1000 caracteres
   - Error típico: "Error al parsear el texto meteorológico"

**Debug**:
```bash
# Ver logs detallados
LOG_LEVEL=debug npm run server

# En Docker
docker-compose logs -f api

# Verificar diagnóstico completo
curl http://localhost:8020/diagnostics | jq
```

**Mensajes de error comunes**:
- `Error al iniciar el navegador`: Chrome/Chromium no está disponible
- `Error al compilar el proyecto`: Problema con Remotion bundle
- `Error al seleccionar la composición`: La composición 'WeatherForecast' no existe o tiene errores
- `Timeout al renderizar`: El proceso tardó más de `RENDER_TIMEOUT` ms

### Cola Llena

**Síntoma**: Error 429 (Too Many Requests)

**Soluciones**:
- Esperar a que se completen renders en curso
- Aumentar límite en `.env`: `MAX_CONCURRENT_RENDERS=4`
- Verificar estado de la cola usando `GET /queue/status`
- Implementar retry con backoff en el cliente (n8n, etc.)

**Verificar estado**:
```bash
# Consultar estado de la cola
curl http://localhost:8020/queue/status
```

**Respuesta cuando está llena**:
```json
{
  "isFull": true,
  "available": 0,
  "processing": 2,
  "queueSize": 2,
  "utilization": 1.0
}
```

**Para n8n**: Verifica `isFull` antes de hacer peticiones y espera si es necesario.

### Parser No Extrae Datos

**Síntoma**: Datos faltantes en el vídeo (ciudad, temperatura, etc.)

**Soluciones**:

1. **Verificar formato del texto**:
   - El texto debe estar en español
   - Incluir información explícita (ej: "temperaturas entre X y Y")
   - Usar formato estándar: "Hoy en [Ciudad]: [condición]..."

2. **Revisar logs del parser**:
   ```bash
   # Los logs muestran qué se extrajo
   LOG_LEVEL=info npm run server
   ```

3. **Ajustar parser si es necesario**:
   - Editar `server/services/parser.ts`
   - Añadir nuevos patrones regex o términos al diccionario

**Ejemplos de texto válido**:
- ✅ "Hoy en Madrid: soleado, 25°C, viento suave"
- ✅ "Barcelona: nublado, temperaturas de 10 a 15 grados, lluvia moderada 60%"
- ✅ "Mondéjar, España: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C"

### Servidor No Inicia

**Síntoma**: Error al iniciar el servidor

**Soluciones**:

1. **Puerto en uso**:
   ```bash
   # Cambiar puerto en .env
   PORT=3001
   ```

2. **Error de TypeScript**:
   ```bash
   # Verificar compilación
   npx tsc --noEmit
   ```

3. **Dependencias faltantes**:
   ```bash
   npm install
   ```

### Vídeo Generado Está Vacío o Corrupto

**Síntoma**: El MP4 no se reproduce o está vacío

**Soluciones**:
- Verificar que el renderizado completó sin errores
- Comprobar tamaño del archivo (debe ser >0)
- Verificar logs para errores durante el renderizado
- Probar con un texto más simple primero

### Error 503 - Service Unavailable

**Síntoma**: Error 503 al renderizar

**Diagnóstico**:
```bash
# Verificar diagnóstico completo
curl http://localhost:8020/diagnostics | jq

# Verificar estado del sistema
curl http://localhost:8020/test | jq '.summary, .checks | to_entries[] | select(.value.status != "ok")'
```

**Causas comunes y soluciones**:

1. **Timeout en renderizado**:
   - **Síntoma**: El error incluye "Timeout" o el tiempo de procesamiento es cercano a `RENDER_TIMEOUT`
   - **Solución**: 
     - Aumentar `RENDER_TIMEOUT` en `.env` (valor en milisegundos, default: 300000 = 5 minutos)
     - Reducir calidad o resolución en las opciones de render
     - Verificar recursos del sistema (CPU, memoria)
   - **Ejemplo**: Si el render tarda 6 minutos, aumenta a `RENDER_TIMEOUT=360000` (6 minutos)

2. **Problema con navegador/Chrome**:
   - **Síntoma**: El error incluye "browser", "Chrome", "Chromium", "spawn", "EACCES", "Old Headless mode", "Missing X server", o "ENOENT"
   - **Soluciones**:
     - **En Docker**: El sistema usa Chrome Headless Shell automáticamente (no requiere configuración)
     - Si el error es "Old Headless mode has been removed":
       - Asegúrate de usar la versión más reciente del Dockerfile (Debian-based)
       - Reconstruir el contenedor: `docker compose build --no-cache`
     - Si el error es "Missing X server" o "Failed to connect to the bus":
       - Verificar que estás usando `node:22-bookworm-slim` (Debian) y no Alpine
       - Chrome Headless Shell no requiere X11, este error indica configuración incorrecta
     - Si el error es "ENOENT" o "spawn" con chrome-headless-shell:
       - Verificar que el build descargó Chrome Headless Shell correctamente
       - Reconstruir sin caché: `docker compose build --no-cache`
       - Verificar logs del build para errores durante `npx remotion browser ensure`
     - **En local (sin Docker)**: Remotion descargará Chrome Headless Shell automáticamente
     - No es necesario configurar `REMOTION_BROWSER_EXECUTABLE` - Remotion lo gestiona automáticamente

3. **Espacio en disco insuficiente**:
   - **Síntoma**: El error incluye "Espacio en disco"
   - **Solución**:
     - Limpiar archivos temporales: `rm -rf temp/*`
     - Verificar espacio disponible en disco
     - La limpieza automática se ejecuta cada hora, pero puedes limpiar manualmente

4. **Sistema no listo** (endpoint `/test` falla):
   - **Síntoma**: El endpoint `/test` devuelve 503
   - **Solución**: Revisar qué check específico está fallando en `/test`

**Para n8n y automatización**:
- Siempre verifica `/queue/status` antes de hacer renders
- Implementa retry con backoff exponencial
- Verifica `/diagnostics` para obtener recomendaciones
- Los errores 503 incluyen `errorCode` y `suggestion` en la respuesta JSON

### Archivos Temporales Se Acumulan

**Síntoma**: Directorio `temp/` crece sin control

**Soluciones**:
- La limpieza automática se ejecuta cada hora
- Limpiar manualmente: `rm -rf temp/*`
- Verificar que el proceso de limpieza esté funcionando (ver logs)

### Error "Permission denied" al Escribir Archivos en Docker

**Síntoma**: Error "Permission denied" al intentar escribir en `/app/temp/` o `/app/out/`

**Causa**: Los volúmenes montados desde el host pueden tener permisos incorrectos

**Soluciones**:
- El `entrypoint.sh` ajusta permisos automáticamente al iniciar el contenedor
- Si el problema persiste:
  ```bash
  # Verificar que el entrypoint se ejecuta
  docker compose logs api | grep entrypoint
  
  # Verificar permisos en el host
  ls -la temp/ out/
  
  # Ajustar permisos manualmente en el host (si es necesario)
  chmod 755 temp out
  ```
- En Windows: Los permisos se gestionan automáticamente, pero verifica que los directorios existan

### Error "FFmpeg quit with code 243 - Permission denied"

**Síntoma**: FFmpeg no puede escribir el archivo de salida

**Causa**: Permisos incorrectos en directorio `temp/` o `out/`

**Solución**:
- El entrypoint debería resolver esto automáticamente
- Si persiste, verificar que los directorios existen y tienen permisos:
  ```bash
  # En el contenedor
  docker exec -it weather-video-api ls -la /app/temp
  docker exec -it weather-video-api ls -la /app/out
  ```

## Obtener Ayuda

1. **Revisar logs del servidor** para mensajes de error específicos
2. **Verificar documentación** en `docs/`
3. **Probar con ejemplos simples** del README
4. **Revisar código fuente** en `server/` para entender el flujo
