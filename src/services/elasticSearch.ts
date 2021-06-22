import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URI, INDEXES } from "../config";
import { logger } from "../services/logger";

const logModel = {
    service: "[ITEM-STORE]",
    date: new Date(),
}

let client: Client;

export function initElasticSearch(): void {
    client = new Client({ node: ELASTICSEARCH_URI });

    logger.log({
        level: 'info',
        logInfos: logModel,
        message: `[ITEM-STORE] Connected to ElasticSearch on ${ELASTICSEARCH_URI}`,
        correlationId: '123',
    });
}

export async function ensureIndexExists(indexName: string): Promise<void> {
    const exists = await client.indices.exists({
        index: indexName
    });

    if (!exists.body) {
        await client.indices.create({
            index: indexName
        });
    }
}

export function getClient(): Client {
    return client;
}
