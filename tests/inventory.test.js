const { connect, JSONCodec } = require("nats");

describe("Given Inventory is connected to NATS", () => {
    let natsConnection;
    const jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    afterAll(async () => {
        await natsConnection.drain();
    });

    describe("When I assign an available item to a user", () => {
        let response;
        let warehouseItemId;
        let inventoryItemId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    total_quantity: 10,
                    available_quantity: 10
                })
            );

            warehouseItemId = jsonCodec.decode(response.data).item_id;

            response = await natsConnection.request(
                "item-store.assign_inventory_item",
                jsonCodec.encode({
                    user_id: "user_1",
                    item_id: warehouseItemId
                })
            );

            inventoryItemId = jsonCodec.decode(response.data).inventory_item_id;
            console.log(jsonCodec.decode(response.data));
        });

        it("Then returns the new inventory item id", () => {
            expect(typeof inventoryItemId).toBe("string");
        });
    });

        describe("When I retrieve the warehouse item", () => {
            let warehouseItem;

            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.get_warehouse_item",
                    jsonCodec.encode({
                        item_id: warehouseItemId
                    })
                );

                warehouseItem = jsonCodec.decode(response.data);
            });

            it("Then has reduced the available quantity by 1", () => {
                expect(warehouseItem).toEqual({
                    item_id: warehouseItemId,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    total_quantity: 1,
                    available_quantity: 0
                });
            });

            describe("When I try to assign it again", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.assign_inventory_item",
                        jsonCodec.encode({
                            user_id: "user_1",
                            item_id: warehouseItemId
                        })
                    );
                });

                it("Then returns an error", () => {
                    expect(jsonCodec.decode(response.data).error).toEqual(
                        `ITEM_SOLD_OUT: ${warehouseItemId}`
                    );
                });
            });
        });

        describe("When I retrieve the item", () => {
            let inventoryItem;

            beforeAll(async () => {
                response = await natsConnection.request(
                    "item-store.get_inventory_item",
                    jsonCodec.encode({
                        inventory_item_id: inventoryItemId
                    })
                );

                inventoryItem = jsonCodec.decode(response.data);
            });

            it("Then returns the new inventory item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    item_id: warehouseItemId,
                    user_id: "user_1",
                    instance_number: 1,
                    data: {}
                });
            });

            describe("And when I update the item", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.update_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: inventoryItemId,
                            data: {
                                XP: "3"
                            }
                        })
                    );
                });

                it("Then returns the item id", () => {
                    expect(
                        jsonCodec.decode(response.data).inventory_item_id
                    ).toEqual(inventoryItemId);
                });

                describe("When I retrieve the item", () => {
                    let inventoryItem;

                    beforeAll(async () => {
                        response = await natsConnection.request(
                            "item-store.get_inventory_item",
                            jsonCodec.encode({
                                inventory_item_id: inventoryItemId
                            })
                        );

                        inventoryItem = jsonCodec.decode(response.data);
                    });

                    it("Then returns the updated item", () => {
                        expect(jsonCodec.decode(response.data)).toEqual({
                            item_id: warehouseItemId,
                            user_id: "user_1",
                            instance_number: 1,
                            data: {
                                XP: "3"
                            }
                        });
                    });
                });
            });
        });
    });
    describe("When I assign an available Item to a User with a Validation Error [a field (user_id) is missing]", () => {
        let response;
        let message;
        let warehouseItemId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    total_quantity: 1,
                    available_quantity: 1
                })
            );

            warehouseItemId = jsonCodec.decode(response.data).item_id;

            response = await natsConnection.request(
                "item-store.assign_inventory_item",
                jsonCodec.encode({
                    item_id: warehouseItemId
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("The user_id (string) must be provided.");
        });
    });
    describe("When I assign an available Item to a User with a Validation Error [a field (user_id) is wrong-typed]", () => {
        let response;
        let message;
        let warehouseItemId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    total_quantity: 1,
                    available_quantity: 1
                })
            );

            warehouseItemId = jsonCodec.decode(response.data).item_id;

            response = await natsConnection.request(
                "item-store.assign_inventory_item",
                jsonCodec.encode({
                    user_id: 12345,
                    item_id: warehouseItemId
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("user_id must be a string.");
        });
    });
    describe("When I assign an available Item to a User with a Validation Error [a field (item_id) is wrong-typed]", () => {
        let response;
        let message;
        let warehouseItemId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    total_quantity: 1,
                    available_quantity: 1
                })
            );

            warehouseItemId = jsonCodec.decode(response.data).item_id;

            response = await natsConnection.request(
                "item-store.assign_inventory_item",
                jsonCodec.encode({
                    user_id: "user_1",
                    item_id: "thisisatest"
                })
            );

            message = jsonCodec.decode(response.data).error;
        });

        it("Then returns an error", () => {
            expect(message).toEqual("item_id must be a number.");
        });
    });
