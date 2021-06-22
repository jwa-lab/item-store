import * as winston from "winston";

export const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
    ],
})

export const logModel = {
    service: "",
    date: new Date(),
}