console.log("[ITEM-STORE] Starting item store...");

import { INDEXES, SERVICE_NAME } from "./config";
import { warehouseHandlers } from "./private/warehouse";
import { inventoryHandlers } from "./private/inventory";
import { userHandlers } from "./private/user";
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
        initElasticSearch();

        await ensureIndexExists(INDEXES.ADMIN);
        await ensureAdminDoc();
        await ensureIndexExists(INDEXES.WAREHOUSE);
        await ensureIndexExists(INDEXES.INVENTORY);
        await ensureIndexExists(INDEXES.USER);

        registerHandlers(SERVICE_NAME, warehouseHandlers);
        registerHandlers(SERVICE_NAME, inventoryHandlers);
        registerHandlers(SERVICE_NAME, userHandlers);

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
