import { getClient } from "./elasticSearch";
import { JSONWarehouseItem } from "../item";
import { INDEXES } from "../config";
import { getAdminDocField, setAdminDocField } from "./adminStore";

export async function addWarehouseItem(
    data: JSONWarehouseItem
): Promise<number> {
    const client = getClient();

    const lastId = await getAdminDocField<number>("last_warehouse_item_id");
    const newId = lastId + 1;

    await client.index({
        index: INDEXES.WAREHOUSE,
        id: String(newId),
        body: {
            ...data,
            item_id: newId
        }
    });

    await setAdminDocField<number>("last_warehouse_item_id", newId);

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
