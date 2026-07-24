import type { BaseClient } from "./client";

export abstract class Module {
    #client: BaseClient;

    protected get client(): BaseClient {
        return this.#client;
    }

    public constructor(client: BaseClient) {
        this.#client = client;
    }
}
