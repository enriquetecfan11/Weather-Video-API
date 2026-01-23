import React from "react";

export type CloudProps = {
  left: number;
  top: number;
  scale: number;
  drift: number;
};

export const Cloud: React.FC<CloudProps> = ({ left, top, scale, drift }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: left + drift,
        top,
        width: 300 * scale,
        height: 120 * scale,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        borderRadius: 999,
        filter: "blur(4px)",
        boxShadow: "35px 8px 0 rgba(255, 255, 255, 0.25), -35px 15px 0 rgba(255, 255, 255, 0.2)",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
};
