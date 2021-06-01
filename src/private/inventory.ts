import { Subscription } from "nats";

import { INDEXES, SERVICE_NAME } from "../config";

import {
    addInventoryItem,
    getInventoryItem,
    getInventoryItemsByUserId,
    updateInventoryItemData,
    updateInventoryItemUser
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

interface TransferInventoryItemRequest {
    inventory_item_id: string;
    new_user_id: string;
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
        },
        {
            queue: SERVICE_NAME
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
                    await updateInventoryItemData(inventory_item_id, data);

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
        },
        {
            queue: SERVICE_NAME
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
                    const inventory_item = await getInventoryItem(
                        inventory_item_id
                    );

                    message.respond(jsonCodec.encode(inventory_item));
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
    ],
    [
        "transfer_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { inventory_item_id, new_user_id } = jsonCodec.decode(
                    message.data
                ) as TransferInventoryItemRequest;

                try {
                    await updateInventoryItemUser(
                        inventory_item_id,
                        new_user_id
                    );

                    console.log(
                        `[ITEM-STORE] Item ${inventory_item_id} transfered to user ${new_user_id} in ${INDEXES.INVENTORY}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            inventory_item_id,
                            new_user_id
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error transfering item for user_id ${new_user_id} in ${INDEXES.INVENTORY}`,
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
