import { Groq } from "groq-sdk";
import { ParsedWeatherData } from "../types/api";
import logger from "../utils/logger";

/**
 * Inicializar cliente Groq (solo si hay API key)
 */
let groqClient: Groq | null = null;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (GROQ_API_KEY) {
  try {
    groqClient = new Groq({
      apiKey: GROQ_API_KEY,
    });
    logger.info("Cliente Groq inicializado correctamente");
  } catch (error) {
    logger.warn("Error al inicializar cliente Groq", { error });
  }
} else {
  logger.warn(
    "GROQ_API_KEY no configurada, se usará parser determinista como fallback"
  );
}

/**
 * Diccionario de condiciones meteorológicas normalizadas
 */
const CONDITION_MAP: Record<string, string> = {
  // Soleado
  soleado: "Soleado",
  soleada: "Soleado",
  sol: "Soleado",
  despejado: "Despejado",
  despejada: "Despejado",
  claro: "Despejado",
  clara: "Despejado",
  "cielo despejado": "Despejado",
  "cielo claro": "Despejado",

  // Nublado
  nublado: "Nublado",
  nublada: "Nublado",
  nubes: "Nublado",
  "parcialmente nublado": "Nublado",
  "parcialmente nublada": "Nublado",
  "muy nublado": "Muy nublado",
  "muy nublada": "Muy nublado",
  "totalmente nublado": "Muy nublado",
  "totalmente nublada": "Muy nublado",
  "cielo nublado": "Nublado",
  "cielo cubierto": "Muy nublado",

  // Lluvia
  lluvia: "Lluvia",
  lluvioso: "Lluvia",
  lluviosa: "Lluvia",
  llover: "Lluvia",
  lloviendo: "Lluvia",
  chubascos: "Lluvia",
  chubasco: "Lluvia",
  "lluvia débil": "Lluvia",
  "lluvia moderada": "Lluvia",
  "lluvia fuerte": "Lluvia",
  "lluvia intensa": "Lluvia",
  precipitaciones: "Lluvia",
  precipitación: "Lluvia",

  // Nieve
  nieve: "Nieve",
  nevando: "Nieve",
  nevada: "Nieve",
  "nieve débil": "Nieve",
  "nieve moderada": "Nieve",
  "nieve fuerte": "Nieve",
  "nieve intensa": "Nieve",

  // Tormenta
  tormenta: "Tormenta",
  tormentoso: "Tormenta",
  tormentosa: "Tormenta",
  "tormenta eléctrica": "Tormenta",
  "tormentas eléctricas": "Tormenta",
  rayos: "Tormenta",
  truenos: "Tormenta",
};

/**
 * Diccionario de intensidades normalizadas
 */
const INTENSITY_MAP: Record<string, string> = {
  débil: "débil",
  debil: "débil",
  leve: "débil",
  ligero: "débil",
  ligera: "débil",
  suave: "débil",
  moderado: "moderado",
  moderada: "moderado",
  medio: "moderado",
  media: "moderado",
  fuerte: "fuerte",
  intenso: "fuerte",
  intensa: "fuerte",
  severo: "fuerte",
  severa: "fuerte",
};

/**
 * Diccionario de direcciones de viento
 */
const WIND_DIRECTIONS: string[] = [
  "norte",
  "sur",
  "este",
  "oeste",
  "noreste",
  "noroeste",
  "sureste",
  "suroeste",
  "nordeste",
  "nordeste",
];

/**
 * Normaliza texto: minúsculas, elimina acentos opcionales
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
    .trim();
}

/**
 * Extrae ciudad y país del texto
 */
