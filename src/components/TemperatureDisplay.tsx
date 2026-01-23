import React from "react";
import { THEME } from "../utils/constants";

export type TemperatureDisplayProps = {
  temperature: number;
  unit: "C" | "F";
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  maxWidth?: number;
};

export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  unit,
  fontSize = 120,
  fontWeight = 700,
  color = THEME.COLORS.PRIMARY_TEXT,
  maxWidth,
}) => {
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
      <span>{tempText}</span>
      <span style={{ fontSize: fontSize * 0.5, opacity: THEME.OPACITY.TEMPERATURE_UNIT }}>°{unit}</span>
    </div>
  );
};