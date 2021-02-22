import { Subscription } from "nats";

import { jsonCodec, NatsHandler } from "../nats";
import { getClient } from "../elasticSearch";
import { ELASTICSEARCH_INDEX_NAME } from "../config";
import { JSONItem } from "../item";

export const itemStoreHandlers: NatsHandler[] = [
    [
        "item-store_add_item",
        async (subscription: Subscription): Promise<void> => {
            const client = getClient();

            for await (const message of subscription) {
                const item = jsonCodec.decode(message.data) as JSONItem;

                try {
                    const reponse = await client.index({
                        index: ELASTICSEARCH_INDEX_NAME,
                        id: String(item.item_id),
                        body: item
                    });

                    console.log(
                        `[ITEM-STORE] Item added to ${ELASTICSEARCH_INDEX_NAME}`,
                        reponse
                    );

                    message.respond(
                        jsonCodec.encode({
                            item
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error adding item to ${ELASTICSEARCH_INDEX_NAME}`,
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
        "item-store_get_item",
        async (subscription: Subscription): Promise<void> => {
            const client = getClient();
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(message.data) as JSONItem;

                try {
                    const response = await client.get({
                        index: ELASTICSEARCH_INDEX_NAME,
                        id: String(item_id)
                    });

                    message.respond(
                        jsonCodec.encode({
                            item: response.body._source
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error getting item from ${ELASTICSEARCH_INDEX_NAME}`,
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
        "item-store_update_item",
        async (subscription: Subscription): Promise<void> => {
            const client = getClient();

            for await (const message of subscription) {
                const data = jsonCodec.decode(message.data) as JSONItem;

                try {
                    const response = await client.update({
                        index: ELASTICSEARCH_INDEX_NAME,
                        id: String(data.item_id),
                        body: {
                            doc: data
                        }
                    });

                    console.log(
                        `[ITEM-STORE] Item updated in ${ELASTICSEARCH_INDEX_NAME}`,
                        data,
                        response
                    );

                    message.respond(
                        jsonCodec.encode({
                            data
                        })
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error updating item in ${ELASTICSEARCH_INDEX_NAME}`,
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
