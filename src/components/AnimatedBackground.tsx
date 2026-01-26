import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../utils/animations";

export type AnimatedBackgroundProps = {
  condition?: string;
};

/**
 * Obtiene los colores del fondo según la condición meteorológica
 */
const getBackgroundColors = (condition?: string): { from: string; to: string; accent?: string } => {
  if (!condition) {
    return { from: "#000021", to: "#010024" }; // Default oscuro
  }

  const conditionLower = condition.toLowerCase();

  // Soleado / Despejado - Colores cálidos con acento dorado
  if (
    conditionLower.includes("soleado") ||
    conditionLower.includes("despejado") ||
    conditionLower.includes("claro")
  ) {
    return {
      from: "#1a1a2e", // Azul oscuro con toque cálido
      to: "#2d1b3d", // Púrpura oscuro
      accent: "rgba(251, 191, 36, 0.15)", // Dorado suave
    };
  }

  // Nublado - Grises azulados
  if (conditionLower.includes("nublado")) {
    return {
      from: "#1e293b", // Gris azulado oscuro
      to: "#334155", // Gris azulado medio
      accent: "rgba(148, 163, 184, 0.2)", // Gris suave
    };
  }

  // Lluvia - Azules oscuros/grises
  if (conditionLower.includes("lluvia") || conditionLower.includes("chubasco")) {
    return {
      from: "#0f172a", // Azul muy oscuro
      to: "#1e3a5f", // Azul oscuro
      accent: "rgba(59, 130, 246, 0.2)", // Azul suave
    };
  }

  // Nieve - Blancos/azules claros
  if (conditionLower.includes("nieve")) {
    return {
      from: "#1e293b", // Gris azulado
      to: "#475569", // Gris azulado claro
      accent: "rgba(255, 255, 255, 0.15)", // Blanco suave
    };
  }

  // Tormenta - Azules muy oscuros/púrpuras
  if (conditionLower.includes("tormenta")) {
    return {
      from: "#0a0a1a", // Casi negro con toque azul
      to: "#1a0a2e", // Púrpura muy oscuro
      accent: "rgba(139, 92, 246, 0.2)", // Púrpura suave
    };
  }

  // Default: oscuro estilo Apple
  return { from: "#000021", to: "#010024" };
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ condition }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const colors = getBackgroundColors(condition);

  // Animación sutil del gradiente (cambia la intensidad con el tiempo)
  const gradientShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Movimiento sutil de la posición del gradiente
  const gradientPosition = interpolate(
    frame,
    [0, durationInFrames],
    [0, 10],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Para soleado: efecto de "luz solar" que se mueve
  const conditionLower = condition?.toLowerCase() || "";
  const isSunny = conditionLower.includes("soleado") || conditionLower.includes("despejado") || conditionLower.includes("claro");
  
  const sunPosition = isSunny
    ? interpolate(
        frame,
        [0, durationInFrames],
        [20, 80],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      )
    : 50;

  // Variación sutil de opacidad para dar vida
  const opacityVariation = interpolate(
    frame,
    [0, durationInFrames * 0.5, durationInFrames],
    [1, 1.05, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill>
      {/* Gradiente base animado */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${colors.from}, ${colors.to})`,
          opacity: opacityVariation,
        }}
      />

      {/* Efecto de luz/acento animado según condición */}
      {colors.accent && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${sunPosition}% ${20 + gradientPosition * 0.5}%, ${colors.accent}, transparent 70%)`,
            opacity: 0.6 + Math.sin(frame * 0.02) * 0.2, // Pulso sutil
          }}
        />
      )}

      {/* Capa adicional de profundidad animada */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% ${50 + Math.sin(frame * 0.01) * 5}%, rgba(0, 0, 0, 0.1), transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};
