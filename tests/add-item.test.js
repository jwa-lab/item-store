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

    describe("When I add a new Item", () => {
        let response;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store_add_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    item_id: 11,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    quantity: 1000
                })
            );
        });

        it("Then returns the item", () => {
            expect(jsonCodec.decode(response.data).item).toEqual({
                item_id: 11,
                name: "Christiano Ronaldo",
                data: {
                    XP: "100"
                },
                quantity: 1000
            });
        });

        describe("When I retrieve the item", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store_get_item",
                    jsonCodec.encode({
                        item_id: 11
                    })
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data).item).toEqual({
                    item_id: 11,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    quantity: 1000
                });
            });
        });

        describe("When I update the item", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store_update_item",
                    jsonCodec.encode({
                        no_update_after: undefined,
                        item_id: 11,
                        data: {
                            XP: "80"
                        }
                    })
                );
            });

            it("Then returns the updated item", () => {
                expect(jsonCodec.decode(response.data).item).toEqual({
                    item_id: 11,
                    data: {
                        XP: "80"
                    }
                });
            });

            describe("When I retrieve the item", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store_get_item",
                        jsonCodec.encode({
                            item_id: 11
                        })
                    );
                });

                it("Then returns the updated item", () => {
                    expect(jsonCodec.decode(response.data).item).toEqual({
                        item_id: 11,
                        name: "Christiano Ronaldo",
                        data: {
                            XP: "80"
                        },
                        quantity: 1000
                    });
                });
            });
        });
    });
});
