import { Subscription } from "nats";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";
import { JSONUser } from "../user";

export const userPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const user = jsonCodec.decode(message.data) as JSONUser;

                    const response = await natsConnection.request(
                        "item-store.add_user",
                        jsonCodec.encode(user)
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
        "user.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const documentId = String(message.subject).split(".")[2];

                    const response = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id: documentId
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
