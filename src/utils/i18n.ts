/**
 * Sistema de internacionalización para el vídeo meteorológico
 */

export type Language = "es" | "en" | "fr" | "de";

type Translations = {
  condition: string;
  tempMax: string;
  tempMin: string;
  temperatureRange: string;
  feelsLike: string;
  wind: string;
  windSpeed: string;
  precipitation: string;
  probability: string;
  intensity: string;
  rain: string;
  snow: string;
  storm: string;
  weak: string;
  moderate: string;
  strong: string;
};

const translations: Record<Language, Translations> = {
  es: {
    condition: "Condición",
    tempMax: "Máxima",
    tempMin: "Mínima",
    temperatureRange: "Rango",
    feelsLike: "Sensación",
    wind: "Viento",
    windSpeed: "Velocidad",
    precipitation: "Precipitación",
    probability: "Probabilidad",
    intensity: "Intensidad",
    rain: "Lluvia",
    snow: "Nieve",
    storm: "Tormenta",
    weak: "débil",
    moderate: "moderada",
    strong: "fuerte",
  },
  en: {
    condition: "Condition",
    tempMax: "Max",
    tempMin: "Min",
    temperatureRange: "Range",
    feelsLike: "Feels like",
    wind: "Wind",
    windSpeed: "Speed",
    precipitation: "Precipitation",
    probability: "Probability",
    intensity: "Intensity",
    rain: "Rain",
    snow: "Snow",
    storm: "Storm",
    weak: "weak",
    moderate: "moderate",
    strong: "strong",
  },
  fr: {
    condition: "Condition",
    tempMax: "Maximale",
    tempMin: "Minimale",
    temperatureRange: "Plage",
    feelsLike: "Ressenti",
    wind: "Vent",
    windSpeed: "Vitesse",
    precipitation: "Précipitation",
    probability: "Probabilité",
    intensity: "Intensité",
    rain: "Pluie",
    snow: "Neige",
    storm: "Tempête",
    weak: "faible",
    moderate: "modérée",
    strong: "forte",
  },
  de: {
    condition: "Bedingung",
    tempMax: "Maximum",
    tempMin: "Minimum",
    temperatureRange: "Bereich",
    feelsLike: "Gefühlt",
    wind: "Wind",
    windSpeed: "Geschwindigkeit",
    precipitation: "Niederschlag",
    probability: "Wahrscheinlichkeit",
    intensity: "Intensität",
    rain: "Regen",
    snow: "Schnee",
    storm: "Sturm",
    weak: "schwach",
    moderate: "mäßig",
    strong: "stark",
  },
};

/**
 * Obtiene una traducción para el idioma especificado
 */
export function t(key: keyof Translations, lang: Language = "es"): string {
  return translations[lang]?.[key] || translations.es[key];
}

/**
 * Obtiene el nombre del tipo de precipitación traducido
 */
export function getPrecipitationTypeName(
  type: "rain" | "snow" | "storm" | null,
  lang: Language = "es"
): string {
  if (!type) return "";
  return t(type, lang);
}

/**
 * Obtiene el nombre de la intensidad traducido
 */
export function getIntensityName(
  intensity: string | undefined,
  lang: Language = "es"
): string {
  if (!intensity || typeof intensity !== 'string') return "";
  const intensityKey = intensity.toLowerCase() as "weak" | "moderate" | "strong";
  return t(intensityKey, lang);
}