function extractLocation(text: string): { city?: string; country?: string } {
  // Patrón: "en [Ciudad]" o "en [Ciudad], [País]" o "[Ciudad], [País]:"
  const patterns = [
    /(?:hoy\s+)?en\s+([^,:]+?)(?:,\s*([^:]+?))?(?::|$)/i,
    /^([^,]+?)(?:,\s*([^:]+?))(?::|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const city = match[1]?.trim();
      const country = match[2]?.trim();
      if (city && city.length > 0) {
        return {
          city: city.charAt(0).toUpperCase() + city.slice(1),
          country: country
            ? country.charAt(0).toUpperCase() + country.slice(1)
            : undefined,
        };
      }
    }
  }

  return {};
}

/**
 * Extrae la condición meteorológica
 */
function extractCondition(text: string): string {
  const normalized = normalizeText(text);

  // Buscar en el diccionario
  for (const [key, value] of Object.entries(CONDITION_MAP)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Fallback: buscar palabras clave comunes
  if (normalized.includes("sol") || normalized.includes("despej")) {
    return "Despejado";
  }
  if (normalized.includes("nubl")) {
    return "Nublado";
  }
  if (normalized.includes("lluv") || normalized.includes("chubasc")) {
    return "Lluvia";
  }
  if (normalized.includes("niev")) {
    return "Nieve";
  }
  if (normalized.includes("torment")) {
    return "Tormenta";
  }

  // Fallback final
  return "Despejado";
}

/**
 * Extrae temperaturas y unidades
 */
function extractTemperature(
  text: string
): {
  temperatureC: number;
  temperatureRange?: { min: number; max: number };
  temperatureUnit: "C" | "F";
} {
  const normalized = normalizeText(text);

  // Detectar unidad (por defecto Celsius)
  const hasFahrenheit = /°f|fahrenheit|f\b/i.test(text);
  const temperatureUnit: "C" | "F" = hasFahrenheit ? "F" : "C";

  // Patrón 1: "temperaturas entre X y Y °C"
  const rangePattern =
    /temperaturas?\s+(?:entre|de)\s+(-?\d+)\s*°?[cf]?\s*(?:y|a)\s+(-?\d+)\s*°?[cf]?/i;
  const rangeMatch = text.match(rangePattern);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    const avg = (min + max) / 2;

    // Convertir a Celsius si es necesario
    const minC = temperatureUnit === "F" ? ((min - 32) * 5) / 9 : min;
    const maxC = temperatureUnit === "F" ? ((max - 32) * 5) / 9 : max;
    const avgC = (minC + maxC) / 2;

    return {
      temperatureC: Math.round(avgC * 10) / 10,
      temperatureRange: {
        min: Math.round(minC * 10) / 10,
        max: Math.round(maxC * 10) / 10,
      },
      temperatureUnit,
    };
  }

  // Patrón 2: "X°C" o "X grados"
  const singlePattern = /(-?\d+)\s*°?[cf]?|(-?\d+)\s+grados/i;
  const singleMatch = text.match(singlePattern);
  if (singleMatch) {
    const temp = parseInt(singleMatch[1] || singleMatch[2], 10);
    const tempC = temperatureUnit === "F" ? ((temp - 32) * 5) / 9 : temp;

    return {
      temperatureC: Math.round(tempC * 10) / 10,
      temperatureUnit,
    };
  }

  // Fallback: temperatura por defecto
  return {
    temperatureC: 15,
    temperatureUnit: "C",
  };
}

/**
 * Extrae información de viento
 */
