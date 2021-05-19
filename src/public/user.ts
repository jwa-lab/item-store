import { Subscription } from "nats";
import { userSchema, warehouseItemSchema } from "../services/validatorSchema";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";
import { JSONUser } from "../user";

import * as yup from 'yup';

export const userPublicHandlers: PublicNatsHandler[] = [
    [
        "POST",
        "user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const data = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;

                    const user = (data.body as unknown) as JSONUser;

                    userSchema.validate(user)
                        .catch(function(err) {
                            console.log(err.errors);}
                        );

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
