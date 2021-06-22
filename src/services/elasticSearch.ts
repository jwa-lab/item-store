import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URI, INDEXES, SERVICE_NAME } from "../config";
import { logger, logModel } from "../services/logger";

logModel.service = SERVICE_NAME;

let client: Client;

export function initElasticSearch(): void {
    client = new Client({ node: ELASTICSEARCH_URI });

    logModel.date = new Date();
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