function extractWind(text: string): {
  wind?: string;
  windSpeed?: number;
  windDirection?: string;
  windUnit?: "km/h" | "mph";
} {
  const normalized = normalizeText(text);
  const result: {
    wind?: string;
    windSpeed?: number;
    windDirection?: string;
    windUnit?: "km/h" | "mph";
  } = {};

  // Detectar unidad de velocidad
  const hasMph = /mph|millas/i.test(text);
  const windUnit: "km/h" | "mph" = hasMph ? "mph" : "km/h";

  // Extraer velocidad
  const speedPattern = /(\d+)\s*(?:km\/h|kmh|mph|millas)/i;
  const speedMatch = text.match(speedPattern);
  if (speedMatch) {
    result.windSpeed = parseInt(speedMatch[1], 10);
    result.windUnit = windUnit;
  }

  // Extraer intensidad
  const intensityPattern = /viento\s+(\w+)/i;
  const intensityMatch = text.match(intensityPattern);
  if (intensityMatch) {
    const intensity = normalizeText(intensityMatch[1]);
    const normalizedIntensity = INTENSITY_MAP[intensity] || intensity;
    result.wind = `Viento ${normalizedIntensity}`;
  } else if (normalized.includes("viento")) {
    // Si menciona viento pero no especifica intensidad
    result.wind = "Viento";
  }

  // Extraer dirección
  for (const direction of WIND_DIRECTIONS) {
    if (normalized.includes(direction)) {
      result.windDirection =
        direction.charAt(0).toUpperCase() + direction.slice(1);
      break;
    }
  }

  return result;
}

/**
 * Extrae información de precipitación
 */
function extractPrecipitation(text: string): {
  type: "rain" | "snow" | "storm" | null;
  intensity?: string;
  probability?: number;
} {
  const normalized = normalizeText(text);
  const result: {
    type: "rain" | "snow" | "storm" | null;
    intensity?: string;
    probability?: number;
  } = { type: null };

  // Detectar tipo
  if (normalized.includes("lluv") || normalized.includes("chubasc")) {
    result.type = "rain";
  } else if (normalized.includes("niev")) {
    result.type = "snow";
  } else if (normalized.includes("torment")) {
    result.type = "storm";
  }

  // Extraer intensidad
  for (const [key, value] of Object.entries(INTENSITY_MAP)) {
    if (normalized.includes(key)) {
      result.intensity = value;
      break;
    }
  }

  // Extraer probabilidad
  // Patrón 1: porcentaje explícito "60%"
  const percentPattern = /(\d+)\s*%/;
  const percentMatch = text.match(percentPattern);
  if (percentMatch) {
    result.probability = parseInt(percentMatch[1], 10);
  } else {
    // Patrón 2: texto descriptivo
    if (
      normalized.includes("alta probabilidad") ||
      normalized.includes("muy probable") ||
      normalized.includes("probable")
    ) {
      result.probability = 75;
    } else if (
      normalized.includes("baja probabilidad") ||
      normalized.includes("poco probable")
    ) {
      result.probability = 25;
    } else if (normalized.includes("probabilidad")) {
      result.probability = 50;
    }
  }

  return result;
}

/**
 * Parser determinista (fallback)
 * Parsea texto meteorológico en español a datos estructurados usando regex y diccionarios
 */
function parseWithDeterministic(text: string): ParsedWeatherData {
  logger.info("Usando parser determinista", {
    textLength: text.length,
  });

  const location = extractLocation(text);
  const condition = extractCondition(text);
  const temperature = extractTemperature(text);
  const wind = extractWind(text);
  const precipitation = extractPrecipitation(text);

  // Determinar si hay precipitación basándose en la condición
  let finalPrecipitation = precipitation;
  if (!finalPrecipitation.type) {
    if (condition === "Lluvia") {
      finalPrecipitation = { ...precipitation, type: "rain" };
    } else if (condition === "Nieve") {
      finalPrecipitation = { ...precipitation, type: "snow" };
    } else if (condition === "Tormenta") {
      finalPrecipitation = { ...precipitation, type: "storm" };
    }
  }

  const result: ParsedWeatherData = {
    ...location,
    condition,
    temperatureC: temperature.temperatureC,
    temperatureRange: temperature.temperatureRange,
    temperatureUnit: temperature.temperatureUnit,
    ...wind,
    precipitation: finalPrecipitation.type ? finalPrecipitation : undefined,
    description: text.trim(),
    language: "es",
  };

  logger.info("Parseo determinista completado", {
    city: result.city,
    condition: result.condition,
    temperatureC: result.temperatureC,
    hasPrecipitation: !!result.precipitation,
  });

  return result;
}

