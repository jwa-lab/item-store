import jwtDecode from "jwt-decode";
import {
    connect,
    NatsConnection,
    Subscription,
    JSONCodec,
    SubscriptionOptions, MsgHdrs, headers
} from "nats";
import { NATS_URL } from "../config";
import { logger } from "../di";

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

interface AirlockJWT {
    uid: string;
    cid: string;
    sub?: string;
}

let natsConnection: NatsConnection;

export function parseJwtToNats(jwt: string): MsgHdrs {
    if (!jwt) {
        throw new Error("Invalid JWT");
    }
    const decoded = jwtDecode<AirlockJWT>(jwt.split(" ")[1]);
    const natsHeaders = headers();

    natsHeaders.set("studio_id", decoded?.cid || "");
    natsHeaders.set("user_id", decoded?.uid || "");
    natsHeaders.set("username", decoded?.sub || "");

    return natsHeaders;
}

export async function init(): Promise<void> {
    natsConnection = await connect({
        servers: NATS_URL
    });

    logger.info(`Connected to Nats on ${natsConnection.getServer()}`);

    (async () => {
        for await (const status of natsConnection.status()) {
            logger.info(`${status.type}: ${JSON.stringify(status.data)}`);
        }
    })().then();
}

export function registerPrivateHandlers(
    prefix: string,
    handlers: PrivateNatsHandler[]
): void {
    handlers.map(([subject, handler, options]) => {
        const fullSubject = `${prefix}.${subject}`;
        logger.info(`Registering private handler ${fullSubject}`);
        handler(natsConnection.subscribe(fullSubject, options));
    });
}

export function registerPublicHandlers(
    prefix: string,
    handlers: PublicNatsHandler[]
): void {
    handlers.map(([method, subject, handler, options]) => {
        const fullSubject = `${method}:${prefix}.${subject}`;
        logger.info(`Registering public handler ${fullSubject}`);
        handler(natsConnection.subscribe(fullSubject, options));
    });
}

export function drain(): Promise<void> {
    logger.info(`Draining connection to NATS server ${NATS_URL}`);
    return natsConnection.drain();
}

export function getConnection(): NatsConnection {
    return natsConnection;
}

export const jsonCodec = JSONCodec();
