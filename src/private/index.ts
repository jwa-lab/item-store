import { Subscription } from "nats";

import { jsonCodec, NatsHandler } from "../nats";
import { ELASTICSEARCH_INDEX_NAME } from "../config";
import { addWarehouseItem, getWarehouseItem, updateWarehouseItem } from "../services/warehouseItemStore";
import { WarehouseItem } from "../item";

export const itemStoreHandlers: NatsHandler[] = [
    [
        "_add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const item = jsonCodec.decode(message.data) as WarehouseItem;

                try {
                    const response = await addWarehouseItem(
                        String(item.item_id),
                        item
                    );

                    console.log(
                        `[ITEM-STORE] Item added to ${ELASTICSEARCH_INDEX_NAME}`,
                        response
                    );

                    message.respond(
                        jsonCodec.encode({
                            item
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error adding item to ${ELASTICSEARCH_INDEX_NAME}`,
                        err
                    );

                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],
    [
        "_get_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(message.data) as WarehouseItem;

                try {
                    const response = await getWarehouseItem(String(item_id));

                    message.respond(
                        jsonCodec.encode({
                            item: response.body._source
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error getting item from ${ELASTICSEARCH_INDEX_NAME}`,
                        err
                    );

                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],
    [
        "_update_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const data = jsonCodec.decode(message.data) as WarehouseItem;

                try {
                    const response = await updateWarehouseItem(
                        String(data.item_id),
                        data
                    )

                    console.log(
                        `[ITEM-STORE] Item updated in ${ELASTICSEARCH_INDEX_NAME}`,
                        data,
                        response
                    );

                    message.respond(
                        jsonCodec.encode({
                            item: data
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error updating item in ${ELASTICSEARCH_INDEX_NAME}`,
                        err
                    );

                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ]
];
