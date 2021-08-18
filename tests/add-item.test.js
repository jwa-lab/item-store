const { connect, JSONCodec, headers } = require("nats");

const STUDIO_ID = "test_id";

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
        let item_id;

        beforeAll(async () => {
            const natsHeaders = headers();

            natsHeaders.set("studio_id", STUDIO_ID);
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    total_quantity: 1000,
                    available_quantity: 1000
                }),
                { headers: natsHeaders }
            );

            item_id = jsonCodec.decode(response.data).item_id;
        });

        it("Then returns the item id", () => {
            expect(typeof item_id).toBe("number");
        });

        describe("When I retrieve the item", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.get_warehouse_item",
                    jsonCodec.encode({
                        item_id: item_id
                    })
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    item_id: item_id,
                    studio_id: STUDIO_ID,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    total_quantity: 1000,
                    available_quantity: 1000
                });
            });
        });

        describe("When I update the item", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.update_warehouse_item",
                    jsonCodec.encode({
                        name: "Lionel Messi",
                        no_update_after: undefined,
                        item_id: item_id,
                        studio_id: STUDIO_ID,
                        data: {
                            XP: "80"
                        },
                        total_quantity: 1000,
                        available_quantity: 1000
                    })
                );
            });

            it("Then returns the item_id", () => {
                expect(jsonCodec.decode(response.data).item_id).toEqual(
                    item_id
                );
            });

            describe("When I retrieve the item", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.get_warehouse_item",
                        jsonCodec.encode({
                            item_id
                        })
                    );
                });

                it("Then returns the updated item", () => {
                    expect(jsonCodec.decode(response.data)).toEqual({
                        item_id: item_id,
                        studio_id: STUDIO_ID,
                        name: "Lionel Messi",
                        data: {
                            XP: "80"
                        },
                        total_quantity: 1000,
                        available_quantity: 1000
                    });
                });
            });
        });
    });
});
