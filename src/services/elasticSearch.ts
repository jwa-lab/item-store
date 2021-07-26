import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URI } from "../config";
import { logger } from "../di";

let client: Client;

export function initElasticSearch(): void {
    client = new Client({ node: ELASTICSEARCH_URI });

    logger.info(`Connected to ElasticSearch on ${ELASTICSEARCH_URI}`);
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
