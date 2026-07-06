const winston = require('winston');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

const colors = {
  error: '\x1b[31m',    // Red
  warn: '\x1b[33m',     // Yellow
  info: '\x1b[36m',     // Cyan
  debug: '\x1b[90m',    // Gray
  reset: '\x1b[0m'      // Reset
};

const colorize = (level, message) => {
  return `${colors[level] || colors.reset}${message}${colors.reset}`;
};

const customFormat = winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
  const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${requestId || 'N/A'}]`;
  let output = `${baseMessage} ${message}`;

  if (userId) {
    output += ` [User: ${userId}]`;
  }

  if (Object.keys(meta).length > 0 && meta.stack === undefined) {
    output += ` ${JSON.stringify(meta, null, 2)}`;
  }

  if (meta.stack) {
    output += `\n${meta.stack}`;
  }

  return output;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  defaultMeta: { service: 'express-api' },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
          const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${requestId || 'N/A'}]`;
          let output = colorize(level, `${baseMessage} ${message}`);

          if (userId) {
            output += ` [User: ${userId}]`;
          }

          if (Object.keys(meta).length > 0 && meta.stack === undefined) {
            output += ` ${JSON.stringify(meta)}`;
          }

          return output;
        })
      )
    })
  ]
});

module.exports = logger;
