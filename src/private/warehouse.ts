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
import { logger } from "../di";

interface SearchQuery {
    start: number;
    limit: number;
}

const MAX_RESULTS = 100;

export const warehousePrivateHandlers: PrivateNatsHandler[] = [
    [
        "add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const item = jsonCodec.decode(
                        message.data
                    ) as JSONWarehouseItem;

                    if (!message.headers) {
                        throw new Error("NATS_HEADERS_NOT_FOUND");
                    }

                    const studio_id = message.headers.get("studio_id");

                    if (!studio_id) {
                        throw new Error("NO_STUDIO_ID_GIVEN_IN_HEADERS");
                    }

                    const newItemId = await addWarehouseItem({
                        ...item,
                        studio_id
                    });

                    logger.info(
                        `Item added to ${INDEXES.WAREHOUSE} with id ${newItemId}`
                    );
                    message.respond(
                        jsonCodec.encode({
                            item_id: newItemId
                        })
                    );
                } catch (err) {
                    logger.error(`Error adding item to ${INDEXES.WAREHOUSE}`);

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
                try {
                    const data = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    if (!message.headers) {
                        throw new Error("NATS_HEADERS_NOT_FOUND");
                    }

                    const studio_id = message.headers.get("studio_id");

                    if (!studio_id) {
                        throw new Error("NO_STUDIO_ID_GIVEN_IN_HEADERS");
                    }

                    const { start, limit } = (data as unknown) as SearchQuery;

                    const args = { start: Number(start), limit: Number(limit) };

                    const items = await getWarehouseItems(
                        args.start || 0,
                        args.limit ? args.limit : MAX_RESULTS,
                        studio_id
                    );

                    message.respond(jsonCodec.encode(items));
                } catch (err) {
                    logger.error(
                        `Error getting items from ${INDEXES.WAREHOUSE}`
                    );
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
                    logger.error(
                        `Error getting item ${item_id} from ${INDEXES.WAREHOUSE}`
                    );
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

                    logger.info(
                        `Item ${data.item_id} updated in ${INDEXES.WAREHOUSE}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            item_id: data.item_id
                        })
                    );
                } catch (err) {
                    logger.error(
                        `Error updating item ${data.item_id} in ${INDEXES.WAREHOUSE}`
                    );
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
