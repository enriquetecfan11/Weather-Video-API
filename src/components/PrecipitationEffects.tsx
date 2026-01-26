import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../utils/animations";
import { THEME } from "../utils/constants";

export type PrecipitationEffectsProps = {
  type: "rain" | "snow" | "storm" | null;
  intensity?: "weak" | "moderate" | "strong";
  opacity?: number;
};

export const PrecipitationEffects: React.FC<PrecipitationEffectsProps> = ({
  type,
  intensity = "moderate",
  opacity = 0.3,
}) => {
  const frame = useCurrentFrame();

  if (!type) return null;

  // Número de partículas según intensidad
  const particleCount = intensity === "weak" ? 15 : intensity === "moderate" ? 25 : 35;

  // Velocidad según intensidad
  const speed = intensity === "weak" ? 0.5 : intensity === "moderate" ? 0.8 : 1.2;

  if (type === "rain") {
    // Gotas de lluvia
    const drops = Array.from({ length: particleCount }, (_, i) => {
      const delay = (i / particleCount) * 2;
      const x = (i * 37.5) % 100;
      const yStart = -10 - (i % 3) * 20;
      const yEnd = 110;

      const y = interpolate(
        frame * speed + delay * 30,
        [0, 120],
        [yStart, yEnd],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "repeat",
        }
      );

      const dropOpacity = interpolate(
        frame * speed + delay * 30,
        [0, 20, 100, 120],
        [0, opacity, opacity, 0],
        clamp
      );

      const length = intensity === "weak" ? 8 : intensity === "moderate" ? 12 : 16;

      return {
        x,
        y,
        opacity: dropOpacity,
        length,
      };
    });

    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {drops.map((drop, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              width: "2px",
              height: `${drop.length}px`,
              background: "linear-gradient(to bottom, rgba(148, 163, 184, 0.8), rgba(148, 163, 184, 0.4))",
              opacity: drop.opacity,
              transform: "rotate(15deg)",
              transformOrigin: "top center",
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }

  if (type === "snow") {
    // Copos de nieve
    const flakes = Array.from({ length: particleCount }, (_, i) => {
      const delay = (i / particleCount) * 2;
      const x = (i * 37.5) % 100;
      const yStart = -10 - (i % 3) * 20;
      const yEnd = 110;

      const y = interpolate(
        frame * speed * 0.6 + delay * 30,
        [0, 120],
        [yStart, yEnd],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "repeat",
        }
      );

      const xDrift = Math.sin((frame * 0.02 + i) * 0.5) * 3; // Movimiento horizontal suave
      const rotation = (frame * 0.5 + i * 10) % 360;

      const flakeOpacity = interpolate(
        frame * speed * 0.6 + delay * 30,
        [0, 20, 100, 120],
        [0, opacity, opacity, 0],
        clamp
      );

      const size = intensity === "weak" ? 4 : intensity === "moderate" ? 6 : 8;

      return {
        x: x + xDrift,
        y,
        opacity: flakeOpacity,
        size,
        rotation,
      };
    });

    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {flakes.map((flake, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "50%",
              opacity: flake.opacity,
              transform: `rotate(${flake.rotation}deg)`,
              boxShadow: `0 0 ${flake.size}px rgba(255, 255, 255, 0.8)`,
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }

  if (type === "storm") {
    // Relámpagos ocasionales
    const lightningCount = intensity === "weak" ? 2 : intensity === "moderate" ? 3 : 5;
    const lightnings = Array.from({ length: lightningCount }, (_, i) => {
      const startFrame = i * 60 + 10;
      const duration = 3; // 3 frames de duración
      const x = 20 + (i * 20) % 60;

      const lightningOpacity = interpolate(
        frame,
        [startFrame, startFrame + duration],
        [0, opacity * 2, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "repeat",
        }
      );

      return {
        x,
        opacity: lightningOpacity,
        startFrame,
      };
    });

    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {lightnings.map((lightning, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${lightning.x}%`,
              top: "10%",
              width: "3px",
              height: "40%",
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(148, 163, 184, 0.6))",
              opacity: lightning.opacity,
              transform: "skewX(-10deg)",
              filter: "blur(1px)",
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }

  return null;
};
