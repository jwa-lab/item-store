const { connect, JSONCodec, headers } = require("nats");
const { doc } = require("prettier");

const STUDIO_ID = "test_id";

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
            const natsHeaders = headers();

            natsHeaders.set("studio_id", STUDIO_ID);
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    metadata: {},
                    total_quantity: 1,
                    available_quantity: 1
                }),
                { headers: natsHeaders }
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
        });

        it("Then returns the new inventory item id", () => {
            expect(typeof inventoryItemId).toBe("string");
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
                    metadata: {
                        studio_id: STUDIO_ID
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
                    data: {},
                    metadata: {
                        studio_id: STUDIO_ID
                    }
                });
            });

            describe("And when I update the item", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.update_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: inventoryItemId,
                            data: {
                                CLUB: "Racing Club Strasbourg"
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
                                CLUB: "Racing Club Strasbourg"
                            },
                            metadata: {
                                studio_id: STUDIO_ID
                            }
                        });
                    });
                });
            });

            describe("And when I transfer the item", () => {
                beforeAll(async () => {
                    response = await natsConnection.request(
                        "item-store.transfer_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: inventoryItemId,
                            new_user_id: "user_2"
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
                            user_id: "user_2",
                            instance_number: 1,
                            data: {
                                CLUB: "Racing Club Strasbourg"
                            },
                            metadata: {
                                studio_id: STUDIO_ID
                            }
                        });
                    });
                });
            });
        });
    });

    describe("When I list the items of a user", () => {
        let response;
        let documentId;
        let warehouseItemId;
        let inventoryItemId;

        beforeAll(async () => {
            const natsHeaders = headers();

            natsHeaders.set("studio_id", STUDIO_ID);
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    no_update_after: undefined,
                    name: "Christiano Ronaldo",
                    data: {
                        XP: "94"
                    },
                    metadata: {},
                    total_quantity: 1,
                    available_quantity: 1
                }),
                { headers: natsHeaders }
            );

            warehouseItemId = jsonCodec.decode(response.data).item_id;

            response = await natsConnection.request(
                "item-store.add_user",
                jsonCodec.encode({
                    user_id: 146
                })
            );

            documentId = jsonCodec.decode(response.data).user_id;

            response = await natsConnection.request(
                "item-store.assign_inventory_item",
                jsonCodec.encode({
                    user_id: documentId,
                    item_id: warehouseItemId
                })
            );

            inventoryItemId = jsonCodec.decode(response.data).inventory_item_id;

            response = await natsConnection.request(
                "item-store.get_inventory_items",
                jsonCodec.encode({
                    user_id: documentId,
                    start: 0,
                    limit: 1
                })
            );
        });

        it("Then returns the item assigned to user_1 with the inventory_item_id", () => {
            expect(jsonCodec.decode(response.data)).toEqual({
                total: {
                    value: 1,
                    relation: "eq"
                },
                results: [
                    {
                        item_id: warehouseItemId,
                        user_id: documentId,
                        instance_number: 1,
                        data: {},
                        metadata: {
                            studio_id: STUDIO_ID
                        },
                        inventory_item_id: inventoryItemId
                    }
                ]
            });
        });
    });
});
