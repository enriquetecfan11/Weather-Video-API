import type { WeatherForecastProps } from "../../src/components/WeatherForecast";
import logger from "../utils/logger";

/**
 * Datos parseados del texto meteorológico
 * Compatible con WeatherForecastProps pero con campos adicionales del parser
 */
export interface ParsedWeatherData {
  city?: string;
  country?: string;
  condition: string;
  temperatureC: number;
  temperatureRange?: { min: number; max: number };
  temperatureUnit: "C" | "F";
  feelsLike?: string;
  feelsLikeTemp?: number;
  wind?: string;
  windSpeed?: number;
  windDirection?: string;
  windUnit?: "km/h" | "mph";
  precipitation?: {
    type: "rain" | "snow" | "storm" | null;
    intensity?: string;
    probability?: number;
  };
  description: string;
  language?: "es" | "en" | "fr" | "de";
}

/**
 * Request body para el endpoint /render
 */
export interface RenderRequest {
  text: string;
  options?: {
    outputFormat?: "stream" | "url";
    quality?: number;
    fps?: number;
    width?: number;
    height?: number;
  };
}

/**
 * Response cuando outputFormat es "url"
 */
export interface RenderUrlResponse {
  videoUrl: string;
  expiresAt: string;
}

/**
 * Estado de un render en la cola
 */
export type RenderStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Información de un job de render
 */
export interface RenderJob {
  id: string;
  status: RenderStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  filePath?: string;
  parsedData?: ParsedWeatherData;
}

/**
 * Configuración del servidor
 */
export interface ServerConfig {
  port: number;
  maxConcurrentRenders: number;
  renderTimeout: number;
  tempDir: string;
  outDir: string;
  cleanupInterval: number;
}

/**
 * Convierte ParsedWeatherData a WeatherForecastProps
 * Asegura que todos los campos requeridos estén presentes y maneja correctamente
 * valores undefined/null para evitar que Remotion use los defaultProps
 */
export function toWeatherForecastProps(
  data: ParsedWeatherData
): WeatherForecastProps {
  // Si hay rango de temperaturas, usar el promedio
  const temperatureC = data.temperatureRange
    ? (data.temperatureRange.min + data.temperatureRange.max) / 2
    : data.temperatureC;

  // Manejar precipitation: solo incluir si type no es null
  let precipitation: WeatherForecastProps["precipitation"] = undefined;
  if (data.precipitation && data.precipitation.type !== null) {
    precipitation = {
      type: data.precipitation.type,
      intensity: data.precipitation.intensity,
      probability: data.precipitation.probability,
    };
  }

  // Construir props, asegurando que los campos requeridos estén presentes
  const props: WeatherForecastProps = {
    city: data.city || "Ciudad",
    condition: data.condition,
    temperatureC,
    temperatureUnit: data.temperatureUnit || "C",
    language: data.language || "es",
    windUnit: data.windUnit || "km/h",
    description: data.description || "",
  };

  // Agregar campos opcionales solo si tienen valores definidos
  if (data.country) {
    props.country = data.country;
  }
  if (data.temperatureRange) {
    props.temperatureRange = data.temperatureRange;
  }
  if (data.feelsLike) {
    props.feelsLike = data.feelsLike;
  }
  if (data.feelsLikeTemp !== undefined) {
    props.feelsLikeTemp = data.feelsLikeTemp;
  }
  if (data.wind) {
    props.wind = data.wind;
  }
  if (data.windSpeed !== undefined) {
    props.windSpeed = data.windSpeed;
  }
  if (data.windDirection) {
    props.windDirection = data.windDirection;
  }
  if (precipitation) {
    props.precipitation = precipitation;
  }

  // Log para debug
  logger.debug("Convertiendo ParsedWeatherData a WeatherForecastProps", {
    originalCity: data.city,
    originalCondition: data.condition,
    originalTemperatureC: data.temperatureC,
    originalTemperatureRange: data.temperatureRange,
    finalCity: props.city,
    finalCondition: props.condition,
    finalTemperatureC: props.temperatureC,
    finalTemperatureRange: props.temperatureRange,
    hasPrecipitation: !!props.precipitation,
    precipitationType: props.precipitation?.type,
  });

  return props;
}
