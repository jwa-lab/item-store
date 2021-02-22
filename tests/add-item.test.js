const { connect, JSONCodec } = require("nats");

const jsonCodec = JSONCodec();

async function test() {
    const natsConnection = await connect();

    try {
        let reponse = await natsConnection.request(
            "item-store_add_item",
            jsonCodec.encode({
                no_update_after: undefined,
                item_id: 11,
                data: {
                    XP: "100"
                },
                quantity: 1000
            })
        );

        console.log("add item", jsonCodec.decode(reponse.data));

        reponse = await natsConnection.request(
            "item-store_get_item",
            jsonCodec.encode({
                item_id: 11
            })
        );

        console.log("get item", jsonCodec.decode(reponse.data));

        reponse = await natsConnection.request(
            "item-store_update_item",
            jsonCodec.encode({
                no_update_after: undefined,
                item_id: 11,
                data: {
                    XP: "80"
                }
            })
        );

        console.log("update item", jsonCodec.decode(reponse.data));

        reponse = await natsConnection.request(
            "item-store_get_item",
            jsonCodec.encode({
                item_id: 11
            })
        );

        console.log("get item", jsonCodec.decode(reponse.data));
    } catch (err) {
        console.error(err);
    }
}

test();
