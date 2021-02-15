console.log("[ITEM-STORE] Starting item store...");

import { itemStoreHandlers } from "./handlers/itemStore";
import { init as initNats, registerHandlers, drain } from "./nats";
import { initElasticSearch } from "./elasticSearch";

async function start() {
    async function shutdown(exitCode: number) {
        await drain();
        process.exit(exitCode);
    }

    try {
        await initNats();
        await initElasticSearch();

        await registerHandlers(itemStoreHandlers);

        process.on("SIGINT", () => {
            console.log("[ITEM-STORE] Gracefully shutting down...");
            shutdown(0);
        });
        process.on("SIGTERM", () => {
            console.log("[ITEM-STORE] Gracefully shutting down...");
            shutdown(0);
        });
    } catch (err) {
        console.error(`[ITEM-STORE] Item Store exited with error: ${err}`);
        console.error(err);
        shutdown(1);
    }
}

start();
