console.log("[ITEM-STORE] Starting item store...");

import { INDEXES, SERVICE_NAME } from "./config";
import { itemStoreHandlers as warehouseHandlers } from "./private/warehouse";
import { init as initNats, registerHandlers, drain } from "./services/nats";
import { initElasticSearch, ensureIndexExists } from "./services/elasticSearch";
import { ensureAdminDoc } from "./services/adminStore";

async function start() {
    async function shutdown(exitCode: number) {
        await drain();
        process.exit(exitCode);
    }

    try {
        await initNats();
        await initElasticSearch();

        ensureIndexExists(INDEXES.ADMIN);
        ensureAdminDoc();
        ensureIndexExists(INDEXES.WAREHOUSE);
        ensureIndexExists(INDEXES.INVENTORY);

        await registerHandlers(SERVICE_NAME, warehouseHandlers);

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
