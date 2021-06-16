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
import {
    WarehouseItemSchema,
    ItemSpecsSchema,
    ItemSchema,
    WarehouseItemUpdateSchema, DataSchema
} from "../services/validatorSchema";

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
                const item = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    await WarehouseItemSchema.validate(item);

                    const newItemId = await addWarehouseItem(item);

                    console.log(
                        `[ITEM-STORE] Item added to ${INDEXES.WAREHOUSE} with id ${newItemId}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            item_id: newItemId
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error adding item to ${INDEXES.WAREHOUSE}`,
                        err
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
    ],
    [
        "get_warehouse_items",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const data = jsonCodec.decode(message.data) as AirlockPayload;
                const { start, limit } = (data as unknown) as SearchQuery;

                try {
                    await ItemSpecsSchema.validate({ start, limit });
                    const items = await getWarehouseItems(
                        start || 0,
                        limit ? limit : MAX_RESULTS
                    );

                    message.respond(jsonCodec.encode(items));
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error getting items from ${INDEXES.WAREHOUSE}`,
                        err
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
                    await ItemSchema.validate({ item_id });
                    const item = await getWarehouseItem(item_id);

                    message.respond(jsonCodec.encode(item));
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error getting item ${item_id} from ${INDEXES.WAREHOUSE}`,
                        err
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
                    const item_id = data.item_id;
                    await ItemSchema.validate({ item_id });
                    await WarehouseItemUpdateSchema.validate(data);
                    await updateWarehouseItem(data.item_id, data);

                    console.log(
                        `[ITEM-STORE] Item ${data.item_id} updated in ${INDEXES.WAREHOUSE}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            item_id: data.item_id
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error updating item ${data.item_id} in ${INDEXES.WAREHOUSE}`,
                        err
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
