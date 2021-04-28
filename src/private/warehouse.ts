import { Subscription } from "nats";
import { jsonCodec, NatsHandler } from "../services/nats";
import { INDEXES } from "../config";
import {
    addWarehouseItem,
    getWarehouseItem,
    updateWarehouseItem
} from "../services/warehouseItemStore";
import { WarehouseItem } from "../item";

export const itemStoreHandlers: NatsHandler[] = [
    [
        "add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const item = jsonCodec.decode(message.data) as WarehouseItem;

                try {
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
                            error: err
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
                ) as WarehouseItem;

                try {
                    const item = await getWarehouseItem(item_id);

                    message.respond(
                        jsonCodec.encode({
                            item
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error getting item ${item_id} from ${INDEXES.WAREHOUSE}`,
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
        "update_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const data = jsonCodec.decode(message.data) as WarehouseItem;

                try {
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
                            error: err
                        })
                    );
                }
            }
        }
    ]
];
