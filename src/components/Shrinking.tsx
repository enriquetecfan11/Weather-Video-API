import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Shrinking: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [60, 90],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
