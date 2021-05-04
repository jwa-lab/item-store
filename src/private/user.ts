import { Subscription } from "nats";
import { jsonCodec, PrivateNatsHandler } from "../services/nats";
import { INDEXES } from "../config";
import { addUser, getUser, updateUser } from "../services/userStore";
import { JSONUser } from "../user";

interface GetUserRequest {
    user_id: string;
}

interface UpdateUserRequest {
    user_id: string;
    user: JSONUser;
}

export const userPrivateHandlers: PrivateNatsHandler[] = [
    [
        "add_user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const user = jsonCodec.decode(message.data) as JSONUser;

                try {
                    const newUserId = await addUser(user);

                    console.log(
                        `[USER-STORE] User added to ${INDEXES.USER} with id ${newUserId}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            user_id: newUserId
                        })
                    );
                } catch (err) {
                    console.error(
                        `[USER-STORE] Error adding user to ${INDEXES.USER}`,
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
        "get_user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { user_id } = jsonCodec.decode(
                    message.data
                ) as GetUserRequest;

                try {
                    const user = await getUser(user_id);

                    message.respond(jsonCodec.encode(user));
                } catch (err) {
                    console.error(
                        `[USER-STORE] Error getting user ${user_id} from ${INDEXES.USER}`,
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
        "update_user",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { user_id, user } = jsonCodec.decode(
                    message.data
                ) as UpdateUserRequest;

                try {
                    await updateUser(user_id, user);

                    console.log(
                        `[USER-STORE] User ${user_id} updated in ${INDEXES.USER}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            user_id
                        })
                    );
                } catch (err) {
                    console.error(
                        `[USER-STORE] Error updating user ${user_id} in ${INDEXES.USER}`,
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
    ]
];