/**
 * Valida y normaliza la respuesta de Groq
 */
function validateAndNormalizeGroqResponse(
  data: any
): ParsedWeatherData | null {
  try {
    // Validar campos requeridos
    if (typeof data.condition !== "string" || !data.condition) {
      logger.warn("Respuesta Groq inválida: condition faltante o inválida");
      return null;
    }

    if (typeof data.temperatureC !== "number" || isNaN(data.temperatureC)) {
      logger.warn("Respuesta Groq inválida: temperatureC faltante o inválida");
      return null;
    }

    if (typeof data.description !== "string") {
      data.description = "";
    }

    // Normalizar condition
    const validConditions = [
      "Soleado",
      "Despejado",
      "Nublado",
      "Muy nublado",
      "Lluvia",
      "Nieve",
      "Tormenta",
    ];
    if (!validConditions.includes(data.condition)) {
      // Intentar normalizar
      const normalized = data.condition.toLowerCase();
      if (normalized.includes("soleado") || normalized.includes("despejado")) {
        data.condition = "Soleado";
      } else if (normalized.includes("muy nublado")) {
        data.condition = "Muy nublado";
      } else if (normalized.includes("nublado")) {
        data.condition = "Nublado";
      } else if (normalized.includes("lluvia") || normalized.includes("chubasco")) {
        data.condition = "Lluvia";
      } else if (normalized.includes("nieve")) {
        data.condition = "Nieve";
      } else if (normalized.includes("tormenta")) {
        data.condition = "Tormenta";
      } else {
        data.condition = "Despejado";
      }
    }

    // Normalizar precipitation.type
    if (data.precipitation) {
      if (
        data.precipitation.type &&
        !["rain", "snow", "storm"].includes(data.precipitation.type)
      ) {
        const type = data.precipitation.type.toLowerCase();
        if (type.includes("rain") || type.includes("lluvia")) {
          data.precipitation.type = "rain";
        } else if (type.includes("snow") || type.includes("nieve")) {
          data.precipitation.type = "snow";
        } else if (type.includes("storm") || type.includes("tormenta")) {
          data.precipitation.type = "storm";
        } else {
          data.precipitation.type = null;
        }
      }
    }

    // Asegurar temperatureUnit válido
    if (data.temperatureUnit !== "C" && data.temperatureUnit !== "F") {
      data.temperatureUnit = "C";
    }

    // Asegurar windUnit válido
    if (data.windUnit && data.windUnit !== "km/h" && data.windUnit !== "mph") {
      data.windUnit = "km/h";
    }

    // Asegurar language
    if (!data.language) {
      data.language = "es";
    }

    // Construir resultado final
    const result: ParsedWeatherData = {
      city: data.city || undefined,
      country: data.country || undefined,
      condition: data.condition,
      temperatureC: data.temperatureC,
      temperatureRange: data.temperatureRange || undefined,
      temperatureUnit: data.temperatureUnit,
      feelsLike: data.feelsLike || undefined,
      feelsLikeTemp: data.feelsLikeTemp || undefined,
      wind: data.wind || undefined,
      windSpeed: data.windSpeed || undefined,
      windDirection: data.windDirection || undefined,
      windUnit: data.windUnit || undefined,
      precipitation: data.precipitation?.type
        ? {
            type: data.precipitation.type,
            intensity: data.precipitation.intensity || undefined,
            probability: data.precipitation.probability || undefined,
          }
        : undefined,
      description: data.description || text,
      language: data.language,
    };

    return result;
  } catch (error) {
    logger.error("Error al validar respuesta de Groq", { error });
    return null;
  }
}

/**
 * Parsea texto meteorológico usando Groq API
 */
