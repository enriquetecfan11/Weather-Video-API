import type { WeatherForecastProps } from "../../src/components/WeatherForecast";

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
 */
export function toWeatherForecastProps(
  data: ParsedWeatherData
): WeatherForecastProps {
  // Si hay rango de temperaturas, usar el promedio
  const temperatureC = data.temperatureRange
    ? (data.temperatureRange.min + data.temperatureRange.max) / 2
    : data.temperatureC;

  return {
    city: data.city || "Ciudad",
    country: data.country,
    condition: data.condition,
    temperatureC,
    feelsLike: data.feelsLike,
    feelsLikeTemp: data.feelsLikeTemp,
    wind: data.wind,
    windSpeed: data.windSpeed,
    windDirection: data.windDirection,
    windUnit: data.windUnit || "km/h",
    language: data.language || "es",
    temperatureUnit: data.temperatureUnit,
    precipitation: data.precipitation,
    description: data.description,
  };
}
