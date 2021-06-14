const { connect, JSONCodec } = require("nats");

describe("Given Item Store is connected to NATS", () => {
    let natsConnection;
    const jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    afterAll(async () => {
        await natsConnection.drain();
    });

    describe("When I add a new User", () => {
        let response;
        let documentId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_user",
                jsonCodec.encode({
                    user_id: 12,
                    inventory_address: "KT1_SFFG345FFSFdqsfz"
                })
            );

            documentId = jsonCodec.decode(response.data).user_id;
        });

        it("Then returns the user document id", () => {
            expect(typeof documentId).toBe("string");
        });

        describe("When I retrieve the user", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.get_user",
                    jsonCodec.encode({
                        user_id: documentId
                    })
                );
            });

            it("Then returns the user", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    user_id: 12,
                    inventory_address: "KT1_SFFG345FFSFdqsfz"
                });
            });
        });

        describe("When I update the user", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.update_user",
                    jsonCodec.encode({
                        user_id: documentId,
                        user: {
                            user_id: 12,
                            inventory_address: "KT1_NEWCONTRACTADDRESS123"
                        }
                    })
                );
            });

            it("Then returns the user_id", () => {
                expect(jsonCodec.decode(response.data).user_id).toEqual(
                    documentId
                );
            });

            describe("When I retrieve the user", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id: documentId
                        })
                    );
                });

                it("Then returns the updated user", () => {
                    expect(jsonCodec.decode(response.data)).toEqual({
                        user_id: 12,
                        inventory_address: "KT1_NEWCONTRACTADDRESS123"
                    });
                });
            });
        });
    });
    describe("When I add a new User with a Validation Error [a field (user_id) is wrong-typed]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_user",
                jsonCodec.encode({
                    user_id: "azerty",
                    inventory_address: "KT1_SFFG345FFSFdqsfz"
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("user_id must be a number.");
        });
    });
    describe("When I add a new User with a Validation Error [a field (user_id) is missing]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_user",
                jsonCodec.encode({
                    inventory_address: "KT1_SFFG345FFSFdqsfz"
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("The user_id (string) must be provided.");
        });
    });
});
