import React from "react";
import { Composition } from "remotion";
import { WeatherForecast } from "./components/WeatherForecast";
import { TIMING } from "./utils/constants";

/**
 * Duración del video en segundos
 * El bloque 4 se extiende hasta el fade out final
 * 
 * Estructura:
 * - Bloque 1: 0-4s (temperatura + ciudad)
 * - Bloque 2: 3.5-9s (condición, sensación, viento)
 * - Bloque 3: 9-13s (fenómenos, opcional)
 * - Bloque 4: después del último bloque hasta fade out
 * - Fade out: últimos 1.5 segundos
 */
export const VIDEO_DURATION_SECONDS = 17; // Duración total del video
const FPS = 30;
const MAX_DURATION_FRAMES = Math.ceil(VIDEO_DURATION_SECONDS * FPS);

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
