/**
 * Configuración de extrapolación para interpolaciones
 * Evita que los valores salgan del rango especificado
 */
export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
