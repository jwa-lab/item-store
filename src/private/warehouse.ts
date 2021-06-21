import { Subscription } from "nats";
import {
    AirlockPayload,
    jsonCodec,
    PrivateNatsHandler
} from "../services/nats";
import { INDEXES, SERVICE_NAME } from "../config";
import {
    addWarehouseItem,
    getWarehouseItem,
    getWarehouseItems,
    updateWarehouseItem
} from "../services/warehouseItemStore";
import { JSONWarehouseItem } from "../item";
import { logger } from "../services/logger";

interface SearchQuery {
    start: number;
    limit: number;
}

const MAX_RESULTS = 100;

const logModel = {
    service: "[ITEM-STORE]",
    date: new Date(),
}

export const warehousePrivateHandlers: PrivateNatsHandler[] = [
    [
        "add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const item = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    const newItemId = await addWarehouseItem(item);

                    logger.log({
                        level: 'info',
                        logInfos: logModel,
                        message: `Item added to ${INDEXES.WAREHOUSE} with id ${newItemId}`,
                        correlationId: "122",
                    });
                    message.respond(
                        jsonCodec.encode({
                            item_id: newItemId
                        })
                    );
                } catch (err) {
                    logger.log({
                        level: 'error',
                        logInfos: logModel,
                        message: `Error adding item to ${INDEXES.WAREHOUSE}`,
                        correlationId: "123",
                        error: err,
                    });

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "get_warehouse_items",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const data = jsonCodec.decode(message.data) as AirlockPayload;
                const { start, limit } = (data as unknown) as SearchQuery;

                try {
                    const items = await getWarehouseItems(
                        start || 0,
                        limit ? limit : MAX_RESULTS
                    );

                    message.respond(jsonCodec.encode(items));
                } catch (err) {
                    logger.log({
                        level: 'error',
                        logInfos: logModel,
                        message: `Error getting items from ${INDEXES.WAREHOUSE}`,
                        correlationId: "124",
                        error: err,
                    });

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        }
    ],
    [
        "get_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    const item = await getWarehouseItem(item_id);

                    message.respond(jsonCodec.encode(item));
                } catch (err) {
                    logger.log({
                        level: 'error',
                        logInfos: logModel,
                        message: `Error getting item ${item_id} from ${INDEXES.WAREHOUSE}`,
                        correlationId: "125",
                        error: err,
                    });

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        }
    ],
    [
        "update_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const data = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    await updateWarehouseItem(data.item_id, data);

                    logger.log({
                        level: 'info',
                        logInfos: logModel,
                        message: `Item ${data.item_id} updated in ${INDEXES.WAREHOUSE}`,
                        correlationId: "126",
                    });

                    message.respond(
                        jsonCodec.encode({
                            item_id: data.item_id
                        })
                    );
                } catch (err) {
                    logger.log({
                        level: 'error',
                        logInfos: logModel,
                        message: `Error updating item ${data.item_id} in ${INDEXES.WAREHOUSE}`,
                        correlationId: "127",
                        error: err,
                    });

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        },
        {
            queue: SERVICE_NAME
        }
    ]
];
