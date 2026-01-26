import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { ParsedWeatherData, toWeatherForecastProps } from "../types/api";
import logger from "../utils/logger";
import {
  generateTempFilePath,
  checkDiskSpace,
} from "../utils/fileManager";

/**
 * Configuración de renderizado
 */
const ENTRY_POINT = path.join(process.cwd(), "src", "index.tsx");
const OUT_DIR = process.env.OUT_DIR || path.join(process.cwd(), "out");

// Obtener ejecutable del navegador desde variables de entorno
const BROWSER_EXECUTABLE = 
  process.env.REMOTION_BROWSER_EXECUTABLE || 
  process.env.PUPPETEER_EXECUTABLE_PATH || 
  process.env.CHROME_BIN || 
  undefined;

/**
 * Opciones de renderizado por defecto
 */
interface RenderOptions {
  fps?: number;
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Renderiza un vídeo usando Remotion
 */
export async function renderVideo(
  parsedData: ParsedWeatherData,
  options: RenderOptions = {}
): Promise<string> {
  logger.info("Iniciando renderizado de vídeo", {
    city: parsedData.city,
    condition: parsedData.condition,
  });

  // Verificar espacio en disco
  const hasSpace = await checkDiskSpace();
  if (!hasSpace) {
    throw new Error("Espacio en disco insuficiente para renderizar");
  }

  // Configuración de renderizado
  const fps = options.fps || 30;
  const width = options.width || 1080;
  const height = options.height || 1920;
  const quality = options.quality || 80;

  // Generar ruta de salida
  const outputPath = generateTempFilePath();

  try {
    // Convertir datos parseados a props
    const inputProps = toWeatherForecastProps(parsedData);
    
    // Log detallado de los inputProps que se van a pasar a Remotion
    logger.info("InputProps que se pasarán a Remotion", {
      city: inputProps.city,
      country: inputProps.country,
      condition: inputProps.condition,
      temperatureC: inputProps.temperatureC,
      temperatureUnit: inputProps.temperatureUnit,
      feelsLike: inputProps.feelsLike,
      feelsLikeTemp: inputProps.feelsLikeTemp,
      wind: inputProps.wind,
      windSpeed: inputProps.windSpeed,
      windDirection: inputProps.windDirection,
      windUnit: inputProps.windUnit,
      language: inputProps.language,
      precipitation: inputProps.precipitation,
      hasDescription: !!inputProps.description,
      descriptionLength: inputProps.description?.length || 0,
      fullProps: JSON.stringify(inputProps, null, 2),
    });

    // Compilar el bundle de Remotion
    logger.info("Compilando bundle de Remotion...", {
      browserExecutable: BROWSER_EXECUTABLE || "default",
    });
    const bundleLocation = await bundle({
      entryPoint: ENTRY_POINT,
      webpackOverride: (config) => config,
      ...(BROWSER_EXECUTABLE && { browserExecutable: BROWSER_EXECUTABLE }),
    });

    // Seleccionar la composición
    logger.info("Seleccionando composición con inputProps...");
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "WeatherForecast",
      inputProps,
      ...(BROWSER_EXECUTABLE && { browserExecutable: BROWSER_EXECUTABLE }),
    });

    logger.info("Composición seleccionada", {
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      compositionId: composition.id,
    });

    // Verificar que la composición tenga los props correctos
    if (composition.props) {
      logger.debug("Props de la composición seleccionada", {
        compositionCity: (composition.props as any).city,
        compositionCondition: (composition.props as any).condition,
        compositionTemperatureC: (composition.props as any).temperatureC,
      });
    }

    // Renderizar el vídeo
    logger.info("Renderizando vídeo con inputProps...");
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      fps,
      width,
      height,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
      quality,
      ...(BROWSER_EXECUTABLE && { browserExecutable: BROWSER_EXECUTABLE }),
      chromiumOptions: {
        // Flags necesarios para ejecutar en contenedor Docker sin display
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      },
      onProgress: ({ renderedFrames, encodedFrames }) => {
        if (renderedFrames % 30 === 0 || encodedFrames % 30 === 0) {
          logger.debug("Progreso de renderizado", {
            renderedFrames,
            encodedFrames,
            totalFrames: composition.durationInFrames,
          });
        }
      },
    });

    logger.info("Renderizado completado", { outputPath });
    return outputPath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error("Error en renderizado", {
      error: errorMessage,
      stack: errorStack,
      errorName: error instanceof Error ? error.name : typeof error,
      entryPoint: ENTRY_POINT,
      browserExecutable: BROWSER_EXECUTABLE || "default",
      outputPath,
    });

    // Proporcionar mensajes de error más específicos
    if (errorMessage.includes("ENOENT") || errorMessage.includes("no such file")) {
      throw new Error(`Archivo o directorio no encontrado: ${errorMessage}`);
    } else if (errorMessage.includes("spawn") || errorMessage.includes("EACCES")) {
      throw new Error(`Error al ejecutar Chrome/Chromium. Verifica que el ejecutable existe y tiene permisos: ${BROWSER_EXECUTABLE || "default"}`);
    } else if (errorMessage.includes("timeout")) {
      throw new Error(`Timeout al renderizar el vídeo. El proceso excedió el tiempo límite.`);
    } else if (errorMessage.includes("bundle")) {
      throw new Error(`Error al compilar el bundle de Remotion: ${errorMessage}`);
    } else if (errorMessage.includes("composition")) {
      throw new Error(`Error al seleccionar la composición 'WeatherForecast': ${errorMessage}`);
    }
    
    // Re-lanzar el error original con contexto adicional
    throw error;
  }
}