async function parseWithGroq(text: string): Promise<ParsedWeatherData | null> {
  if (!groqClient) {
    logger.debug("Cliente Groq no disponible, usando fallback");
    return null;
  }

  const startTime = Date.now();

  try {
    const prompt = `Analiza el siguiente texto meteorológico en español y extrae la información en formato JSON.

Texto: "${text}"

Extrae y devuelve SOLO un objeto JSON válido con esta estructura exacta:
{
  "city": "nombre de la ciudad o null",
  "country": "nombre del país o null",
  "condition": "Condición principal (Soleado, Nublado, Muy nublado, Lluvia, Nieve, Tormenta)",
  "temperatureC": número (temperatura en Celsius, promedio si hay rango),
  "temperatureRange": {"min": número, "max": número} o null,
  "temperatureUnit": "C" o "F",
  "feelsLike": "descripción de sensación térmica o null",
  "feelsLikeTemp": número o null,
  "wind": "descripción del viento o null",
  "windSpeed": número o null,
  "windDirection": "dirección del viento o null",
  "windUnit": "km/h" o "mph" o null,
  "precipitation": {
    "type": "rain" o "snow" o "storm" o null,
    "intensity": "débil" o "moderado" o "fuerte" o null,
    "probability": número (0-100) o null
  } o null,
  "description": "el texto original completo"
}

IMPORTANTE:
- Si hay un rango de temperaturas (ej: "entre 1°C y 8°C"), calcula el promedio para temperatureC (4.5 en este caso)
- Si dice "alta probabilidad", usa 75% como probabilidad
- Si dice "baja probabilidad", usa 25% como probabilidad
- Si dice "probabilidad media", usa 50% como probabilidad
- Extrae TODA la información disponible, no omitas campos
- La condición principal debe ser la más relevante (ej: si dice "muy nublado, con chubascos", la condición es "Muy nublado", no "Lluvia")
- Devuelve SOLO el JSON, sin texto adicional antes o después`;

    logger.info("Iniciando parseo con Groq", {
      textLength: text.length,
      model: "qwen/qwen3-32b",
    });

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "qwen/qwen3-32b",
      temperature: 0.3,
      max_completion_tokens: 1024,
      top_p: 0.95,
      stream: false,
    });

    const responseContent =
      chatCompletion.choices[0]?.message?.content?.trim() || "";

    if (!responseContent) {
      logger.warn("Respuesta vacía de Groq");
      return null;
    }

    // Limpiar respuesta (remover markdown code blocks si existen)
    let cleanedContent = responseContent;
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parsear JSON
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      logger.warn("Error al parsear JSON de Groq", {
        error: parseError,
        content: cleanedContent.substring(0, 200),
      });
      return null;
    }

    // Validar y normalizar
    const validated = validateAndNormalizeGroqResponse(parsedData);
    if (!validated) {
      return null;
    }

    const processingTime = Date.now() - startTime;
    logger.info("Parseo con Groq completado exitosamente", {
      city: validated.city,
      condition: validated.condition,
      temperatureC: validated.temperatureC,
      hasPrecipitation: !!validated.precipitation,
      processingTimeMs: processingTime,
    });

    return validated;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    logger.warn("Error en parseo con Groq, usando fallback", {
      error: errorMessage,
      processingTimeMs: processingTime,
    });

    return null;
  }
}

/**
 * Parsea texto meteorológico en español a datos estructurados
 * Intenta primero con Groq, si falla usa parser determinista
 */
export async function parseWeatherText(
  text: string
): Promise<ParsedWeatherData> {
  logger.info("Iniciando parseo de texto meteorológico", {
    textLength: text.length,
  });

  // Intentar primero con Groq
  const groqResult = await parseWithGroq(text);
  if (groqResult) {
    logger.info("Parseo exitoso con Groq");
    return groqResult;
  }

  // Si Groq falla, usar parser determinista
  logger.info("Usando parser determinista como fallback");
  return parseWithDeterministic(text);
}
