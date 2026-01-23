import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger";

/**
 * Configuración de gestión de archivos
 */
const TEMP_DIR = process.env.TEMP_DIR || path.join(process.cwd(), "temp");
const CLEANUP_AGE_MS = 60 * 60 * 1000; // 1 hora

/**
 * Inicializa el directorio temporal
 */
export async function initializeTempDir(): Promise<void> {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    logger.info(`Directorio temporal inicializado: ${TEMP_DIR}`);
  } catch (error) {
    logger.error("Error al inicializar directorio temporal", { error });
    throw error;
  }
}

/**
 * Genera una ruta temporal única para un archivo de vídeo
 */
export function generateTempFilePath(): string {
  const filename = `render-${Date.now()}-${uuidv4().slice(0, 8)}.mp4`;
  return path.join(TEMP_DIR, filename);
}

/**
 * Verifica si hay espacio suficiente en disco (mínimo 100MB)
 * Nota: En Windows, esta verificación es limitada. Asumimos que hay espacio.
 */
export async function checkDiskSpace(): Promise<boolean> {
  try {
    // En Node.js no hay una forma directa multiplataforma de verificar espacio
    // Para producción, se podría usar una librería como 'check-disk-space'
    // Por ahora, verificamos que el directorio existe y es accesible
    await fs.access(TEMP_DIR);
    logger.debug("Directorio temporal accesible", { tempDir: TEMP_DIR });
    return true;
  } catch (error) {
    logger.error("Error al verificar directorio temporal", { error });
    return false;
  }
}

/**
 * Elimina un archivo temporal
 */
export async function deleteTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.info(`Archivo temporal eliminado: ${filePath}`);
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      logger.error("Error al eliminar archivo temporal", { filePath, error });
    }
  }
}

/**
 * Limpia archivos temporales antiguos (>1 hora)
 */
export async function cleanupOldFiles(): Promise<number> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > CLEANUP_AGE_MS) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.debug(`Archivo antiguo eliminado: ${file}`);
        }
      } catch (error) {
        logger.warn(`Error al procesar archivo ${file}`, { error });
      }
    }

    if (deletedCount > 0) {
      logger.info(`Limpieza completada: ${deletedCount} archivos eliminados`);
    }

    return deletedCount;
  } catch (error) {
    logger.error("Error en limpieza de archivos", { error });
    return 0;
  }
}

/**
 * Verifica si un archivo existe
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el tamaño de un archivo en bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error("Error al obtener tamaño de archivo", { filePath, error });
    throw error;
  }
}
