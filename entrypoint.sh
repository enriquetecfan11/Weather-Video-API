#!/bin/bash
set -e

# Ajustar permisos de directorios montados como volúmenes
# Estos directorios se montan desde el host y pueden tener permisos incorrectos
if [ -d "/app/temp" ]; then
    chown -R nodejs:nodejs /app/temp || true
    chmod -R 755 /app/temp || true
fi

if [ -d "/app/out" ]; then
    chown -R nodejs:nodejs /app/out || true
    chmod -R 755 /app/out || true
fi

# Ejecutar el comando original como usuario nodejs usando gosu
exec gosu nodejs "$@"
