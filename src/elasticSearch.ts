import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URI } from "./config";

let client: Client;

export async function initElasticSearch(): Promise<void> {
    client = new Client({ node: ELASTICSEARCH_URI });

    console.log(`[ITEM-STORE] Connected to ${ ELASTICSEARCH_URI }`);
}

export function getClient(): Client {
    return client;
}
