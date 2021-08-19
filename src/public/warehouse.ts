import { SearchResponse } from "elasticsearch";
import { headers, Subscription } from "nats";
import * as yup from "yup";
import { SERVICE_NAME } from "../config";
import { JSONWarehouseItem } from "../item";
import {
    AirlockPayload,
    getConnection,
    jsonCodec, parseJwtToNats,
    PublicNatsHandler
} from "../services/nats";
import { itemIdValidator, warehouseItemValidator } from "../utils/validators";

interface GetItemsQuery {
    start: number;
    limit: number;
}

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

                    if (!message?.headers) {
                        throw new Error("MISSING_HEADERS");
                    }
                    const natsHeaders = parseJwtToNats('abcd');

                    await warehouseItemValidator.validate(body);

                    // What does our token looks like ? What kind of validation do we want ? How to recognize a studio token from a user token ? (sub === cid in studio token)
                    //const studioId = jwtDecode(message.headers.get('Authorization'))?.cid;

                    const response = await natsConnection.request(
                        "item-store.add_warehouse_item",
                        jsonCodec.encode(body),
                        {
                            timeout: 1000, // PR Comment only: timeout is required in request options object, no default value var found in Nats for timeout.
                            headers: natsHeaders
                        }
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
        "item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const { query } = jsonCodec.decode(
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
                        .validate((query as unknown) as GetItemsQuery);

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

                    const item_id = Number(message.subject.split(".")[2]);

                    await itemIdValidator.validate(item_id);

                    const response = await natsConnection.request(
                        "item-store.get_warehouse_item",
                        jsonCodec.encode({
                            item_id
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

                    const item_id = Number(message.subject.split(".")[2]);

                    await itemIdValidator.validate(item_id);
                    await warehouseItemValidator.validate(body);

                    if ((body as JSONWarehouseItem).item_id !== item_id) {
                        throw new Error(
                            "url parameter and item_id don't match"
                        );
                    }

                    const response = await natsConnection.request(
                        "item-store.update_warehouse_item",
                        jsonCodec.encode({
                            ...(body as JSONWarehouseItem),
                            item_id
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
