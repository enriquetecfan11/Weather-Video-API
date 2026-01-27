import React from "react";
import { Composition } from "remotion";
import { WeatherForecast } from "./components/WeatherForecast";
import { TIMING } from "./utils/constants";

/**
 * Calcula la duración máxima del video en frames
 * Considera: Bloque 1 (4s) + Bloque 2 (máx 5.5s) + Bloque 3 (4s opcional) + Bloque 4 (6s opcional) + Outro (4s) + margen mínimo
 * Duración máxima real: 
 * - Bloque 1: 0-4s
 * - Bloque 2: 3.5-9s (5.5s)
 * - Bloque 3: 9-13s (4s, opcional)
 * - Bloque 4: 13.5-19.5s (6s, opcional)
 * - Outro: 19.7-23.7s (4s, empieza 0.2s después del último bloque)
 * Total máximo: ~24s = 720 frames
 * 
 * Nota: El outro se calcula dinámicamente dentro del componente, pero esta es la duración máxima posible
 */
const MAX_DURATION_SECONDS = 4 + 5.5 + 4 + 6 + 4 + 0.2; // 23.7 segundos
const FPS = 30;
const MAX_DURATION_FRAMES = Math.ceil(MAX_DURATION_SECONDS * FPS); // 711 frames

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeatherForecast"
        component={WeatherForecast}
        durationInFrames={MAX_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
