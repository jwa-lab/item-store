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
                expect(jsonCodec.decode(response.data).user).toEqual({
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
                    expect(jsonCodec.decode(response.data).user).toEqual({
                        user_id: 12,
                        inventory_address: "KT1_NEWCONTRACTADDRESS123"
                    });
                });
            });
        });
    });
});
