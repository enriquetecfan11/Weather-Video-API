/**
 * Utilidades para cálculo dinámico de layout adaptativo
 * Permite que el template se ajuste automáticamente a cualquier contenido
 */

import { MOBILE_DESIGN, ADAPTIVE_LAYOUT } from "./constants";

/**
 * Estima el ancho de un texto dado su tamaño de fuente y familia
 * Usa aproximaciones basadas en caracteres promedio
 */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
): number {
  // Aproximación: caracteres promedio ocupan ~0.6 del tamaño de fuente
  // Ajustado para Segoe UI que es ligeramente más ancha
  const avgCharWidth = fontSize * 0.65;
  return text.length * avgCharWidth;
}

/**
 * Calcula el tamaño de fuente óptimo para un texto dado
 * que quepa en el ancho máximo disponible
 */
export function calculateFontSize(
  text: string,
  maxWidth: number,
  minSize: number,
  maxSize: number,
  fontFamily?: string
): number {
  if (!text || maxWidth <= 0) return minSize;

  // Empezar con el tamaño máximo y reducir hasta que quepa
  let fontSize = maxSize;
  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const estimatedWidth = estimateTextWidth(text, fontSize, fontFamily);
    
    if (estimatedWidth <= maxWidth) {
      // Si cabe, verificar que no sea menor que el mínimo
      return Math.max(fontSize, minSize);
    }
    
    // Reducir el tamaño proporcionalmente
    fontSize = Math.max(fontSize * 0.9, minSize);
    iterations++;
  }

  return Math.max(fontSize, minSize);
}

/**
 * Trunca un texto inteligentemente manteniendo legibilidad
 * Intenta cortar en espacios para evitar cortes en medio de palabras
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (!text || text.length <= maxLength) return text;

  // Intentar cortar en el último espacio antes del límite
  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.7) {
    // Si hay un espacio razonablemente cerca, cortar ahí
    return truncated.substring(0, lastSpace) + suffix;
  }

  // Si no, cortar directamente
  return truncated + suffix;
}

/**
 * Calcula gaps dinámicos según el espacio disponible y la altura del contenido
 */
export function calculateOptimalGap(
  contentHeight: number,
  availableSpace: number,
  minGap: number,
  maxGap: number,
  numberOfGaps: number = 1
): number {
  if (numberOfGaps <= 0) return minGap;

  const spaceForGaps = availableSpace - contentHeight;
  const gapPerItem = spaceForGaps / numberOfGaps;

  // Asegurar que el gap esté dentro de los límites
  return Math.max(minGap, Math.min(maxGap, gapPerItem));
}

/**
 * Calcula la distribución del layout del bloque hero (temperatura + ciudad)
 */
export function calculateHeroLayout(
  city: string,
  country: string | undefined,
  temperature: number,
  temperatureUnit: "C" | "F",
  availableWidth: number,
  availableHeight: number
): {
  temperatureFontSize: number;
  cityFontSize: number;
  countryFontSize: number;
  heroGap: number;
  heroOffsetTop: number;
} {
  const padding = MOBILE_DESIGN.PADDING_HORIZONTAL * 2;
  const contentWidth = Math.min(availableWidth - padding, MOBILE_DESIGN.MAX_CONTENT_WIDTH);
  
  // Calcular tamaño de temperatura
  // Considerar número de dígitos y signo negativo
  const tempText = Math.round(temperature).toString();
  const tempWithUnit = `${tempText}°${temperatureUnit}`;
  
  // Temperatura debe ser grande pero ajustarse al ancho disponible
  const maxTempWidth = contentWidth * 0.95; // 95% del ancho para margen
  const temperatureFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_TEMPERATURE_FONT_SIZE,
    calculateFontSize(
      tempWithUnit,
      maxTempWidth,
      MOBILE_DESIGN.TEMPERATURE_FONT_SIZE * ADAPTIVE_LAYOUT.MIN_FONT_SIZE_RATIO,
      MOBILE_DESIGN.TEMPERATURE_FONT_SIZE * ADAPTIVE_LAYOUT.MAX_FONT_SIZE_RATIO,
    )
  );

  // Calcular tamaño de ciudad
  const cityText = city || "";
  const maxCityWidth = contentWidth * 0.9;
  const cityFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_CITY_FONT_SIZE,
    calculateFontSize(
      cityText,
      maxCityWidth,
      MOBILE_DESIGN.CITY_FONT_SIZE * ADAPTIVE_LAYOUT.MIN_FONT_SIZE_RATIO,
      MOBILE_DESIGN.CITY_FONT_SIZE * ADAPTIVE_LAYOUT.MAX_FONT_SIZE_RATIO,
    )
  );

  // País usa un ratio del tamaño de ciudad
  const countryFontSize = cityFontSize * ADAPTIVE_LAYOUT.COUNTRY_TO_CITY_RATIO;

  // Calcular altura total estimada del bloque hero
  const tempHeight = temperatureFontSize * 1.1; // line-height aproximado
  const cityHeight = cityFontSize * 1.2;
  const countryHeight = country ? countryFontSize * 1.2 : 0;
  const estimatedHeroHeight = tempHeight + cityHeight + countryHeight;

  // Calcular gap dinámico
  const spaceForGap = availableHeight * 0.1; // 10% del espacio disponible para gaps
  const heroGap = calculateOptimalGap(
    estimatedHeroHeight,
    availableHeight,
    MOBILE_DESIGN.HERO_GAP * 0.5, // Mínimo 50% del gap base
    MOBILE_DESIGN.HERO_GAP * 2,    // Máximo 200% del gap base
    1
  );

  // Calcular offset top para centrar mejor el contenido
  const totalHeroHeight = estimatedHeroHeight + heroGap;
  const heroOffsetTop = Math.max(
    MOBILE_DESIGN.HERO_OFFSET_TOP * 0.5, // Mínimo 50% del offset base
    (availableHeight - totalHeroHeight) * 0.3 // 30% del espacio restante
  );

  return {
    temperatureFontSize,
    cityFontSize,
    countryFontSize,
    heroGap,
    heroOffsetTop,
  };
}

