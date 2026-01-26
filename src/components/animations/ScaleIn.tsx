import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_CONFIGS } from "../../utils/constants";

export type ScaleInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromScale?: number;
  toScale?: number;
  springConfig?: keyof typeof SPRING_CONFIGS;
  withFade?: boolean;
};

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 30,
  fromScale = 0.8,
  toScale = 1,
  springConfig = "DRAMATIC",
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

  const scale = progress * (toScale - fromScale) + fromScale;
  const opacity = withFade ? progress : 1;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "center",
      }}
    >
      {children}
    </div>
  );
};
