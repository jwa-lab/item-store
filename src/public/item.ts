import { Subscription } from "nats";
import { JSONWarehouseItem } from "../item";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";

export const itemPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const response = await natsConnection.request(
                        "item-store.add_warehouse_item",
                        message.data
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

                    const urlParameter = String(message.subject).split(".")[2];

                    const data = jsonCodec.decode(
                        message.data
                    ) as JSONWarehouseItem;

                    if (data.item_id !== Number(urlParameter)) {
                        throw new Error(
                            "url parameter and item_id don't match"
                        );
                    }

                    const response = await natsConnection.request(
                        "item-store.update_warehouse_item",
                        jsonCodec.encode({
                            ...data,
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
