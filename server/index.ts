// Cargar variables de entorno desde .env
import "dotenv/config";

import express from "express";
import { renderHandler } from "./routes/render";
import { initializeTempDir, cleanupOldFiles } from "./utils/fileManager";
import { cleanupOldJobs, getQueueCapacity } from "./services/queue";
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

// Test endpoint - Verificación completa del sistema
app.get("/test", async (req, res) => {
  const checks: Record<string, { status: string; message?: string; details?: any }> = {};
  let allPassed = true;

  // 1. Verificar servidor básico
  checks.server = {
    status: "ok",
    details: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    },
  };

  // 2. Verificar directorios
  try {
    const { checkDiskSpace } = await import("./utils/fileManager");
    const tempDirOk = await checkDiskSpace();
    checks.directories = {
      status: tempDirOk ? "ok" : "error",
      message: tempDirOk ? "Directorios accesibles" : "Error accediendo a directorios",
      details: {
        tempDir: process.env.TEMP_DIR || "./temp",
        outDir: process.env.OUT_DIR || "./out",
      },
    };
    if (!tempDirOk) allPassed = false;
  } catch (error) {
    checks.directories = {
      status: "error",
      message: `Error verificando directorios: ${error instanceof Error ? error.message : String(error)}`,
    };
    allPassed = false;
  }

  // 3. Verificar dependencias de Remotion
  try {
    const { bundle } = await import("@remotion/bundler");
    const { selectComposition } = await import("@remotion/renderer");
    checks.remotion = {
      status: "ok",
      message: "Dependencias de Remotion disponibles",
      details: {
        bundler: "ok",
        renderer: "ok",
      },
    };
  } catch (error) {
    checks.remotion = {
      status: "error",
      message: `Error importando Remotion: ${error instanceof Error ? error.message : String(error)}`,
    };
    allPassed = false;
  }

  // 4. Verificar Chrome/Chromium (para Remotion)
  try {
    const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN;
    const fs = await import("fs/promises");
    
    if (chromePath) {
      try {
        await fs.access(chromePath);
        checks.chrome = {
          status: "ok",
          message: "Chrome/Chromium encontrado",
          details: { path: chromePath },
        };
      } catch {
        checks.chrome = {
          status: "warning",
          message: "Ruta de Chrome configurada pero no accesible",
          details: { path: chromePath },
        };
      }
    } else {
      // Intentar encontrar chromium en rutas comunes
      const commonPaths = [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
      ];
      let found = false;
      for (const path of commonPaths) {
        try {
          await fs.access(path);
          checks.chrome = {
            status: "ok",
            message: "Chrome/Chromium encontrado en ruta común",
            details: { path },
          };
          found = true;
          break;
        } catch {
          continue;
        }
      }
      if (!found) {
        checks.chrome = {
          status: "warning",
          message: "Chrome/Chromium no encontrado. Puede causar problemas en renderizado.",
        };
      }
    }
  } catch (error) {
    checks.chrome = {
      status: "warning",
      message: `Error verificando Chrome: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  // 5. Verificar variables de entorno críticas
  const envVars = {
    PORT: process.env.PORT || "3000 (default)",
    MAX_CONCURRENT_RENDERS: process.env.MAX_CONCURRENT_RENDERS || "2 (default)",
    RENDER_TIMEOUT: process.env.RENDER_TIMEOUT || "300000 (default)",
    TEMP_DIR: process.env.TEMP_DIR || "./temp (default)",
    OUT_DIR: process.env.OUT_DIR || "./out (default)",
    GROQ_API_KEY: process.env.GROQ_API_KEY ? "configurada" : "no configurada (opcional)",
  };
  checks.environment = {
    status: "ok",
    message: "Variables de entorno verificadas",
    details: envVars,
  };

  // 6. Verificar cola
  try {
    const { getQueueStatus } = await import("./services/queue");
    const queueStatus = getQueueStatus();
    checks.queue = {
      status: "ok",
      message: "Sistema de cola operativo",
      details: queueStatus,
    };
  } catch (error) {
    checks.queue = {
      status: "error",
      message: `Error verificando cola: ${error instanceof Error ? error.message : String(error)}`,
    };
    allPassed = false;
  }

  // 7. Verificar parser
  try {
    const { parseWeatherText } = await import("./services/parser");
    // Test con un texto simple
    const testText = "Madrid: soleado, 25°C";
    await parseWeatherText(testText);
    checks.parser = {
      status: "ok",
      message: "Parser funcional",
      details: { testText },
    };
  } catch (error) {
    checks.parser = {
      status: "error",
      message: `Error en parser: ${error instanceof Error ? error.message : String(error)}`,
    };
    allPassed = false;
  }

  const statusCode = allPassed ? 200 : 503;
  res.status(statusCode).json({
    status: allPassed ? "ok" : "error",
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total: Object.keys(checks).length,
      passed: Object.values(checks).filter((c) => c.status === "ok").length,
      warnings: Object.values(checks).filter((c) => c.status === "warning").length,
      errors: Object.values(checks).filter((c) => c.status === "error").length,
    },
  });
});

// Endpoint principal de renderizado
app.post("/render", renderHandler);

// Endpoint para consultar estado de la cola
app.get("/queue/status", (req, res) => {
  const capacity = getQueueCapacity();
  res.json({
    ...capacity,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de diagnóstico para errores
app.get("/diagnostics", async (req, res) => {
  const { getQueueCapacity } = await import("./services/queue");
  const capacity = getQueueCapacity();
  
  // Verificar espacio en disco
  let diskSpace = { status: "unknown", message: "No verificado" };
  try {
    const { checkDiskSpace } = await import("./utils/fileManager");
    const hasSpace = await checkDiskSpace();
    diskSpace = {
      status: hasSpace ? "ok" : "error",
      message: hasSpace ? "Espacio disponible" : "Problema con espacio en disco",
    };
  } catch (error) {
    diskSpace = {
      status: "error",
      message: `Error verificando espacio: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        unit: "MB",
      },
    },
    queue: capacity,
    diskSpace,
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "3000",
      MAX_CONCURRENT_RENDERS: process.env.MAX_CONCURRENT_RENDERS || "2",
      RENDER_TIMEOUT: process.env.RENDER_TIMEOUT || "300000",
      REMOTION_BROWSER_EXECUTABLE: process.env.REMOTION_BROWSER_EXECUTABLE || "not set",
      CHROME_BIN: process.env.CHROME_BIN || "not set",
      PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || "not set",
    },
    recommendations: {
      ...(capacity.isFull && {
        queue: "La cola está llena. Espera antes de hacer nuevos renders.",
      }),
      ...(diskSpace.status === "error" && {
        disk: "Problema con el espacio en disco. Verifica los directorios temp/ y out/.",
      }),
      ...(parseInt(process.env.RENDER_TIMEOUT || "300000", 10) < 300000 && {
        timeout: `RENDER_TIMEOUT es bajo (${process.env.RENDER_TIMEOUT}ms). Considera aumentarlo si tienes timeouts frecuentes.`,
      }),
    },
  });
});

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
