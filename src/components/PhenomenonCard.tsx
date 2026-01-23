import React from "react";
import { getPrecipitationTypeName, getIntensityName, Language } from "../utils/i18n";
import { MOBILE_DESIGN, THEME } from "../utils/constants";
import { truncateText } from "../utils/layout";

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

  return (
    <div
      style={{
        opacity,
        background: THEME.COLORS.PHENOMENON_BACKGROUND,
        border: `1px solid ${THEME.COLORS.PHENOMENON_BORDER}`,
        borderRadius: MOBILE_DESIGN.CARD_RADIUS,
        padding: `${cardPadding}px ${cardPadding * 1.5}px`,
        fontSize: phenomenonFontSize,
        fontWeight: THEME.TEXT_STYLES.PHENOMENON_FONT_WEIGHT,
        display: "flex",
        flexDirection: "column",
        gap: THEME.SPACING.PHENOMENON_GAP,
        maxWidth: "85%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: THEME.SPACING.CARD_ICON_GAP, flexWrap: "wrap" }}>
        <span style={{ fontWeight: THEME.TEXT_STYLES.PHENOMENON_TYPE_FONT_WEIGHT, textTransform: THEME.STYLES.PHENOMENON_TEXT_TRANSFORM }}>
          {displayTypeName}
        </span>
        {probability !== undefined && (
          <span style={{ opacity: THEME.OPACITY.PHENOMENON_PROBABILITY, fontSize: phenomenonFontSize * 0.9 }}>
            {probability}%
          </span>
        )}
      </div>
      {displayIntensityName && (
        <div style={{ 
          opacity: THEME.OPACITY.PHENOMENON_INTENSITY, 
          fontSize: intensityFontSize, 
          textTransform: THEME.STYLES.PHENOMENON_TEXT_TRANSFORM,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}>
          {displayIntensityName}
        </div>
      )}
    </div>
  );
};