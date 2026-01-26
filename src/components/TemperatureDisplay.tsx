import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME, SPRING_CONFIGS } from "../utils/constants";
import { clamp } from "../utils/animations";

export type TemperatureDisplayProps = {
  temperature: number;
  unit: "C" | "F";
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  maxWidth?: number;
  delay?: number;
};

export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  unit,
  fontSize = 120,
  fontWeight = 700,
  color = THEME.COLORS.PRIMARY_TEXT,
  maxWidth,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación del número (aparece primero)
  const numberProgress = spring({
    fps,
    frame: frame - delay * fps,
    config: SPRING_CONFIGS.DRAMATIC,
    durationInFrames: 30,
  });

  const numberOpacity = interpolate(
    frame,
    [(delay * fps), (delay * fps) + 15],
    [0, 1],
    clamp
  );

  const numberScale = interpolate(
    numberProgress,
    [0, 1],
    [0.8, 1],
    clamp
  );

  // Animación de la unidad (aparece después con delay)
  const unitDelay = delay + 0.15; // 0.15s después del número
  const unitProgress = spring({
    fps,
    frame: frame - unitDelay * fps,
    config: SPRING_CONFIGS.SMOOTH,
    durationInFrames: 20,
  });

  const unitOpacity = interpolate(
    frame,
    [(unitDelay * fps), (unitDelay * fps) + 10],
    [0, 1],
    clamp
  );

  const unitScale = interpolate(
    unitProgress,
    [0, 1],
    [0.9, 1],
    clamp
  );

  // Calcular gap dinámico basado en el tamaño de fuente
  // Gap más pequeño para fuentes grandes, más grande para fuentes pequeñas
  const gap = Math.max(
    THEME.SPACING.TEMPERATURE_GAP_MIN,
    Math.min(THEME.SPACING.TEMPERATURE_GAP_MAX, fontSize * 0.01)
  );

  // Asegurar que el número se redondee correctamente
  const roundedTemp = Math.round(temperature);
  const tempText = roundedTemp.toString();

  // Estilos del contenedor
  const containerStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    lineHeight: 1,
    color,
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap,
    width: "100%",
  };

  // Si se proporciona maxWidth, aplicarlo
  if (maxWidth) {
    containerStyle.maxWidth = maxWidth;
    containerStyle.width = "auto";
  }

  return (
    <div style={containerStyle}>
      <span
        style={{
          opacity: numberOpacity,
          transform: `scale(${numberScale})`,
          display: "inline-block",
        }}
      >
        {tempText}
      </span>
      <span
        style={{
          fontSize: fontSize * 0.5,
          opacity: THEME.OPACITY.TEMPERATURE_UNIT * unitOpacity,
          transform: `scale(${unitScale})`,
          display: "inline-block",
        }}
      >
        °{unit}
      </span>
    </div>
  );
};