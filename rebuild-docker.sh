#!/bin/bash

# Script para regenerar contenedores Docker
# Uso: ./rebuild-docker.sh [opciones]

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="api"
CONTAINER_NAME="weather-video-api"
API_URL="http://localhost:8020"

# Funciones auxiliares
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
Uso: ./rebuild-docker.sh [opciones]

Opciones:
    -h, --help          Mostrar esta ayuda
    -f, --force         Forzar reconstrucción sin caché
    -c, --clean         Limpiar volúmenes y archivos temporales
    -l, --logs          Mostrar logs después de iniciar
    -t, --test          Verificar que el servicio funciona después de iniciar
    -s, --stop          Solo detener y eliminar contenedores (no reconstruir)
    -v, --verbose       Mostrar más información durante el proceso

Ejemplos:
    ./rebuild-docker.sh              # Reconstrucción normal
    ./rebuild-docker.sh -f           # Reconstrucción sin caché
    ./rebuild-docker.sh -c            # Limpiar todo y reconstruir
    ./rebuild-docker.sh -l -t         # Reconstruir, mostrar logs y verificar
EOF
}

# Parsear argumentos
FORCE_REBUILD=false
CLEAN_VOLUMES=false
SHOW_LOGS=false
RUN_TEST=false
STOP_ONLY=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE_REBUILD=true
            shift
            ;;
        -c|--clean)
            CLEAN_VOLUMES=true
            shift
            ;;
        -l|--logs)
            SHOW_LOGS=true
            shift
            ;;
        -t|--test)
            RUN_TEST=true
            shift
            ;;
        -s|--stop)
            STOP_ONLY=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verificar que docker-compose está disponible
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado o no está en el PATH"
    exit 1
fi

# Usar docker compose (nuevo) o docker-compose (antiguo)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    print_error "No se encontró docker-compose"
    exit 1
fi

print_info "Usando: $DOCKER_COMPOSE"

# Verificar que existe docker-compose.yml
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "No se encontró $COMPOSE_FILE"
    exit 1
fi

# Función para verificar estado del servicio
check_service() {
    print_info "Verificando estado del servicio..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
            print_success "Servicio está respondiendo"
            return 0
        fi
        
        attempt=$((attempt + 1))
        if [ "$VERBOSE" = true ]; then
            print_info "Intento $attempt/$max_attempts - Esperando servicio..."
        fi
        sleep 2
    done
    
    print_error "El servicio no está respondiendo después de $max_attempts intentos"
    return 1
}

# Función para mostrar información del sistema
show_system_info() {
    print_info "Información del sistema:"
    echo "  - Docker: $(docker --version)"
    echo "  - Docker Compose: $($DOCKER_COMPOSE version --short 2>/dev/null || echo 'N/A')"
    echo "  - Imágenes: $(docker images | grep -c weather-video || echo 0)"
    echo "  - Contenedores: $(docker ps -a | grep -c $CONTAINER_NAME || echo 0)"
}

