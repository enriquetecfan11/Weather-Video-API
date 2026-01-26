import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AnimatedDot } from "./AnimatedDot";
import { Explosion } from "./Explosion";
import { Shrinking } from "./Shrinking";
import { Trail } from "./Trail";

export const AnimatedParticles: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.6, // Opacidad reducida para no interferir con el contenido
      }}
    >
      <Explosion>
        <Trail amount={4} extraOffset={0}>
          <Shrinking>
            <Sequence from={5}>
              <AnimatedDot />
            </Sequence>
          </Shrinking>
        </Trail>
      </Explosion>
    </AbsoluteFill>
  );
};
