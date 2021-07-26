import { Subscription } from "nats";
import * as yup from "yup";
import { SERVICE_NAME } from "../config";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";
import {
    dataValidator,
    inventoryItemIdValidator,
    itemIdValidator,
    userDocumentIdValidator
} from "../utils/validators";

interface GetInventoryItemsQuery {
    start: number;
    limit: number;
}

export const inventoryPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "inventory",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    await yup
                        .object()
                        .shape({
                            item_id: itemIdValidator,
                            user_id: userDocumentIdValidator
                        })
                        .validate(body);
                    const response = await natsConnection.request(
                        "item-store.assign_inventory_item",
                        jsonCodec.encode(body)
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

                    const { query, body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    await yup
                        .object({
                            start: yup
                                .number()
                                .typeError("start must be an integer.")
                                .min(0)
                                .defined(
                                    "The start (positive integer) must be provided."
                                ),
                            limit: yup
                                .number()
                                .typeError("limit must be an integer.")
                                .min(0)
                                .defined(
                                    "The limit (positive integer) must be provided."
                                )
                        })
                        .validate((query as unknown) as GetInventoryItemsQuery);

                    await yup
                        .object({
                            user_id: userDocumentIdValidator
                        })
                        .validate(body);

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

                    const inventory_item_id = String(message.subject).split(
                        "."
                    )[2];

                    await inventoryItemIdValidator.validate(inventory_item_id);

                    const response = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id
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

                    const inventory_item_id = String(message.subject).split(
                        "."
                    )[2];

                    await inventoryItemIdValidator.validate(inventory_item_id);

                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    await dataValidator.validate(body);

                    const response = await natsConnection.request(
                        "item-store.update_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id,
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

                    const inventory_item_id = String(message.subject).split(
                        "."
                    )[2];

                    await inventoryItemIdValidator.validate(inventory_item_id);

                    const body = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const { new_user_id } = body.body as {
                        new_user_id: string;
                    };

                    await userDocumentIdValidator.validate(new_user_id);

                    const response = await natsConnection.request(
                        "item-store.transfer_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id,
                            new_user_id
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
