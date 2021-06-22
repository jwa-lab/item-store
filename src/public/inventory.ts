import { Subscription } from "nats";
import { SERVICE_NAME } from "../config";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";

export const inventoryPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "inventory",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const correlationId = message.headers?.values("Correlationid")[0];
                    const natsConnection = getConnection();
                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const response = await natsConnection.request(
                        "item-store.assign_inventory_item",
                        jsonCodec.encode(body),
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
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "GET",
        "inventory",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const correlationId = message.headers?.values("Correlationid")[0];
                    const { query, body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const response = await natsConnection.request(
                        "item-store.get_inventory_items",
                        jsonCodec.encode({
                            user_id: (body as { user_id: string }).user_id,
                            ...(query as { start: number; limit: number })
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
        "GET",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const urlParameter = String(message.subject).split(".")[2];

                    const correlationId = message.headers?.values("Correlationid")[0];
                    const response = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: urlParameter
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
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const urlParameter = String(message.subject).split(".")[2];

                    const correlationId = message.headers?.values("Correlationid")[0];
                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const response = await natsConnection.request(
                        "item-store.update_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: urlParameter,
                            data: body
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
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "PATCH",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const urlParameter = String(message.subject).split(".")[2];

                    const correlationId = message.headers?.values("Correlationid")[0];
                    const body = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const { new_user_id } = body.body as {
                        new_user_id: string;
                    };

                    const response = await natsConnection.request(
                        "item-store.transfer_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: urlParameter,
                            new_user_id,
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
        },
        {
            queue: SERVICE_NAME
        }
    ]
];
