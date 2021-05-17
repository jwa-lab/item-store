import { Subscription } from "nats";
import { INDEXES } from "../config";
import {
    addInventoryItem,
    getInventoryItem,
    getInventoryItemsByUserId,
    updateInventoryItem
} from "../services/inventoryItemStore";
import { jsonCodec, PrivateNatsHandler } from "../services/nats";
import {
    getWarehouseItem,
    updateWarehouseItemField
} from "../services/warehouseItemStore";

interface AssignItemRequest {
    user_id: string;
    item_id: number;
}

interface UpdateInventoryItemRequest {
    inventory_item_id: string;
    data: { [k: string]: string };
}

interface GetInventoryItemRequest {
    inventory_item_id: string;
}

interface SearchInventoryItemsByUser {
    user_id: string;
    start: number;
    limit: number;
}

export const inventoryPrivateHandlers: PrivateNatsHandler[] = [
    [
        "assign_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id, user_id } = jsonCodec.decode(
                    message.data
                ) as AssignItemRequest;

                try {
                    const {
                        available_quantity,
                        total_quantity
                    } = await getWarehouseItem(item_id);

                    if (available_quantity <= 0) {
                        throw new Error(`ITEM_SOLD_OUT: ${item_id}`);
                    } else {
                        await updateWarehouseItemField(
                            item_id,
                            "available_quantity",
                            available_quantity - 1
                        );

                        const instance_number =
                            total_quantity - available_quantity + 1;

                        const inventory_item_id = await addInventoryItem({
                            item_id,
                            user_id,
                            instance_number,
                            data: {}
                        });

                        console.log(
                            `[ITEM-STORE] Item ${item_id} assigned to user ${user_id} in ${INDEXES.INVENTORY}`
                        );

                        message.respond(
                            jsonCodec.encode({
                                inventory_item_id
                            })
                        );
                    }
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error assigning item ${item_id} to user ${user_id} in ${INDEXES.INVENTORY}`,
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
        "update_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { inventory_item_id, data } = jsonCodec.decode(
                    message.data
                ) as UpdateInventoryItemRequest;

                try {
                    const inventoryItem = await getInventoryItem(
                        inventory_item_id
                    );

                    await updateInventoryItem(inventory_item_id, {
                        ...inventoryItem,
                        data: {
                            ...inventoryItem.data,
                            ...data
                        }
                    });

                    console.log(
                        `[ITEM-STORE] Item ${inventory_item_id} updated in ${INDEXES.INVENTORY}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            inventory_item_id
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error updating item ${inventory_item_id} in ${INDEXES.INVENTORY}`,
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
        "get_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { inventory_item_id } = jsonCodec.decode(
                    message.data
                ) as GetInventoryItemRequest;

                try {
                    const inventoryItem = await getInventoryItem(
                        inventory_item_id
                    );

                    message.respond(jsonCodec.encode(inventoryItem));
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error retrieving item ${inventory_item_id} from ${INDEXES.INVENTORY}`,
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
        "get_inventory_items",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { user_id, start, limit } = jsonCodec.decode(
                    message.data
                ) as SearchInventoryItemsByUser;

                try {
                    const inventoryItemsSearchResults = await getInventoryItemsByUserId(
                        user_id,
                        start,
                        limit
                    );

                    message.respond(
                        jsonCodec.encode(inventoryItemsSearchResults)
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error retrieving items for user_id ${user_id} in ${INDEXES.INVENTORY}`,
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
    ]
];
