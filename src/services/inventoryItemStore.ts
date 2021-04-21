import { INDEXES } from "../config";
import { JSONInventoryItem } from "../item";
import { getClient } from "./elasticSearch";

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

export async function updateInventoryItem(
    id: string,
    data: JSONInventoryItem
): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.INVENTORY,
        id,
        body: {
            doc: data
        }
    });
}
