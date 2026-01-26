import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_CONFIGS } from "../../utils/constants";
import { clamp } from "../../utils/animations";

export type SlideInProps = {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
  springConfig?: keyof typeof SPRING_CONFIGS;
  withFade?: boolean;
};

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = "up",
  distance = 50,
  delay = 0,
  duration = 30,
  springConfig = "SMOOTH",
  withFade = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame: frame - delay * fps,
    config: SPRING_CONFIGS[springConfig],
    durationInFrames: duration,
  });

  // Calcular translate según dirección
  const getTranslate = () => {
    const value = interpolate(progress, [0, 1], [distance, 0], clamp);
    switch (direction) {
      case "up":
        return `translateY(${value}px)`;
      case "down":
        return `translateY(${-value}px)`;
      case "left":
        return `translateX(${value}px)`;
      case "right":
        return `translateX(${-value}px)`;
      default:
        return `translateY(${value}px)`;
    }
  };

  const opacity = withFade
    ? interpolate(progress, [0, 0.5, 1], [0, 0.5, 1], clamp)
    : 1;

  return (
    <div
      style={{
        transform: getTranslate(),
        opacity,
      }}
    >
      {children}
    </div>
  );
};
