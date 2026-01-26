import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_CONFIGS } from "../../utils/constants";

export type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromOpacity?: number;
  toOpacity?: number;
  springConfig?: keyof typeof SPRING_CONFIGS;
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 30,
  fromOpacity = 0,
  toOpacity = 1,
  springConfig = "SMOOTH",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    fps,
    frame: frame - delay * fps,
    config: SPRING_CONFIGS[springConfig],
    durationInFrames: duration,
    from: fromOpacity,
    to: toOpacity,
  });

  return (
    <div
      style={{
        opacity,
      }}
    >
      {children}
    </div>
  );
};
