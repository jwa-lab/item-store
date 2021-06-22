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
import {
    UserSchema,
    ItemSpecsSchema,
    ItemSchema
} from "../services/validatorSchema";
import * as yup from "yup";

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

const InventorySchema = yup.object({
    inventory_item_id: yup
        .string()
        .strict()
        .typeError("inventory_item_id must be a string.")
        .defined("The inventory_item_id (string) must be provided.")
});

export const DataUpdateSchema = yup.object({
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup.object().optional();
        else {
            const schema = Object.keys(value).reduce(
                (acc: any, curr: string) => {
                    acc[curr] = yup
                        .string()
                        .strict()
                        .typeError("data's field must be a string.")
                        .required(
                            "The data's field (string) must be provided."
                        );
                    return acc;
                },
                {}
            );
            return yup.object().shape(schema).optional();
        }
    })
});

export const inventoryPrivateHandlers: PrivateNatsHandler[] = [
    [
        "assign_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { user_id, item_id } = jsonCodec.decode(
                    message.data
                ) as AssignItemRequest;

                try {
                    await ItemSchema.validate({ item_id });
                    await UserSchema.validate({ user_id });
                    const data = await getWarehouseItem(item_id);

                    if (data.available_quantity <= 0) {
                        throw new Error(`ITEM_SOLD_OUT: ${item_id}`);
                    } else {
                        await updateWarehouseItemField(
                            item_id,
                            "available_quantity",
                            data.available_quantity - 1
                        );

                        const instance_number =
                            data.total_quantity - data.available_quantity + 1;

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
                    await InventorySchema.validate({ inventory_item_id });
                    await DataUpdateSchema.validate({ data });

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
                    await InventorySchema.validate({ inventory_item_id });
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
                    await UserSchema.validate({ user_id });
                    await ItemSpecsSchema.validate({ start, limit });
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
