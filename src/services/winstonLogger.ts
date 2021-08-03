import * as winston from "winston";
import { GenercicLogger } from "./loggerAbstract";

export class WinstonLogger extends GenercicLogger {
    serviceName: string;
    logger: winston.Logger;

    constructor(serviceName: string, logger: winston.Logger) {
        super();
        this.serviceName = serviceName;
        this.logger = logger;
    }

    protected log(level: string, message: string): void {
        this.logger.log({
            level,
            logInfos: {
                service: this.serviceName,
                date: new Date()
            },
            message
        });
    }
}
