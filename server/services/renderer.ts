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
    // Compilar el bundle de Remotion
    logger.info("Compilando bundle de Remotion...");
    const bundleLocation = await bundle({
      entryPoint: ENTRY_POINT,
      webpackOverride: (config) => config,
    });

    // Seleccionar la composición
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "WeatherForecast",
      inputProps: toWeatherForecastProps(parsedData),
    });

    logger.info("Composición seleccionada", {
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
    });

    // Renderizar el vídeo
    logger.info("Renderizando vídeo...");
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: toWeatherForecastProps(parsedData),
      fps,
      width,
      height,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
      quality,
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
    logger.error("Error en renderizado", { error });
    throw error;
  }
}
