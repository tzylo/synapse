import ENV from "../../config/env";
import pino from "pino";
import { destination } from "./stream";

const isDev = ENV.NODE_ENV === "development";

let baseLogger;

if (isDev) {
baseLogger = pino({
      level: ENV.LOG_LEVEL || "debug",
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname, module",
            messageFormat: "[{module}] {msg}"
        }
    }
});
} else {
  baseLogger = pino(
    {
      level: process.env.LOG_LEVEL || "info",
      timestamp: pino.stdTimeFunctions.isoTime
    },
    destination
  );
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

module.exports = Logger;