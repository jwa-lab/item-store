import {
    connect,
    NatsConnection,
    Subscription,
    JSONCodec,
    SubscriptionOptions
} from "nats";
import { INDEXES, NATS_URL } from "../config";
import { logger } from "../services/logger";

const logModel = {
    service: "[ITEM-STORE]",
    date: new Date(),
}

type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

export type PrivateNatsHandler = [
    topic: string,
    handler: (subscription: Subscription) => Promise<void>,
    options?: Omit<SubscriptionOptions, "callback">
];

export type PublicNatsHandler = [
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    topic: string,
    handler: (subscription: Subscription) => Promise<void>,
    options?: Omit<SubscriptionOptions, "callback">
];

export interface AirlockPayload {
    body: JSONValue;
    query: JSONValue;
}

let natsConnection: NatsConnection;

export async function init(): Promise<void> {
    natsConnection = await connect({
        servers: NATS_URL
    });

    logger.log({
        level: 'info',
        logInfos: logModel,
        message: `Connected to Nats on ${natsConnection.getServer()}`,
        correlationId: '123',
    });

    (async () => {
        for await (const status of natsConnection.status()) {
            logger.log({
                level: 'info',
                logInfos: logModel,
                message: `${status.type}: ${JSON.stringify(status.data)}`,
                correlationId: '123',
            });
        }
    })().then();
}

export function registerPrivateHandlers(
    prefix: string,
    handlers: PrivateNatsHandler[]
): void {
    handlers.map(([subject, handler, options]) => {
        const fullSubject = `${prefix}.${subject}`;
        logger.log({
            level: 'info',
            logInfos: logModel,
            message: `Registering private handler ${fullSubject}`,
            correlationId: '123',
        });
        handler(natsConnection.subscribe(fullSubject, options));
    });
}

export function registerPublicHandlers(
    prefix: string,
    handlers: PublicNatsHandler[]
): void {
    handlers.map(([method, subject, handler, options]) => {
        const fullSubject = `${method}:${prefix}.${subject}`;
        logger.log({
            level: 'info',
            logInfos: logModel,
            message: `Registering public handler ${fullSubject}`,
            correlationId: '123',
        });
        handler(natsConnection.subscribe(fullSubject, options));
    });
}

export function drain(): Promise<void> {
    logger.log({
        level: 'info',
        logInfos: logModel,
        message: `Draining connection to NATS server ${NATS_URL}`,
        correlationId: '123',
    });
    return natsConnection.drain();
}

export function getConnection(): NatsConnection {
    return natsConnection;
}

export const jsonCodec = JSONCodec();
