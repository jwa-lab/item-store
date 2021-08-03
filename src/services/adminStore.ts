import { getClient } from "./elasticSearch";
import { INDEXES, RETRY_ON_CONFLICT_RETRIES } from "../config";

const ADMIN_DOC_ID = String(0);

export async function ensureAdminDoc(): Promise<void> {
    const client = getClient();

    const response = await client.exists({
        index: INDEXES.ADMIN,
        id: ADMIN_DOC_ID
    });

    if (!response.body) {
        await client.index({
            index: INDEXES.ADMIN,
            id: ADMIN_DOC_ID,
            body: {
                last_warehouse_item_id: 0
            },
            refresh: true
        });
    }
}

export async function incrementLastWarehouseItemId(): Promise<number> {
    const client = getClient();

    await client.update({
        index: INDEXES.ADMIN,
        id: ADMIN_DOC_ID,
        retry_on_conflict: RETRY_ON_CONFLICT_RETRIES,
        body: {
            script: {
                source: "ctx._source.last_warehouse_item_id++"
            }
        },
        refresh: true
    });

    return getAdminDocField<number>("last_warehouse_item_id");
}

export async function getAdminDocField<T>(fieldName: string): Promise<T> {
    const client = getClient();

    const document = await client.get({
        index: INDEXES.ADMIN,
        id: ADMIN_DOC_ID
    });

    return document.body._source[fieldName];
}

export async function setAdminDocField<T>(
    fieldName: string,
    value: T
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.ADMIN,
        id: ADMIN_DOC_ID,
        body: {
            doc: {
                [fieldName]: value
            }
        },
        refresh: true
    });
}
