import { connect, NatsConnection, Subscription, JSONCodec } from "nats";
import { NATS_URL } from "../config";

export type NatsHandler = [
    topic: string,
    handler: (subscription: Subscription) => Promise<void>
];

let natsConnection: NatsConnection;

export async function init(): Promise<void> {
    natsConnection = await connect({
        servers: NATS_URL
    });

    console.info(
        `[ITEM-STORE] Connected to Nats on ${natsConnection.getServer()}`
    );

    (async () => {
        for await (const status of natsConnection.status()) {
            console.info(`${status.type}: ${JSON.stringify(status.data)}`);
        }
    })().then();
}

export async function registerHandlers(
    prefix: string,
    handlers: NatsHandler[]
): Promise<void> {
    await Promise.all(
        handlers.map(([subject, handler]) =>
            handler(natsConnection.subscribe(`${prefix}.${subject}`))
        )
    );
}

export function drain(): Promise<void> {
    console.log(`[ITEM-STORE] Draining connection to NATS server ${NATS_URL}`);
    return natsConnection.drain();
}

export function getConnection(): NatsConnection {
    return natsConnection;
}

export const jsonCodec = JSONCodec();