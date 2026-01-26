import React from "react";
import { Composition } from "remotion";
import { WeatherForecast } from "./components/WeatherForecast";
import { DEFAULT_WEATHER_FORECAST_PROPS } from "./utils/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeatherForecast"
        component={WeatherForecast}
        durationInFrames={660} // 22 segundos (OUTRO_START + OUTRO_DURATION) * 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_WEATHER_FORECAST_PROPS}
      />
    </>
  );
};
