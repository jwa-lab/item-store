import { Subscription } from "nats";
import { SERVICE_NAME } from "../config";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";
import { JSONUser } from "../user";
import { userDocumentIdValidator, userIdValidator } from "../utils/validators";

export const userPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const { body } = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    await userIdValidator.validate(
                        ((body as unknown) as JSONUser).user_id
                    );

                    const response = await natsConnection.request(
                        "item-store.add_user",
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
        "user.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const documentId = String(message.subject).split(".")[2];

                    await userDocumentIdValidator.validate(documentId);

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
