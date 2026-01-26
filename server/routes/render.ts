import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { parseWeatherText } from "../services/parser";
import { renderVideo } from "../services/renderer";
import { createRenderJob, addToQueue, updateJobStatus, canAcceptJob, getQueueCapacity } from "../services/queue";
import { validateRenderRequest } from "../utils/validation";
import {
  deleteTempFile,
  fileExists,
  getFileSize,
} from "../utils/fileManager";
import logger from "../utils/logger";

/**
 * Endpoint POST /render
 * Renderiza un vídeo meteorológico desde texto
 */
export async function renderHandler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  try {
    // Validar request
    const validation = validateRenderRequest(req.body);
    if (!validation.valid || !validation.data) {
      res.status(400).json({
        error: validation.error || "Error de validación",
      });
      return;
    }

    const { text, options } = validation.data;
    const outputFormat = options?.outputFormat || "stream";

    // Verificar si la cola puede aceptar más trabajos
    if (!canAcceptJob()) {
      const capacity = getQueueCapacity();
      logger.warn("Cola llena, rechazando request", capacity);
      res.status(429).json({
        error: "Cola de renders llena. Intenta de nuevo más tarde.",
        queueStatus: capacity,
        retryAfter: 60, // Segundos
      });
      return;
    }

    logger.info("Request de render recibido", {
      textLength: text.length,
      outputFormat,
    });

    // Parsear texto (ahora async)
    const parsedData = await parseWeatherText(text);

    // Log de los datos parseados antes de renderizar
    logger.info("Datos parseados recibidos del parser", {
      city: parsedData.city,
      country: parsedData.country,
      condition: parsedData.condition,
      temperatureC: parsedData.temperatureC,
      temperatureRange: parsedData.temperatureRange,
      temperatureUnit: parsedData.temperatureUnit,
      feelsLike: parsedData.feelsLike,
      feelsLikeTemp: parsedData.feelsLikeTemp,
      wind: parsedData.wind,
      windSpeed: parsedData.windSpeed,
      windDirection: parsedData.windDirection,
      windUnit: parsedData.windUnit,
      hasPrecipitation: !!parsedData.precipitation,
      precipitationType: parsedData.precipitation?.type,
      precipitationIntensity: parsedData.precipitation?.intensity,
      precipitationProbability: parsedData.precipitation?.probability,
      hasDescription: !!parsedData.description,
      descriptionLength: parsedData.description?.length || 0,
      language: parsedData.language,
    });

    // Crear job
    const job = createRenderJob();

    // Renderizar en cola
    let filePath: string;
    try {
      filePath = await addToQueue(job.id, async () => {
        return await renderVideo(parsedData, {
          fps: options?.fps,
          width: options?.width,
          height: options?.height,
          quality: options?.quality,
        });
      });

      updateJobStatus(job.id, "completed", { filePath });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      updateJobStatus(job.id, "failed", { error: errorMessage });
      throw error;
    }

    // Verificar que el archivo existe
    if (!(await fileExists(filePath))) {
      logger.error("Archivo renderizado no encontrado", { filePath });
      res.status(500).json({
        error: "Error al generar el vídeo",
      });
      return;
    }

    const processingTime = Date.now() - startTime;
    logger.info("Render completado exitosamente", {
      jobId: job.id,
      filePath,
      processingTimeMs: processingTime,
    });

    // Responder según formato solicitado
    if (outputFormat === "url") {
      // Retornar URL temporal
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      const videoUrl = `/videos/${path.basename(filePath)}`;

      res.json({
        videoUrl,
        expiresAt: expiresAt.toISOString(),
        jobId: job.id,
      });
    } else {
      // Stream del archivo
      const fileSize = await getFileSize(filePath);
      const stats = await fs.promises.stat(filePath);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Disposition", `inline; filename="weather-video.mp4"`);
      res.setHeader("X-Job-Id", job.id);
      res.setHeader("X-Processing-Time", processingTime.toString());

      // Stream del archivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Limpiar archivo después de enviarlo
      fileStream.on("end", async () => {
        try {
          await deleteTempFile(filePath);
        } catch (error) {
          logger.error("Error al eliminar archivo después de stream", {
            filePath,
            error,
          });
        }
      });

      fileStream.on("error", async (error) => {
        logger.error("Error en stream de archivo", { filePath, error });
        try {
          await deleteTempFile(filePath);
        } catch (deleteError) {
          logger.error("Error al eliminar archivo después de error", {
            filePath,
            error: deleteError,
          });
        }
        if (!res.headersSent) {
          res.status(500).json({ error: "Error al enviar el vídeo" });
        }
      });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    logger.error("Error en endpoint /render", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
    });

    // Determinar código de error apropiado
    let statusCode = 500;
    if (errorMessage.includes("timeout")) {
      statusCode = 503;
    } else if (errorMessage.includes("cola") || errorMessage.includes("queue")) {
      statusCode = 429;
    }

    if (!res.headersSent) {
      res.status(statusCode).json({
        error: errorMessage,
      });
    }
  }
}
