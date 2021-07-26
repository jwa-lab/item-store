import { SERVICE_NAME, LOGGING_FORMAT } from "./config";
import * as winston from "winston";
import { WinstonLogger } from "./services/winstonLogger";

let transport : winston.transport;

if (LOGGING_FORMAT == "CLI") {
    transport = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.cli()
        )
    });
} else {
    transport = new winston.transports.Console();
}

const libLogger : winston.Logger = winston.createLogger({
    transports: transport
});

export const logger: WinstonLogger = new WinstonLogger(
    SERVICE_NAME,
    libLogger
);
