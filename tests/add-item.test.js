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
        let item_id;

        beforeAll(async () => {
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
                })
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

    describe("When I add a new Item with a Validation Error [a field (total_quantity) is missing]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    available_quantity: 1000
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual(
                "The total quantity (positive integer) must be provided."
            );
        });
    });
    describe("When I add a new Item with a Validation Error [a number (total_quantity) is negative]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "100"
                    },
                    total_quantity: -1000,
                    available_quantity: 1000
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual(
                "total_quantity must be greater than or equal to 0"
            );
        });
    });
    describe("When I add a new Item with a Validation Error [a field (name) is wrong-typed]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: ["234"],
                    data: {
                        XP: "100"
                    },
                    total_quantity: 1000,
                    available_quantity: 1000
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("name must be a string.");
        });
    });
    describe("When I add a new Item with a Validation Error [a field (data) is wrong-typed]", () => {
        let response;
        let message;
        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "234",
                    data: {
                        XP: 100
                    },
                    total_quantity: 1000,
                    available_quantity: 1000
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("data's field must be a string.");
        });
    });
    describe("When I add a new Item with a Validation Error [a field (data) is missing]", () => {
        let response;
        let message;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "234",
                    total_quantity: 1000,
                    available_quantity: 0
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual(
                "The data (object of string(s)) must be provided."
            );
        });
    });
});
