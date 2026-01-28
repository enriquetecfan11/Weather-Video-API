import React from "react";
import { THEME } from "../utils/constants";

export type WeatherIconProps = {
  condition: string;
  size?: number;
  color?: string;
};

/**
 * Iconos SVG simples para condiciones meteorológicas
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 32,
  color = THEME.COLORS.PRIMARY_TEXT,
}) => {
  if (!condition || typeof condition !== 'string') {
    // Retornar icono por defecto si condition no es válido
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          fill={color}
          opacity={0.7}
        />
      </svg>
    );
  }

  const conditionLower = condition.toLowerCase();

  // Sol
  if (conditionLower.includes("soleado") || conditionLower.includes("sunny") || conditionLower.includes("clear")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" fill={color} opacity={0.9} />
        <path
          d="M12 2V4M12 20V22M22 12H20M4 12H2M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.6}
        />
      </svg>
    );
  }

  // Nubes
  if (
    conditionLower.includes("nublado") ||
    conditionLower.includes("cloudy") ||
    conditionLower.includes("cubierto") ||
    conditionLower.includes("overcast")
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          fill={color}
          opacity={0.7}
        />
      </svg>
    );
  }

  // Lluvia
  if (conditionLower.includes("lluvia") || conditionLower.includes("rain") || conditionLower.includes("lluvioso")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          fill={color}
          opacity={0.7}
        />
        <path
          d="M7 16l-2 4M11 16l-2 4M15 16l-2 4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.8}
        />
      </svg>
    );
  }

  // Nieve
  if (conditionLower.includes("nieve") || conditionLower.includes("snow")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          fill={color}
          opacity={0.7}
        />
        <circle cx="7" cy="16" r="1.5" fill={color} opacity={0.8} />
        <circle cx="11" cy="18" r="1.5" fill={color} opacity={0.8} />
        <circle cx="15" cy="16" r="1.5" fill={color} opacity={0.8} />
      </svg>
    );
  }

  // Tormenta
  if (conditionLower.includes("tormenta") || conditionLower.includes("storm") || conditionLower.includes("thunder")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          fill={color}
          opacity={0.7}
        />
        <path
          d="M13 12l-4 6h3l-2 4"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.9}
        />
      </svg>
    );
  }

  // Por defecto: nube genérica
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
        fill={color}
        opacity={0.7}
      />
    </svg>
  );
};