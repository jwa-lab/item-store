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
import { SearchParamsRequest, SearchByUserIdRequest } from "../services/validatorSchema";
import * as yup from "yup";

interface SearchQuery {
    start: number;
    limit: number;
}

const WarehouseItemSchema = yup.object().shape({
    name: yup
        .string()
        .strict()
        .typeError("name must be a string.")
        .defined("The name (string) must be provided."),
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .required("The data (object of string(s)) must be provided.");
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
            return yup
                .object()
                .shape(schema)
                .required("The data (object of string(s)) must be provided.");
        }
    }),
    total_quantity: yup
        .number()
        .strict()
        .typeError("total_quantity must be an integer.")
        .min(0)
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .strict()
        .typeError("available_quantity must be an integer.")
        .min(0)
        .defined("The available quantity (positive integer) must be provided.")
});

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

                const args = {start : Number(start), limit : Number(limit)};
                try {
                    await SearchParamsRequest.validate(args);
                    const items = await getWarehouseItems(
                        args.start || 0,
                        args.limit ? args.limit : MAX_RESULTS
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
                    await SearchByUserIdRequest.validate({ item_id });
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
                    await SearchByUserIdRequest.validate({ item_id });
                    await WarehouseItemSchema.validate(data);
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