/**
 * Calcula la distribución del layout de las tarjetas del bloque 2
 */
export function calculateCardLayout(
  cards: Array<{ label: string; value: string }>,
  availableWidth: number,
  availableHeight: number
): {
  cardValueFontSize: number;
  cardTitleFontSize: number;
  cardGap: number;
  cardPadding: number;
} {
  const padding = MOBILE_DESIGN.PADDING_HORIZONTAL * 2;
  const contentWidth = Math.min(availableWidth - padding, MOBILE_DESIGN.MAX_CONTENT_WIDTH);
  
  // Ancho disponible para cada tarjeta (descontando icono y padding)
  const iconWidth = MOBILE_DESIGN.CARD_ICON_SIZE;
  const basePadding = MOBILE_DESIGN.CARD_PADDING;
  const cardContentWidth = contentWidth - iconWidth - basePadding * 3; // padding izquierdo, derecho, gap con icono

  // Si no hay tarjetas, retornar valores por defecto
  if (cards.length === 0) {
    return {
      cardValueFontSize: MOBILE_DESIGN.CARD_VALUE_FONT_SIZE,
      cardTitleFontSize: MOBILE_DESIGN.CARD_VALUE_FONT_SIZE * ADAPTIVE_LAYOUT.CARD_TITLE_TO_VALUE_RATIO,
      cardGap: MOBILE_DESIGN.CARD_GAP,
      cardPadding: MOBILE_DESIGN.CARD_PADDING,
    };
  }

  // Encontrar el texto más largo en los valores
  const longestValue = cards.reduce((longest, card) => {
    return card.value.length > longest.length ? card.value : longest;
  }, "");

  // Calcular tamaño de fuente para valores
  const cardValueFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_CARD_VALUE_FONT_SIZE,
    calculateFontSize(
      longestValue,
      cardContentWidth * 0.95, // 95% del ancho disponible
      MOBILE_DESIGN.CARD_VALUE_FONT_SIZE * ADAPTIVE_LAYOUT.MIN_FONT_SIZE_RATIO,
      MOBILE_DESIGN.CARD_VALUE_FONT_SIZE * ADAPTIVE_LAYOUT.MAX_FONT_SIZE_RATIO,
    )
  );

  // Título usa un ratio del tamaño del valor
  const cardTitleFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_CARD_TITLE_FONT_SIZE,
    cardValueFontSize * ADAPTIVE_LAYOUT.CARD_TITLE_TO_VALUE_RATIO
  );

  // Calcular padding proporcional al tamaño de fuente
  const cardPadding = Math.max(
    MOBILE_DESIGN.CARD_PADDING * 0.7, // Mínimo 70%
    Math.min(
      MOBILE_DESIGN.CARD_PADDING * 1.3, // Máximo 130%
      cardValueFontSize * 0.625 // Proporcional al tamaño de fuente
    )
  );

  // Calcular gap entre tarjetas
  const numberOfCards = cards.length;
  const estimatedCardHeight = (cardValueFontSize * 1.2) + (cardTitleFontSize * 1.2) + (cardPadding * 2);
  const totalCardsHeight = estimatedCardHeight * numberOfCards;
  const spaceForGaps = availableHeight * 0.15; // 15% del espacio disponible para gaps

  const cardGap = calculateOptimalGap(
    totalCardsHeight,
    spaceForGaps + totalCardsHeight,
    MOBILE_DESIGN.CARD_GAP * 0.5, // Mínimo 50%
    MOBILE_DESIGN.CARD_GAP * 1.5, // Máximo 150%
    numberOfCards - 1 // Número de gaps entre tarjetas
  );

  return {
    cardValueFontSize,
    cardTitleFontSize,
    cardGap,
    cardPadding,
  };
}

