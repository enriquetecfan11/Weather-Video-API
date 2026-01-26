/**
 * Configuración de extrapolación para interpolaciones
 * Evita que los valores salgan del rango especificado
 */
export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/**
 * Easing functions para animaciones más naturales
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

/**
 * Helper para aplicar easing a interpolate
 */
export const applyEasing = (
  frame: number,
  startFrame: number,
  endFrame: number,
  easingFn: (t: number) => number
): number => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / (endFrame - startFrame)));
  return easingFn(t);
};
