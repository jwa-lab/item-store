console.log("[ITEM-STORE] Starting item store...");

import { INDEXES, SERVICE_NAME } from "./config";
import { warehousePrivateHandlers } from "./private/warehouse";
import { inventoryPrivateHandlers } from "./private/inventory";
import { userPrivateHandlers } from "./private/user";
import { itemPublicHandlers } from "./public/warehouse";
import { userPublicHandlers } from "./public/user";
import { inventoryPublicHandlers } from "./public/inventory";
import {
    init as initNats,
    registerPrivateHandlers,
    drain,
    registerPublicHandlers
} from "./services/nats";
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

        registerPrivateHandlers(SERVICE_NAME, warehousePrivateHandlers);
        registerPrivateHandlers(SERVICE_NAME, inventoryPrivateHandlers);
        registerPrivateHandlers(SERVICE_NAME, userPrivateHandlers);

        registerPublicHandlers(SERVICE_NAME, itemPublicHandlers);
        registerPublicHandlers(SERVICE_NAME, userPublicHandlers);
        registerPublicHandlers(SERVICE_NAME, inventoryPublicHandlers);

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
