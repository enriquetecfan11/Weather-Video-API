import { RenderRequest } from "../types/api";
import logger from "./logger";

/**
 * Valida el request de render
 */
export function validateRenderRequest(
  body: unknown
): { valid: boolean; error?: string; data?: RenderRequest } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body debe ser un objeto" };
  }

  const request = body as Partial<RenderRequest>;

  // Validar texto
  if (!request.text) {
    return { valid: false, error: "Campo 'text' es requerido" };
  }

  if (typeof request.text !== "string") {
    return { valid: false, error: "Campo 'text' debe ser una cadena" };
  }

  const textLength = request.text.trim().length;
  if (textLength < 10) {
    return {
      valid: false,
      error: "Campo 'text' debe tener al menos 10 caracteres",
    };
  }

  if (textLength > 1000) {
    return {
      valid: false,
      error: "Campo 'text' no puede exceder 1000 caracteres",
    };
  }

  // Validar options si existe
  if (request.options) {
    if (typeof request.options !== "object") {
      return { valid: false, error: "Campo 'options' debe ser un objeto" };
    }

    if (
      request.options.outputFormat &&
      !["stream", "url"].includes(request.options.outputFormat)
    ) {
      return {
        valid: false,
        error: "options.outputFormat debe ser 'stream' o 'url'",
      };
    }

    if (
      request.options.quality !== undefined &&
      (typeof request.options.quality !== "number" ||
        request.options.quality < 0 ||
        request.options.quality > 100)
    ) {
      return {
        valid: false,
        error: "options.quality debe ser un número entre 0 y 100",
      };
    }

    if (
      request.options.fps !== undefined &&
      (typeof request.options.fps !== "number" ||
        request.options.fps < 1 ||
        request.options.fps > 60)
    ) {
      return {
        valid: false,
        error: "options.fps debe ser un número entre 1 y 60",
      };
    }

    if (
      request.options.width !== undefined &&
      (typeof request.options.width !== "number" ||
        request.options.width < 100 ||
        request.options.width > 7680)
    ) {
      return {
        valid: false,
        error: "options.width debe ser un número entre 100 y 7680",
      };
    }

    if (
      request.options.height !== undefined &&
      (typeof request.options.height !== "number" ||
        request.options.height < 100 ||
        request.options.height > 4320)
    ) {
      return {
        valid: false,
        error: "options.height debe ser un número entre 100 y 4320",
      };
    }
  }

  logger.info("Request validado correctamente", {
    textLength,
    hasOptions: !!request.options,
  });

  return { valid: true, data: request as RenderRequest };
}