# Función principal
main() {
    echo ""
    print_info "=== Regeneración de Contenedores Docker ==="
    echo ""
    
    show_system_info
    echo ""
    
    # Si solo queremos detener
    if [ "$STOP_ONLY" = true ]; then
        print_info "Deteniendo y eliminando contenedores..."
        $DOCKER_COMPOSE down
        print_success "Contenedores detenidos y eliminados"
        exit 0
    fi
    
    # Paso 1: Detener contenedores existentes
    print_info "Paso 1/6: Deteniendo contenedores existentes..."
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        $DOCKER_COMPOSE down
        print_success "Contenedores detenidos"
    else
        print_info "No hay contenedores en ejecución"
    fi
    echo ""
    
    # Paso 2: Limpiar volúmenes y archivos temporales si se solicita
    if [ "$CLEAN_VOLUMES" = true ]; then
        print_info "Paso 2/6: Limpiando volúmenes y archivos temporales..."
        
        # Limpiar directorios temporales
        if [ -d "temp" ]; then
            print_info "Limpiando directorio temp/..."
            rm -rf temp/*
            print_success "Directorio temp/ limpiado"
        fi
        
        if [ -d "out" ]; then
            print_info "Limpiando directorio out/..."
            rm -rf out/*
            print_success "Directorio out/ limpiado"
        fi
        
        # Eliminar volúmenes de Docker
        $DOCKER_COMPOSE down -v 2>/dev/null || true
        print_success "Volúmenes limpiados"
    else
        print_info "Paso 2/6: Saltando limpieza (usa -c para limpiar)"
    fi
    echo ""
    
    # Paso 3: Eliminar imágenes antiguas (opcional)
    if [ "$FORCE_REBUILD" = true ] || [ "$CLEAN_VOLUMES" = true ]; then
        print_info "Paso 3/6: Eliminando imágenes antiguas..."
        docker images | grep "weather-video\|testing" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
        print_success "Imágenes antiguas eliminadas"
    else
        print_info "Paso 3/6: Conservando imágenes existentes (usa -f para forzar reconstrucción)"
    fi
    echo ""
    
    # Paso 4: Reconstruir imágenes
    print_info "Paso 4/6: Reconstruyendo imágenes..."
    if [ "$FORCE_REBUILD" = true ]; then
        print_info "Reconstrucción sin caché..."
        $DOCKER_COMPOSE build --no-cache
    else
        $DOCKER_COMPOSE build
    fi
    print_success "Imágenes reconstruidas"
    echo ""
    
    # Paso 5: Iniciar contenedores
    print_info "Paso 5/6: Iniciando contenedores..."
    $DOCKER_COMPOSE up -d
    print_success "Contenedores iniciados"
    echo ""
    
    # Paso 6: Verificar estado
    print_info "Paso 6/6: Verificando estado..."
    sleep 3  # Dar tiempo para que el contenedor inicie
    
    if docker ps | grep -q "$CONTAINER_NAME"; then
        print_success "Contenedor está en ejecución"
        
        # Mostrar información del contenedor
        if [ "$VERBOSE" = true ]; then
            echo ""
            print_info "Información del contenedor:"
            docker ps | grep "$CONTAINER_NAME"
            echo ""
            print_info "Logs recientes:"
            $DOCKER_COMPOSE logs --tail=10
        fi
    else
        print_error "El contenedor no está en ejecución"
        print_info "Mostrando logs para diagnóstico:"
        $DOCKER_COMPOSE logs
        exit 1
    fi
    echo ""
    
    # Verificar servicio si se solicita
    if [ "$RUN_TEST" = true ]; then
        echo ""
        print_info "=== Verificación del Servicio ==="
        echo ""
        
        if check_service; then
            print_success "Servicio verificado correctamente"
            
            # Mostrar información del sistema
            echo ""
            print_info "Estado del sistema:"
            curl -s "$API_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$API_URL/health"
            echo ""
        else
            print_warning "El servicio no responde, pero el contenedor está ejecutándose"
            print_info "Revisa los logs con: $DOCKER_COMPOSE logs -f"
        fi
    fi
    
    # Mostrar logs si se solicita
    if [ "$SHOW_LOGS" = true ]; then
        echo ""
        print_info "=== Logs del Servicio ==="
        echo ""
        $DOCKER_COMPOSE logs -f
    fi
    
    echo ""
    print_success "=== Proceso completado ==="
    echo ""
    print_info "Comandos útiles:"
    echo "  - Ver logs: $DOCKER_COMPOSE logs -f"
    echo "  - Detener: $DOCKER_COMPOSE down"
    echo "  - Estado: $DOCKER_COMPOSE ps"
    echo "  - Health check: curl $API_URL/health"
    echo "  - Diagnóstico: curl $API_URL/diagnostics"
    echo ""
}

# Ejecutar función principal
main
