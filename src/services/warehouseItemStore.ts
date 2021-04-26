import { getClient } from "../elasticSearch";
import { WarehouseItem } from "../item";
import { ELASTICSEARCH_INDEX_NAME } from "../config";
import { ApiResponse, Context, TransportRequestPromise } from "@elastic/elasticsearch/lib/Transport";

const client = getClient();
const WAREHOUSE_INDEX = `${ ELASTICSEARCH_INDEX_NAME }-warehouse`;

type ESTransportPromise<T> = TransportRequestPromise<ApiResponse<Record<string, T>, Context>>;

export function addWarehouseItem(id: string, data: WarehouseItem): ESTransportPromise<WarehouseItem> {
    return client.index({
        index: WAREHOUSE_INDEX,
        id,
        body: data
    });
}

export function getWarehouseItem(id: string): ESTransportPromise<WarehouseItem> {
    return client.get({
        index: WAREHOUSE_INDEX,
        id
    });
}

export function updateWarehouseItem(id: string, data: WarehouseItem): ESTransportPromise<WarehouseItem> {
    return client.update({
        index: WAREHOUSE_INDEX,
        id,
        body: {
            doc: data
        }
    });
}