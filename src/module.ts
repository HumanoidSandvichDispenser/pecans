import type { Client } from "./client";

export class Module {
    #client: Client;

    protected get client(): Client {
        return this.#client;
    }

    public constructor(client: Client) {
        this.#client = client;
    }
}
