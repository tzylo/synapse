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
    this.logger.info(data, msg);
  }

  error(msg, data = {}) {
    this.logger.error(data, msg);
  }

  warn(msg, data = {}) {
    this.logger.warn(data, msg);
  }

  debug(msg, data = {}) {
    this.logger.debug(data, msg);
  }
}

export default Logger;