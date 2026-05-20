import ENV from "../../config/env";
import pino from "pino";
import { logFilePath } from "./stream.js";

const isDev = ENV.NODE_ENV === "development";

let baseLogger;

if (isDev) {
  baseLogger = pino({
      level: ENV.LOG_LEVEL || "debug",
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: {
        targets: [
          {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
                ignore: "pid,hostname,module",
                messageFormat: "[{module}] {msg}"
            }
          },
          {
            target: "pino/file",
            options: { destination: logFilePath, mkdir: true }
          }
        ]
      }
  });
} else {
  baseLogger = pino({
      level: process.env.LOG_LEVEL || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: {
        target: "pino/file",
        options: { destination: logFilePath, mkdir: true }
      }
  });
}

class Logger {
  constructor(module) {
    this.logger = baseLogger.child({ module });
  }

  info(msg, data = {}) {
    const logData = typeof data === "object" && data !== null ? data : { value: data };
    this.logger.info(logData, msg);
  }

  error(msg, data = {}) {
    const logData = typeof data === "object" && data !== null ? data : { value: data };
    this.logger.error(logData, msg);
  }

  warn(msg, data = {}) {
    const logData = typeof data === "object" && data !== null ? data : { value: data };
    this.logger.warn(logData, msg);
  }

  debug(msg, data = {}) {
    const logData = typeof data === "object" && data !== null ? data : { value: data };
    this.logger.debug(logData, msg);
  }
}

export default Logger;