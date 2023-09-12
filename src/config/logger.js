const winston = require("winston");

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.json()
  ),
  defaultMeta: { service: "Worker-Service" },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "logs/logs-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "14d"
    })
  ]
});

export default logger;