/**
 * Calcula el tamaño de fuente para el bloque de fenómenos
 */
export function calculatePhenomenonLayout(
  type: string,
  intensity: string | undefined,
  availableWidth: number
): {
  phenomenonFontSize: number;
  intensityFontSize: number;
} {
  const padding = MOBILE_DESIGN.PADDING_HORIZONTAL * 2;
  const contentWidth = Math.min(availableWidth - padding, MOBILE_DESIGN.MAX_CONTENT_WIDTH);
  const cardPadding = MOBILE_DESIGN.CARD_PADDING * 1.5;
  const availableTextWidth = contentWidth * 0.85 - cardPadding * 2; // 85% del ancho, menos padding

  // Texto principal (tipo + probabilidad si existe)
  const mainText = type;
  const phenomenonFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_PHENOMENON_FONT_SIZE,
    calculateFontSize(
      mainText,
      availableTextWidth,
      MOBILE_DESIGN.PHENOMENON_FONT_SIZE * ADAPTIVE_LAYOUT.MIN_FONT_SIZE_RATIO,
      MOBILE_DESIGN.PHENOMENON_FONT_SIZE * ADAPTIVE_LAYOUT.MAX_FONT_SIZE_RATIO,
    )
  );

  // Intensidad usa un ratio del tamaño principal
  const intensityFontSize = phenomenonFontSize * ADAPTIVE_LAYOUT.INTENSITY_TO_PHENOMENON_RATIO;

  return {
    phenomenonFontSize,
    intensityFontSize,
  };
}

/**
 * Trunca el valor de una tarjeta si es demasiado largo
 */
export function truncateCardValue(
  value: string,
  maxWidth: number,
  fontSize: number
): string {
  const estimatedChars = Math.floor(maxWidth / (fontSize * 0.65));
  if (value.length <= estimatedChars) return value;
  
  return truncateText(value, estimatedChars);
}

/**
 * Calcula el layout para una descripción completa del clima
 */
export function calculateDescriptionLayout(
  description: string,
  availableWidth: number
): {
  descriptionFontSize: number;
  descriptionPadding: number;
} {
  const padding = MOBILE_DESIGN.PADDING_HORIZONTAL * 2;
  const contentWidth = Math.min(availableWidth - padding, MOBILE_DESIGN.MAX_CONTENT_WIDTH);
  const basePadding = 40; // THEME.SPACING.DESCRIPTION_PADDING
  const availableTextWidth = contentWidth * 0.9 - basePadding * 2; // 90% del ancho, menos padding

  // Calcular tamaño de fuente para que el texto quepa en múltiples líneas
  const descriptionFontSize = Math.max(
    ADAPTIVE_LAYOUT.MIN_DESCRIPTION_FONT_SIZE,
    calculateFontSize(
      description,
      availableTextWidth,
      MOBILE_DESIGN.DESCRIPTION_FONT_SIZE * ADAPTIVE_LAYOUT.MIN_FONT_SIZE_RATIO,
      MOBILE_DESIGN.DESCRIPTION_FONT_SIZE * ADAPTIVE_LAYOUT.MAX_FONT_SIZE_RATIO,
    )
  );

  // Padding proporcional al tamaño de fuente
  const descriptionPadding = Math.max(
    basePadding * 0.7,
    Math.min(basePadding * 1.3, descriptionFontSize * 0.67)
  );

  return {
    descriptionFontSize,
    descriptionPadding,
  };
}
