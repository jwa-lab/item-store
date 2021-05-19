import { SearchResponse } from "elasticsearch";
import { Subscription } from "nats";
import { JSONWarehouseItem } from "../item";
import { warehouseItemSchema } from "../services/validatorSchema";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";

export const itemPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    warehouseItemSchema.validate(body)
                        .catch(function(err) {
                            console.log(err.errors);}
                        );

                    const response = await natsConnection.request(
                        "item-store.add_warehouse_item",
                        jsonCodec.encode(body)
                    );

                    message.respond(response.data)
                } catch (err) {
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
        "GET",
        "item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const { query } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const response = await natsConnection.request(
                        "item-store.get_warehouse_items",
                        jsonCodec.encode(query)
                    );

                    const items = jsonCodec.decode(
                        response.data
                    ) as SearchResponse<JSONWarehouseItem>[];

                    message.respond(jsonCodec.encode(items));
                } catch (err) {
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
        "GET",
        "item.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const urlParameter = String(message.subject).split(".")[2];

                    const response = await natsConnection.request(
                        "item-store.get_warehouse_item",
                        jsonCodec.encode({
                            item_id: Number(urlParameter)
                        })
                    );

                    message.respond(response.data);
                } catch (err) {
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
        "PUT",
        "item.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const urlParameter = String(message.subject).split(".")[2];

                    if (
                        (body as JSONWarehouseItem).item_id !==
                        Number(urlParameter)
                    ) {
                        throw new Error(
                            "url parameter and item_id don't match"
                        );
                    }

                    const response = await natsConnection.request(
                        "item-store.update_warehouse_item",
                        jsonCodec.encode({
                            ...(body as JSONWarehouseItem),
                            item_id: Number(urlParameter)
                        })
                    );

                    message.respond(response.data);
                } catch (err) {
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
