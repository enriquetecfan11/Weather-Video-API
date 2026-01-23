import type { WeatherForecastProps } from "../components/WeatherForecast";

/**
 * Configuración de animaciones spring
 */
export const SPRING_CONFIG = {
  damping: 200,
  mass: 0.8,
} as const;

/**
 * Offsets de tiempo para animaciones (en segundos)
 * Estructura narrativa: Bloque 1 (0-4s) → Bloque 2 (4-9s) → Bloque 3 (9-13s) → Outro (13-15s)
 */
export const TIMING = {
  // Bloque 1: Impacto inicial (temperatura + ciudad)
  BLOCK_1_START: 0,
  BLOCK_1_DURATION: 4,
  BLOCK_1_FADEOUT: 0.5,
  BLOCK_1_INTRO_DURATION: 0.6,
  BLOCK_1_TEMP_DELAY: 0.3,
  BLOCK_1_TEMP_ANIMATION_DURATION: 0.8,

  // Bloque 2: Contexto humano (condición, sensación, viento)
  BLOCK_2_START: 3.5, // Overlap con fade out de bloque 1
  BLOCK_2_DURATION: 5.5,
  BLOCK_2_FADEOUT: 0.5,
  BLOCK_2_INTRO_DURATION: 0.6,
  BLOCK_2_CARD_STAGGER: 0.15,
  BLOCK_2_CARD_ANIMATION_DURATION: 0.5,

  // Bloque 3: Fenómenos condicionales (precipitaciones)
  BLOCK_3_START: 9,
  BLOCK_3_DURATION: 4,
  BLOCK_3_INTRO_DURATION: 0.6,
  
  // Bloque 4: Descripción completa (opcional, después de fenómenos o bloque 2)
  BLOCK_4_START: 12,
  BLOCK_4_DURATION: 3,
  BLOCK_4_INTRO_DURATION: 0.6,

  // Outro/Cierre
  OUTRO_START: 15,
  OUTRO_DURATION: 2,

  // Nubes
  CLOUD_DRIFT_DURATION: 15,
  CLOUD_DRIFT_DISTANCE: -120,
} as const;

/**
 * Constantes de diseño móvil (formato vertical 1080x1920)
 */
export const MOBILE_DESIGN = {
  PADDING_HORIZONTAL: 40,
  PADDING_VERTICAL: 40,
  HERO_OFFSET_TOP: 280, // Tercio superior aproximado (1920/3 ≈ 640, menos espacio para contenido)
  HERO_GAP: 16,
  SECTION_GAP: 24,
  MAX_CONTENT_WIDTH: 800,
  TEMPERATURE_FONT_SIZE: 750, // Más grande para impacto visual
  CITY_FONT_SIZE: 240,
  CONDITION_FONT_SIZE: 150,
  CARD_TITLE_FONT_SIZE: 50,
  CARD_VALUE_FONT_SIZE: 80,
  CARD_PADDING: 50,
  CARD_GAP: 90,
  CARD_RADIUS: 40,
  CARD_ICON_SIZE: 180,
  PHENOMENON_FONT_SIZE: 120,
  DESCRIPTION_FONT_SIZE: 85, // Tamaño base para descripciones completas (aumentado)
} as const;

/**
 * Constantes para layout adaptativo
 */
export const ADAPTIVE_LAYOUT = {
  // Ratios de escalado de fuente
  MIN_FONT_SIZE_RATIO: 0.5, // Mínimo 50% del tamaño base
  MAX_FONT_SIZE_RATIO: 1.3, // Máximo 130% del tamaño base
  
  // Umbrales para truncamiento
  TEXT_OVERFLOW_THRESHOLD: 0.9, // 90% del ancho disponible
  
  // Dimensiones del viewport
  VIEWPORT_WIDTH: 1080,
  VIEWPORT_HEIGHT: 1920,
  
  // Tamaños mínimos garantizados para legibilidad
  MIN_TEMPERATURE_FONT_SIZE: 400,
  MIN_CITY_FONT_SIZE: 100,
  MIN_CARD_VALUE_FONT_SIZE: 40,
  MIN_CARD_TITLE_FONT_SIZE: 30,
  MIN_PHENOMENON_FONT_SIZE: 60,
  MIN_DESCRIPTION_FONT_SIZE: 55, // Aumentado para mejor legibilidad
  
  // Ratios de tamaño entre elementos relacionados
  COUNTRY_TO_CITY_RATIO: 0.55, // País es 55% del tamaño de ciudad
  CARD_TITLE_TO_VALUE_RATIO: 0.625, // Título es 62.5% del valor (50/80)
  INTENSITY_TO_PHENOMENON_RATIO: 0.85, // Intensidad es 85% del fenómeno
} as const;

