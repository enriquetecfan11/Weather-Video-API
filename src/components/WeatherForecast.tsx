import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cloud } from "./Cloud";
import { TemperatureDisplay } from "./TemperatureDisplay";
import { WeatherIcon } from "./WeatherIcon";
import { PhenomenonCard } from "./PhenomenonCard";
import { clamp } from "../utils/animations";
import { SPRING_CONFIG, TIMING, MOBILE_DESIGN, THEME } from "../utils/constants";
import { t, Language } from "../utils/i18n";
import { useAdaptiveLayout } from "../hooks/useAdaptiveLayout";

export type WeatherForecastProps = {
  city: string;
  country?: string;
  condition: string;
  temperatureC: number;
  feelsLike?: string;
  feelsLikeTemp?: number;
  wind?: string;
  windSpeed?: number;
  windDirection?: string;
  windUnit?: "km/h" | "mph";
  language?: Language;
  temperatureUnit?: "C" | "F";
  precipitation?: {
    type: "rain" | "snow" | "storm" | null;
    intensity?: string;
    probability?: number;
  };
  description?: string; // Descripción completa del clima (ej: "Hoy en Mondéjar: muy nublado, con chubascos débiles...")
};

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
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
  description,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Obtener layout adaptativo calculado
  const adaptiveLayout = useAdaptiveLayout({
    city,
    country,
    condition,
    temperatureC,
    feelsLike,
    feelsLikeTemp,
    wind,
    windSpeed,
    windDirection,
    windUnit,
    language,
    temperatureUnit,
    precipitation,
    description,
  });

  // Convertir temperatura si es necesario
  const displayTemp =
    temperatureUnit === "F" ? (temperatureC * 9) / 5 + 32 : temperatureC;
  const displayFeelsLike =
    feelsLikeTemp !== undefined
      ? temperatureUnit === "F"
        ? (feelsLikeTemp * 9) / 5 + 32
        : feelsLikeTemp
      : undefined;

  // Animaciones del Bloque 1 (0-4s): Temperatura + Ciudad
  const block1Start = TIMING.BLOCK_1_START * fps;
  const block1End = (TIMING.BLOCK_1_START + TIMING.BLOCK_1_DURATION) * fps;
  const block1FadeOutStart = block1End - TIMING.BLOCK_1_FADEOUT * fps;

  const block1IntroOpacity = interpolate(
    frame,
    [block1Start, block1Start + TIMING.BLOCK_1_INTRO_DURATION * fps],
    [0, 1],
    clamp
  );

  const tempScale = spring({
    frame: frame - TIMING.BLOCK_1_TEMP_DELAY * fps,
    fps,
    config: SPRING_CONFIG,
  });

  const cityY = interpolate(
    frame,
    [block1Start, block1Start + TIMING.BLOCK_1_TEMP_ANIMATION_DURATION * fps],
    [20, 0],
    clamp
  );

  const block1FadeOut = interpolate(
    frame,
    [block1FadeOutStart, block1End],
    [1, 0],
    clamp
  );

  const block1Opacity = frame < block1FadeOutStart ? block1IntroOpacity : block1FadeOut;

  // Animaciones del Bloque 2 (3.5-9s): Condición, Sensación, Viento
  const block2Start = TIMING.BLOCK_2_START * fps;
  const block2End = (TIMING.BLOCK_2_START + TIMING.BLOCK_2_DURATION) * fps;
  const block2FadeOutStart = block2End - TIMING.BLOCK_2_FADEOUT * fps;

  const block2IntroOpacity = interpolate(
    frame,
    [block2Start, block2Start + TIMING.BLOCK_2_INTRO_DURATION * fps],
    [0, 1],
    clamp
  );

  const block2FadeOut = interpolate(
    frame,
    [block2FadeOutStart, block2End],
    [1, 0],
    clamp
  );

  const block2Opacity = frame < block2FadeOutStart ? block2IntroOpacity : block2FadeOut;

  // Animación escalonada de las tarjetas del bloque 2
  const getCardAnimation = (index: number) => {
    const cardStart = block2Start + index * TIMING.BLOCK_2_CARD_STAGGER * fps;
    const cardEnd = cardStart + TIMING.BLOCK_2_CARD_ANIMATION_DURATION * fps;
    const cardY = interpolate(frame, [cardStart, cardEnd], [30, 0], clamp);
    const cardOpacity = interpolate(
      frame,
      [cardStart, cardStart + 0.3 * fps],
      [0, 1],
      clamp
    );
    return { cardY, cardOpacity };
  };

  // Animaciones del Bloque 3 (9-13s): Fenómenos (condicional)
  const block3Start = TIMING.BLOCK_3_START * fps;
  const block3End = (TIMING.BLOCK_3_START + TIMING.BLOCK_3_DURATION) * fps;

  const block3Opacity = interpolate(
    frame,
    [block3Start, block3Start + TIMING.BLOCK_3_INTRO_DURATION * fps],
    [0, 1],
    clamp
  );

  // Animaciones del Bloque 4 (12-18s): Descripción completa (condicional)
  const block4Start = TIMING.BLOCK_4_START * fps;
  const block4End = (TIMING.BLOCK_4_START + TIMING.BLOCK_4_DURATION) * fps;

  const block4Opacity = interpolate(
    frame,
    [block4Start, block4Start + TIMING.BLOCK_4_INTRO_DURATION * fps],
    [0, 1],
    clamp
  );

  // Outro (15-17s)
  const outroStart = TIMING.OUTRO_START * fps;
  const outroOpacity = interpolate(
    frame,
    [outroStart, outroStart + TIMING.OUTRO_DURATION * fps],
    [1, 0],
    clamp
  );

  // Animación de nubes
  const drift = interpolate(
    frame,
    [0, TIMING.CLOUD_DRIFT_DURATION * fps],
    [0, TIMING.CLOUD_DRIFT_DISTANCE],
    clamp
  );

  // Usar tarjetas procesadas del layout adaptativo (con valores truncados si es necesario)
  const cards = adaptiveLayout.cards.processedCards.map((card, index) => ({
    ...card,
    icon: index === 0 ? (
      <WeatherIcon condition={condition} size={MOBILE_DESIGN.CARD_ICON_SIZE} />
    ) : undefined,
  }));

  return (
    <AbsoluteFill
      style={{
        background: THEME.COLORS.BACKGROUND_GRADIENT,
        color: THEME.COLORS.PRIMARY_TEXT,
        fontFamily: THEME.FONT_FAMILY,
        padding: `${MOBILE_DESIGN.PADDING_VERTICAL}px ${MOBILE_DESIGN.PADDING_HORIZONTAL}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Capas de fondo con gradientes radiales mejorados */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: THEME.COLORS.BACKGROUND_RADIAL_1,
          opacity: THEME.OPACITY.BACKGROUND_RADIAL,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: THEME.COLORS.BACKGROUND_RADIAL_2,
          opacity: THEME.OPACITY.BACKGROUND_RADIAL * 0.8,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: THEME.COLORS.BACKGROUND_RADIAL_3,
          opacity: THEME.OPACITY.BACKGROUND_RADIAL * 0.7,
          zIndex: 0,
        }}
      />

      {/* Capa de nubes - reposicionadas para formato vertical */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          zIndex: 1,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Cloud left={200} top={-40} scale={0.6} drift={Math.max(drift * 0.4, -80)} />
        <Cloud left={700} top={-60} scale={0.5} drift={Math.max(drift * 0.3, -60)} />
      </div>

      {/* Contenido principal */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100%",
          width: "100%",
          paddingTop: adaptiveLayout.hero.heroOffsetTop,
          paddingBottom: MOBILE_DESIGN.PADDING_VERTICAL,
          paddingLeft: MOBILE_DESIGN.PADDING_HORIZONTAL,
          paddingRight: MOBILE_DESIGN.PADDING_HORIZONTAL,
          boxSizing: "border-box",
        }}
      >
        {/* BLOQUE 1: Impacto inicial - Temperatura + Ciudad (0-4s) */}
        <Sequence from={block1Start} durationInFrames={block1End - block1Start}>
          <div
            style={{
              opacity: block1Opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: MOBILE_DESIGN.MAX_CONTENT_WIDTH,
              margin: "0 auto",
              gap: adaptiveLayout.hero.heroGap,
              textAlign: "center",
            }}
          >
            {/* Temperatura */}
            <div
              style={{
                transform: `scale(${0.95 + tempScale * 0.05})`,
                transformOrigin: "center",
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <TemperatureDisplay
                temperature={displayTemp}
                unit={temperatureUnit}
                fontSize={adaptiveLayout.hero.temperatureFontSize}
              />
            </div>

            {/* Ciudad */}
            <div
              style={{
                transform: `translateY(${cityY}px)`,
                fontSize: adaptiveLayout.hero.cityFontSize,
                fontWeight: 600,
                lineHeight: 1.2,
                width: "100%",
                textAlign: "center",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              <span style={{ display: "block" }}>{city}</span>
              {country && (
                <span
                  style={{
                    display: "block",
                    fontSize: adaptiveLayout.hero.countryFontSize,
                    opacity: THEME.OPACITY.COUNTRY_TEXT,
                    marginTop: THEME.SPACING.COUNTRY_MARGIN_TOP,
                    fontWeight: THEME.TEXT_STYLES.COUNTRY_FONT_WEIGHT,
                  }}
                >
                  {country}
                </span>
              )}
            </div>
          </div>
        </Sequence>

        {/* BLOQUE 2: Contexto humano - Condición, Sensación, Viento (3.5-9s) */}
        <Sequence from={block2Start} durationInFrames={block2End - block2Start}>
          <div
            style={{
              opacity: block2Opacity,
              display: "flex",
              flexDirection: "column",
              gap: adaptiveLayout.cards.cardGap,
              width: "100%",
              maxWidth: MOBILE_DESIGN.MAX_CONTENT_WIDTH,
              marginTop: MOBILE_DESIGN.SECTION_GAP,
              marginLeft: "auto",
              marginRight: "auto",
              alignSelf: "center",
            }}
          >
            {cards.map((card, index) => {
              const { cardY, cardOpacity } = getCardAnimation(index);
              return (
                <div
                  key={card.label}
                  style={{
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                    background: THEME.COLORS.CARD_BACKGROUND,
                    border: `1px solid ${THEME.COLORS.CARD_BORDER}`,
                    borderRadius: MOBILE_DESIGN.CARD_RADIUS,
                    padding: adaptiveLayout.cards.cardPadding,
                    display: "flex",
                    alignItems: "center",
                    gap: THEME.SPACING.CARD_ICON_GAP,
                  }}
                >
                  {card.icon && (
                    <div style={{ flexShrink: 0, opacity: THEME.OPACITY.CARD_ICON }}>{card.icon}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: adaptiveLayout.cards.cardTitleFontSize,
                        textTransform: THEME.STYLES.CARD_TITLE_TEXT_TRANSFORM,
                        letterSpacing: THEME.STYLES.CARD_TITLE_LETTER_SPACING,
                        color: THEME.COLORS.SECONDARY_TEXT,
                        marginBottom: THEME.SPACING.CARD_TITLE_MARGIN_BOTTOM,
                        fontWeight: THEME.TEXT_STYLES.CARD_TITLE_FONT_WEIGHT,
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      style={{
                        fontSize: adaptiveLayout.cards.cardValueFontSize,
                        fontWeight: THEME.TEXT_STYLES.CARD_VALUE_FONT_WEIGHT,
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {card.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Sequence>

        {/* BLOQUE 3: Fenómenos condicionales (9-13s) */}
        {precipitation?.type && adaptiveLayout.phenomenon && (
          <Sequence from={block3Start} durationInFrames={block3End - block3Start}>
            <div
              style={{
                opacity: block3Opacity,
                marginTop: MOBILE_DESIGN.SECTION_GAP,
                display: "flex",
                justifyContent: "center",
                width: "100%",
                maxWidth: MOBILE_DESIGN.MAX_CONTENT_WIDTH,
                alignSelf: "center",
              }}
            >
              <PhenomenonCard
                type={precipitation.type}
                intensity={precipitation.intensity}
                probability={precipitation.probability}
                language={language}
                opacity={block3Opacity}
                phenomenonFontSize={adaptiveLayout.phenomenon.phenomenonFontSize}
                intensityFontSize={adaptiveLayout.phenomenon.intensityFontSize}
              />
            </div>
          </Sequence>
        )}

        {/* BLOQUE 4: Descripción completa (12-15s) - Centrado en pantalla */}
        {description && adaptiveLayout.description && (
          <Sequence from={block4Start} durationInFrames={block4End - block4Start}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: block4Opacity,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: MOBILE_DESIGN.MAX_CONTENT_WIDTH,
                paddingLeft: MOBILE_DESIGN.PADDING_HORIZONTAL,
                paddingRight: MOBILE_DESIGN.PADDING_HORIZONTAL,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  background: THEME.COLORS.DESCRIPTION_BACKGROUND,
                  border: `1px solid ${THEME.COLORS.DESCRIPTION_BORDER}`,
                  borderRadius: MOBILE_DESIGN.CARD_RADIUS,
                  padding: adaptiveLayout.description.descriptionPadding,
                  fontSize: adaptiveLayout.description.descriptionFontSize,
                  fontWeight: THEME.TEXT_STYLES.DESCRIPTION_FONT_WEIGHT,
                  lineHeight: THEME.SPACING.DESCRIPTION_LINE_HEIGHT,
                  color: THEME.COLORS.PRIMARY_TEXT,
                  opacity: THEME.OPACITY.DESCRIPTION_TEXT * block4Opacity,
                  textAlign: "center",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  width: "100%",
                }}
              >
                {description}
              </div>
            </div>
          </Sequence>
        )}

        {/* Outro: Fade out final (18-22s) */}
        {frame >= outroStart && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: THEME.COLORS.OUTRO_BACKGROUND,
              opacity: 1 - outroOpacity,
              zIndex: 100,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};