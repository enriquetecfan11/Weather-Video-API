import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../utils/animations";

export type WordRevealProps = {
  text: string;
  delay?: number;
  wordDelay?: number;
  children?: (word: string, index: number, opacity: number) => React.ReactNode;
};

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  delay = 0,
  wordDelay = 0.05,
  children,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  const renderWord = (word: string, index: number) => {
    const wordStartFrame = (delay + index * wordDelay) * 30; // Convertir a frames
    const wordEndFrame = wordStartFrame + 0.3 * 30; // 0.3s para fade in de cada palabra

    const opacity = interpolate(
      frame,
      [wordStartFrame, wordEndFrame],
      [0, 1],
      clamp
    );

    const translateY = interpolate(
      frame,
      [wordStartFrame, wordEndFrame],
      [10, 0],
      clamp
    );

    if (children) {
      return children(word, index, opacity);
    }

    return (
      <span
        key={index}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          display: "inline-block",
          marginRight: "0.25em",
        }}
      >
        {word}
      </span>
    );
  };

  return (
    <>
      {words.map((word, index) => renderWord(word, index))}
    </>
  );
};
