import React from "react";
import { getPrecipitationTypeName, getIntensityName, Language } from "../utils/i18n";
import { MOBILE_DESIGN, THEME } from "../utils/constants";
import { truncateText } from "../utils/layout";
import { WeatherIcon } from "./WeatherIcon";

export type PhenomenonCardProps = {
  type: "rain" | "snow" | "storm" | null;
  intensity?: string;
  probability?: number;
  language?: Language;
  opacity?: number;
  phenomenonFontSize?: number;
  intensityFontSize?: number;
};

export const PhenomenonCard: React.FC<PhenomenonCardProps> = ({
  type,
  intensity,
  probability,
  language = "es",
  opacity = 1,
  phenomenonFontSize = MOBILE_DESIGN.PHENOMENON_FONT_SIZE,
  intensityFontSize = MOBILE_DESIGN.PHENOMENON_FONT_SIZE * 0.85,
}) => {
  if (!type) return null;

  const typeName = getPrecipitationTypeName(type, language);
  const intensityName = getIntensityName(intensity, language);

  // Calcular padding proporcional al tamaño de fuente
  const cardPadding = Math.max(
    MOBILE_DESIGN.CARD_PADDING * 0.7,
    Math.min(MOBILE_DESIGN.CARD_PADDING * 1.3, phenomenonFontSize * 0.4)
  );

  // Estimar ancho disponible para truncamiento si es necesario
  const maxWidth = MOBILE_DESIGN.MAX_CONTENT_WIDTH * 0.85;
  const availableTextWidth = maxWidth - cardPadding * 3; // padding izquierdo, derecho, margen

  // Truncar tipo si es muy largo (considerando probabilidad)
  const typeWithProbability = probability !== undefined 
    ? `${typeName} ${probability}%`
    : typeName;
  const estimatedTypeWidth = typeName.length * (phenomenonFontSize * 0.65);
  const displayTypeName = estimatedTypeWidth > availableTextWidth * 0.8
    ? truncateText(typeName, Math.floor(availableTextWidth / (phenomenonFontSize * 0.65)))
    : typeName;

  // Truncar intensidad si es muy larga
  const estimatedIntensityWidth = intensityName ? intensityName.length * (intensityFontSize * 0.65) : 0;
  const displayIntensityName = intensityName && estimatedIntensityWidth > availableTextWidth
    ? truncateText(intensityName, Math.floor(availableTextWidth / (intensityFontSize * 0.65)))
    : intensityName;

  // Determinar el nombre de la condición para el icono
  const conditionForIcon = type === "rain" ? "lluvia" : type === "snow" ? "nieve" : "tormenta";
  const iconSize = Math.max(phenomenonFontSize * 1.5, 80);

  return (
    <div
      style={{
        opacity,
        background: THEME.COLORS.PHENOMENON_BACKGROUND,
        border: `2px solid ${THEME.COLORS.PHENOMENON_BORDER}`,
        borderRadius: MOBILE_DESIGN.CARD_RADIUS * 1.2,
        padding: `${cardPadding * 1.2}px ${cardPadding * 1.8}px`,
        fontSize: phenomenonFontSize,
        fontWeight: THEME.TEXT_STYLES.PHENOMENON_FONT_WEIGHT,
        display: "flex",
        flexDirection: "column",
        gap: THEME.SPACING.PHENOMENON_GAP * 1.5,
        maxWidth: "90%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Icono grande centrado */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: THEME.SPACING.PHENOMENON_GAP,
        }}
      >
        <WeatherIcon condition={conditionForIcon} size={iconSize} color={THEME.COLORS.PRIMARY_TEXT} />
      </div>

      {/* Tipo y probabilidad */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: THEME.SPACING.CARD_ICON_GAP * 1.5,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontWeight: THEME.TEXT_STYLES.PHENOMENON_TYPE_FONT_WEIGHT,
            textTransform: THEME.STYLES.PHENOMENON_TEXT_TRANSFORM,
            fontSize: phenomenonFontSize * 1.1,
            letterSpacing: "0.5px",
          }}
        >
          {displayTypeName}
        </span>
        {probability !== undefined && (
          <span
            style={{
              opacity: THEME.OPACITY.PHENOMENON_PROBABILITY,
              fontSize: phenomenonFontSize,
              background: "rgba(148, 163, 184, 0.2)",
              padding: "4px 12px",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            {probability}%
          </span>
        )}
      </div>

      {/* Intensidad */}
      {displayIntensityName && (
        <div
          style={{
            opacity: THEME.OPACITY.PHENOMENON_INTENSITY,
            fontSize: intensityFontSize,
            textTransform: THEME.STYLES.PHENOMENON_TEXT_TRANSFORM,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            textAlign: "center",
            color: THEME.COLORS.SECONDARY_TEXT,
          }}
        >
          {displayIntensityName}
        </div>
      )}
    </div>
  );
};