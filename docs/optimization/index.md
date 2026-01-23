# Optimización

## Rendimiento

### Renders Concurrentes

El sistema permite configurar el número de renders concurrentes según los recursos disponibles:

```env
MAX_CONCURRENT_RENDERS=2  # Por defecto
```

**Recomendaciones**:
- **Servidor pequeño** (2-4 cores, 4GB RAM): 1-2 renders concurrentes
- **Servidor medio** (4-8 cores, 8GB RAM): 2-4 renders concurrentes
- **Servidor grande** (8+ cores, 16GB+ RAM): 4-6 renders concurrentes

**Balancear**:
- Más renders = mayor throughput pero más uso de CPU/memoria
- Menos renders = menor throughput pero más estable

### Gestión de Memoria

- **Limpieza automática**: Archivos temporales >1 hora se eliminan automáticamente
- **Limpieza después de stream**: Archivos se eliminan inmediatamente después de servir
- **Monitoreo**: Los logs incluyen información de uso de recursos

### Optimización de Renderizado

**Calidad vs Tiempo**:
- Calidad 80-90: Balance óptimo (por defecto: 80)
- Calidad 60-70: Más rápido, menor calidad
- Calidad 90-100: Más lento, máxima calidad

**Resolución**:
- 1080x1920 (por defecto): Balance óptimo para móvil
- Resoluciones menores: Más rápido pero menor calidad
- Resoluciones mayores: Más lento, mayor calidad

**FPS**:
- 30 FPS (por defecto): Estándar para vídeos
- 24 FPS: Más rápido, suficiente para animaciones
- 60 FPS: Más lento, mejor para animaciones rápidas

## Optimizaciones Implementadas

1. **Cola de renders**: Evita sobrecarga del sistema
2. **Limpieza automática**: Previene acumulación de archivos
3. **Timeouts**: Evita renders que se cuelguen
4. **Logging eficiente**: Solo registra información relevante

## Mejoras Futuras

### Caché de Renders

Implementar caché para renders con el mismo texto:
- Hash del texto como clave
- Verificar si existe antes de renderizar
- Retornar archivo cacheado si existe

### Compresión de Vídeos

- Comprimir vídeos después del renderizado
- Reducir tamaño de archivo sin pérdida significativa de calidad
- Opción de compresión configurable

### CDN para Distribución

- Servir vídeos desde CDN
- Reducir carga en el servidor principal
- Mejor latencia para usuarios

### Renderizado Incremental

- Cachear frames individuales
- Re-renderizar solo frames que cambian
- Útil para actualizaciones de datos meteorológicos

### Paralelización de Frames

- Renderizar frames en paralelo cuando sea posible
- Aprovechar múltiples cores del CPU
- Reducir tiempo total de renderizado

## Monitoreo de Rendimiento

### Métricas Clave

- **Tiempo de procesamiento**: Incluido en headers de respuesta
- **Estado de cola**: Visible en logs
- **Tasa de éxito**: Monitorear errores en logs
- **Uso de recursos**: Monitorear CPU y memoria del sistema

### Logs

Los logs incluyen:
- Tiempo de procesamiento por request
- Estado de la cola
- Errores y excepciones
- Información de limpieza de archivos

Para logs detallados:
```bash
LOG_LEVEL=debug npm run server
```
