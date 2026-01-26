// Cargar variables de entorno desde .env
import "dotenv/config";

import express from "express";
import { renderHandler } from "./routes/render";
import { initializeTempDir, cleanupOldFiles } from "./utils/fileManager";
import { cleanupOldJobs } from "./services/queue";
import logger from "./utils/logger";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint principal de renderizado
app.post("/render", renderHandler);

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Error no manejado", {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  if (!res.headersSent) {
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Inicializar servidor
async function startServer() {
  try {
    // Inicializar directorio temporal
    await initializeTempDir();

    // Limpieza inicial
    await cleanupOldFiles();
    cleanupOldJobs();

    // Limpieza periódica cada hora
    setInterval(async () => {
      await cleanupOldFiles();
      cleanupOldJobs();
    }, 60 * 60 * 1000);

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en puerto ${PORT}`, {
        port: PORT,
        env: process.env.NODE_ENV || "development",
      });
    });
  } catch (error) {
    logger.error("Error al iniciar servidor", { error });
    process.exit(1);
  }
}

// Manejo de señales para cierre graceful
process.on("SIGTERM", () => {
  logger.info("SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT recibido, cerrando servidor...");
  process.exit(0);
});

// Iniciar
startServer();
