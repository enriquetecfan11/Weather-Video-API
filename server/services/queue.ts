import PQueue from "p-queue";
import { RenderJob, RenderStatus } from "../types/api";
import logger from "../utils/logger";

/**
 * Configuración de la cola
 */
const MAX_CONCURRENT = parseInt(
  process.env.MAX_CONCURRENT_RENDERS || "2",
  10
);
const RENDER_TIMEOUT = parseInt(process.env.RENDER_TIMEOUT || "300000", 10); // 5 minutos

/**
 * Cola de renders con límite de concurrencia
 */
const renderQueue = new PQueue({
  concurrency: MAX_CONCURRENT,
  timeout: RENDER_TIMEOUT,
  throwOnTimeout: true,
});

/**
 * Mapa de jobs activos
 */
const activeJobs = new Map<string, RenderJob>();

/**
 * Crea un nuevo job de render
 */
export function createRenderJob(): RenderJob {
  const id = `render-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const job: RenderJob = {
    id,
    status: "pending",
    createdAt: new Date(),
  };

  activeJobs.set(id, job);
  logger.info("Nuevo job de render creado", { jobId: id });

  return job;
}

/**
 * Actualiza el estado de un job
 */
export function updateJobStatus(
  jobId: string,
  status: RenderStatus,
  updates?: Partial<RenderJob>
): void {
  const job = activeJobs.get(jobId);
  if (!job) {
    logger.warn("Intento de actualizar job inexistente", { jobId });
    return;
  }

  const updatedJob: RenderJob = {
    ...job,
    status,
    ...updates,
  };

  if (status === "processing" && !updatedJob.startedAt) {
    updatedJob.startedAt = new Date();
  }

  if (status === "completed" || status === "failed") {
    updatedJob.completedAt = new Date();
  }

  activeJobs.set(jobId, updatedJob);
  logger.info("Estado de job actualizado", {
    jobId,
    status,
    updates: Object.keys(updates || {}),
  });
}

/**
 * Obtiene un job por ID
 */
export function getJob(jobId: string): RenderJob | undefined {
  return activeJobs.get(jobId);
}

/**
 * Añade un trabajo a la cola
 */
export async function addToQueue<T>(
  jobId: string,
  renderFn: () => Promise<T>
): Promise<T> {
  updateJobStatus(jobId, "processing");

  try {
    const result = await renderQueue.add(
      async () => {
        logger.info("Iniciando render en cola", { jobId });
        return await renderFn();
      },
      { throwOnTimeout: true }
    );

    updateJobStatus(jobId, "completed");
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    updateJobStatus(jobId, "failed", { error: errorMessage });
    logger.error("Error en render de cola", { jobId, error });
    throw error;
  }
}

/**
 * Obtiene estadísticas de la cola
 */
export function getQueueStats(): {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  queueSize: number;
} {
  const jobs = Array.from(activeJobs.values());
  const stats = {
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    queueSize: renderQueue.size,
  };

  return stats;
}

/**
 * Obtiene el estado completo de la cola (alias de getQueueStats para compatibilidad)
 */
export function getQueueStatus() {
  return {
    ...getQueueStats(),
    maxConcurrent: MAX_CONCURRENT,
    timeout: RENDER_TIMEOUT,
  };
}

/**
 * Limpia jobs antiguos (más de 1 hora)
 */
export function cleanupOldJobs(): number {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let cleaned = 0;

  for (const [id, job] of activeJobs.entries()) {
    if (
      (job.status === "completed" || job.status === "failed") &&
      job.completedAt &&
      job.completedAt.getTime() < oneHourAgo
    ) {
      activeJobs.delete(id);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(`Limpieza de jobs: ${cleaned} jobs eliminados`);
  }

  return cleaned;
}
