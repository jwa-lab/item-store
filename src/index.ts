console.log("[ITEM-STORE] Starting item store...");


import { SERVICE_NAME } from "./config";
import { itemStoreHandlers as privateHandlers } from "./private/index";
import { itemStoreHandlers as publicHandlers } from "./public/index";
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

        await registerHandlers(SERVICE_NAME, privateHandlers);
        await registerHandlers(SERVICE_NAME, publicHandlers);

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
