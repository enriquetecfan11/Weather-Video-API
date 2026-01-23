# Auditoría y Seguridad

## Validación de Entrada

### Límites Implementados

- **Texto**: Mínimo 10 caracteres, máximo 1000 caracteres
- **Quality**: 0-100 (validado)
- **FPS**: 1-60 (validado)
- **Width**: 100-7680 (validado)
- **Height**: 100-4320 (validado)
- **OutputFormat**: Solo "stream" o "url" (validado)

### Sanitización

- **Rutas de archivos**: Generadas con UUID, no aceptan input del usuario
- **Tipos de datos**: Validación estricta de tipos TypeScript
- **Contenido**: El parser solo procesa texto, no ejecuta código

**Implementado en**: `server/utils/validation.ts`

## Seguridad

### Medidas Implementadas

1. **No exposición de rutas internas**:
   - Archivos temporales en directorio `temp/` (no accesible vía HTTP)
   - Rutas generadas con UUID, no predecibles

2. **Validación estricta**:
   - Todos los parámetros se validan antes de procesar
   - Errores de validación retornan 400 con mensajes claros

3. **Manejo seguro de archivos**:
   - Archivos temporales se eliminan después de servir
   - Limpieza automática de archivos antiguos
   - Verificación de existencia antes de servir

4. **Logging seguro**:
   - No se registran datos sensibles
   - Logs estructurados para auditoría

5. **Timeouts**:
   - Timeout por render para evitar procesos colgados
   - Configurable vía `RENDER_TIMEOUT`

### Headers de Seguridad

Considerar añadir en producción:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Vulnerabilidades Conocidas

### Actuales

1. **Sin autenticación**: Cualquiera puede usar la API
   - **Mitigación**: Implementar rate limiting y autenticación (futuro)

2. **Sin rate limiting**: Posible abuso de recursos
   - **Mitigación**: Implementar rate limiting por IP (futuro)

3. **Archivos temporales**: Almacenados en disco local
   - **Mitigación**: Limpieza automática, considerar almacenamiento en memoria para producción

### Potenciales

1. **DoS por renders largos**: Múltiples requests pueden saturar el servidor
   - **Mitigación**: Cola con límites, timeouts, rate limiting

2. **Consumo de disco**: Archivos temporales pueden acumularse
   - **Mitigación**: Limpieza automática implementada

## Mejoras Futuras

### Rate Limiting por IP

Implementar límites de requests por IP:
- Ejemplo: 10 requests por minuto por IP
- Usar librería como `express-rate-limit`

### Autenticación de API

- API keys para clientes autorizados
- Tokens JWT para autenticación
- Middleware de autenticación en Express

### Encriptación de Archivos Temporales

- Encriptar archivos antes de guardar en disco
- Desencriptar al servir
- Útil para datos sensibles (aunque no aplica aquí)

### Validación de Contenido

- Verificar que el texto no contenga código malicioso
- Sanitizar caracteres especiales si es necesario
- Validar formato de texto meteorológico

### Monitoreo de Seguridad

- Alertas por patrones sospechosos
- Logging de intentos de abuso
- Métricas de seguridad

## Recomendaciones para Producción

1. **Implementar rate limiting** antes de desplegar
2. **Añadir autenticación** si la API es pública
3. **Usar HTTPS** para todas las comunicaciones
4. **Monitorear logs** para detectar abusos
5. **Limitar recursos** del servidor (CPU, memoria, disco)
6. **Implementar alertas** para errores y anomalías
7. **Backup de configuración** y código
8. **Actualizar dependencias** regularmente
