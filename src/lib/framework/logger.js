import fs from "fs";
import path from "path";

export function generateLoggerConfig(useTypeScript) {
    const ext = useTypeScript ? "ts" : "js";
    const loggerContent = `
import winston from 'winston';
import path from 'path';

// Configuración del logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
        }),
    ],
});

export default logger;
`.trim();

    fs.writeFileSync(path.resolve("src/config", `logger.${ext}`), loggerContent);
}