/**
 * Configuración de estilos y tema (parametrizable)
 */
export const THEME = {
  // Colores principales
  COLORS: {
    // Texto
    PRIMARY_TEXT: "#f8fafc",
    SECONDARY_TEXT: "#94a3b8",
    
    // Fondos - Mejorado con gradiente más rico y múltiples capas
    BACKGROUND_GRADIENT: "linear-gradient(180deg, #0a0f1a 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)",
    BACKGROUND_RADIAL_1: "radial-gradient(circle at 50% 15%, rgba(59, 130, 246, 0.35), transparent 60%)",
    BACKGROUND_RADIAL_2: "radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.2), transparent 70%)",
    BACKGROUND_RADIAL_3: "radial-gradient(circle at 70% 85%, rgba(148, 163, 184, 0.3), transparent 65%)",
    
    // Tarjetas
    CARD_BACKGROUND: "rgba(15, 23, 42, 0.5)",
    CARD_BORDER: "rgba(148, 163, 184, 0.3)",
    
    // Fenómenos
    PHENOMENON_BACKGROUND: "rgba(248, 250, 252, 0.1)",
    PHENOMENON_BORDER: "rgba(148, 163, 184, 0.3)",
    
    // Descripción completa
    DESCRIPTION_BACKGROUND: "rgba(15, 23, 42, 0.4)",
    DESCRIPTION_BORDER: "rgba(148, 163, 184, 0.25)",
    
    // Outro
    OUTRO_BACKGROUND: "rgba(15, 23, 42, 0)",
  },
  
  // Fuentes
  FONT_FAMILY: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  
  // Opacidades
  OPACITY: {
    COUNTRY_TEXT: 0.75,
    CARD_ICON: 0.8,
    TEMPERATURE_UNIT: 0.8,
    PHENOMENON_PROBABILITY: 0.7,
    PHENOMENON_INTENSITY: 0.8,
    BACKGROUND_RADIAL: 0.9,
    DESCRIPTION_TEXT: 0.95,
  },
  
  // Estilos de texto
  TEXT_STYLES: {
    CITY_FONT_WEIGHT: 600,
    COUNTRY_FONT_WEIGHT: 400,
    CARD_TITLE_FONT_WEIGHT: 400,
    CARD_VALUE_FONT_WEIGHT: 500,
    PHENOMENON_FONT_WEIGHT: 500,
    PHENOMENON_TYPE_FONT_WEIGHT: 600,
    DESCRIPTION_FONT_WEIGHT: 400,
  },
  
  // Espaciados adicionales
  SPACING: {
    COUNTRY_MARGIN_TOP: 6,
    CARD_TITLE_MARGIN_BOTTOM: 6,
    CARD_ICON_GAP: 12,
    PHENOMENON_GAP: 6,
    TEMPERATURE_GAP_MIN: 4,
    TEMPERATURE_GAP_MAX: 12,
    DESCRIPTION_PADDING: 60, // Aumentado para mejor espaciado
    DESCRIPTION_LINE_HEIGHT: 1.5,
  },
  
  // Otros estilos
  STYLES: {
    CARD_TITLE_LETTER_SPACING: 1,
    CARD_TITLE_TEXT_TRANSFORM: "uppercase" as const,
    PHENOMENON_TEXT_TRANSFORM: "capitalize" as const,
  },
} as const;

/**
 * Props por defecto para WeatherForecast
 */
export const DEFAULT_WEATHER_FORECAST_PROPS: WeatherForecastProps = {
  city: "Mondéjar",
  country: "España",
  condition: "Muy nublado",
  temperatureC: 4.5,
  feelsLike: "Sensación más fría",
  feelsLikeTemp: 2,
  wind: "Viento moderado",
  windSpeed: 18,
  windDirection: "Suroeste",
  language: "es",
  temperatureUnit: "C",
  windUnit: "km/h",
  precipitation: {
    type: "rain",
    intensity: "débil",
    probability: 75,
  },
  description: "Hoy en Mondéjar: muy nublado, con chubascos débiles, temperaturas entre 1 °C y 8 °C y viento moderado, con alta probabilidad de precipitación",
};
