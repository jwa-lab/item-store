import { SearchResponse } from "elasticsearch";
import { INDEXES } from "../config";
import { JSONInventoryItem } from "../item";
import { getClient } from "./elasticSearch";

interface InventoryItemsByUserIdSearchResults {
    total: number;
    results: JSONInventoryItem[];
}

export async function addInventoryItem(
    data: JSONInventoryItem
): Promise<string> {
    const client = getClient();

    const response = await client.index({
        index: INDEXES.INVENTORY,
        body: data
    });

    return response.body._id;
}

export async function getInventoryItem(id: string): Promise<JSONInventoryItem> {
    const client = getClient();

    const response = await client.get({
        index: INDEXES.INVENTORY,
        id
    });

    return response.body._source;
}

export async function updateInventoryItemData(
    id: string,
    new_data: { [k: string]: string }
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.INVENTORY,
        id,
        body: {
            doc: {
                data: new_data
            }
        }
    });
}

export async function updateInventoryItemUser(
    id: string,
    new_user_id: string
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.INVENTORY,
        id,
        body: {
            doc: {
                user_id: new_user_id
            }
        }
    });
}

export async function getInventoryItemsByUserId(
    user_id: string,
    start: number,
    limit: number
): Promise<InventoryItemsByUserIdSearchResults> {
    const client = getClient();

    const response = await client.search({
        index: INDEXES.INVENTORY,
        from: start,
        size: limit,
        body: {
            query: {
                match: { user_id }
            }
        }
    });

    const responseBody = response.body as SearchResponse<JSONInventoryItem>;

    const total = responseBody.hits.total;
    const results = responseBody.hits.hits;

    return {
        total,
        results: results.map((result) => result._source)
    };
}
