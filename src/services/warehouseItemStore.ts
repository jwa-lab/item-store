import { getClient } from "./elasticSearch";
import { JSONWarehouseItem } from "../item";
import { INDEXES } from "../config";
import { incrementLastWarehouseItemId } from "./adminStore";
import { SearchResponse } from "elasticsearch";

interface WarehouseItemsSearchResults {
    total: number;
    results: JSONWarehouseItem[];
}

export async function addWarehouseItem(
    data: JSONWarehouseItem
): Promise<number> {
    const client = getClient();

    const newId = await incrementLastWarehouseItemId();

    await client.index({
        index: INDEXES.WAREHOUSE,
        id: String(newId),
        body: {
            ...data,
            item_id: newId
        }
    });

    return newId;
}

export async function getWarehouseItem(id: number): Promise<JSONWarehouseItem> {
    const client = getClient();

    const response = await client.get({
        index: INDEXES.WAREHOUSE,
        id: String(id)
    });

    return response.body._source;
}

export async function getWarehouseItems(
    from: number,
    size: number
): Promise<WarehouseItemsSearchResults> {
    const client = getClient();

    const response = await client.search({
        index: INDEXES.WAREHOUSE,
        from,
        size
    });

    const responseBody = response.body as SearchResponse<JSONWarehouseItem>;

    const total = responseBody.hits.total;
    const results = responseBody.hits.hits;

    return {
        total,
        results: results.map((result) => result._source)
    };
}

export async function updateWarehouseItem(
    id: number,
    data: JSONWarehouseItem
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.WAREHOUSE,
        id: String(id),
        body: {
            doc: data
        }
    });
}

export async function updateWarehouseItemField<T>(
    id: number,
    fieldName: string,
    value: T
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.WAREHOUSE,
        id: String(id),
        body: {
            doc: {
                [fieldName]: value
            }
        }
    });
}
