import { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { WeatherForecastProps } from "../components/WeatherForecast";
import { MOBILE_DESIGN, ADAPTIVE_LAYOUT } from "../utils/constants";
import {
  calculateHeroLayout,
  calculateCardLayout,
  calculatePhenomenonLayout,
  calculateDescriptionLayout,
  truncateCardValue,
} from "../utils/layout";
import { t, getPrecipitationTypeName } from "../utils/i18n";

/**
 * Hook que calcula todos los valores dinámicos de layout basados en las props
 * del componente WeatherForecast. Se actualiza cuando cambian las props.
 */
export function useAdaptiveLayout(props: WeatherForecastProps) {
  const { width, height } = useVideoConfig();

  return useMemo(() => {
    const {
      city,
      country,
      condition,
      temperatureC,
      feelsLike,
      feelsLikeTemp,
      wind,
      windSpeed,
      windDirection,
      windUnit = "km/h",
      language = "es",
      temperatureUnit = "C",
      precipitation,
    } = props;

    // Convertir temperatura para cálculos
    const displayTemp =
      temperatureUnit === "F" ? (temperatureC * 9) / 5 + 32 : temperatureC;
    const displayFeelsLike =
      feelsLikeTemp !== undefined
        ? temperatureUnit === "F"
          ? (feelsLikeTemp * 9) / 5 + 32
          : feelsLikeTemp
        : undefined;

    // Calcular espacio disponible (descontando padding)
    const availableWidth = width - MOBILE_DESIGN.PADDING_HORIZONTAL * 2;
    const availableHeight = height - MOBILE_DESIGN.PADDING_VERTICAL * 2;

    // === BLOQUE 1: Hero (Temperatura + Ciudad) ===
    const heroLayout = calculateHeroLayout(
      city,
      country,
      displayTemp,
      temperatureUnit,
      availableWidth,
      availableHeight * 0.4 // 40% del espacio vertical para el hero
    );

    // === BLOQUE 2: Tarjetas ===
    // Preparar datos de tarjetas para cálculo
    const cards = [
      {
        label: t("condition", language),
        value: condition,
      },
      {
        label: t("feelsLike", language),
        value:
          displayFeelsLike !== undefined
            ? `${Math.round(displayFeelsLike)}°${temperatureUnit}`
            : feelsLike || "-",
      },
      {
        label: t("wind", language),
        value:
          windSpeed !== undefined
            ? `${windSpeed} ${windUnit}${windDirection ? ` ${windDirection}` : ""}`
            : wind || "-",
      },
    ];

    const cardLayout = calculateCardLayout(
      cards,
      availableWidth,
      availableHeight * 0.5 // 50% del espacio vertical para las tarjetas
    );

    // Truncar valores de tarjetas si son muy largos
    const cardContentWidth =
      Math.min(availableWidth, MOBILE_DESIGN.MAX_CONTENT_WIDTH) -
      MOBILE_DESIGN.CARD_ICON_SIZE -
      cardLayout.cardPadding * 3;
    
    const processedCards = cards.map((card) => ({
      ...card,
      value: truncateCardValue(
        card.value,
        cardContentWidth,
        cardLayout.cardValueFontSize
      ),
    }));

    // === BLOQUE 3: Fenómenos ===
    let phenomenonLayout = null;
    if (precipitation?.type) {
      // Obtener el texto traducido del tipo de precipitación para cálculo de layout
      const typeName = getPrecipitationTypeName(precipitation.type, language);
      phenomenonLayout = calculatePhenomenonLayout(
        typeName,
        precipitation.intensity,
        availableWidth
      );
    }

    // === BLOQUE 4: Descripción completa ===
    let descriptionLayout = null;
    if (props.description) {
      descriptionLayout = calculateDescriptionLayout(
        props.description,
        availableWidth
      );
    }

    return {
      // Hero layout
      hero: {
        temperatureFontSize: heroLayout.temperatureFontSize,
        cityFontSize: heroLayout.cityFontSize,
        countryFontSize: heroLayout.countryFontSize,
        heroGap: heroLayout.heroGap,
        heroOffsetTop: heroLayout.heroOffsetTop,
      },
      // Card layout
      cards: {
        ...cardLayout,
        processedCards,
      },
      // Phenomenon layout
      phenomenon: phenomenonLayout,
      // Description layout
      description: descriptionLayout,
      // Espacios disponibles
      availableWidth,
      availableHeight,
    };
  }, [
    props.city,
    props.country,
    props.condition,
    props.temperatureC,
    props.feelsLike,
    props.feelsLikeTemp,
    props.wind,
    props.windSpeed,
    props.windDirection,
    props.windUnit,
    props.language,
    props.temperatureUnit,
    props.precipitation,
    props.description,
    width,
    height,
  ]);
}
