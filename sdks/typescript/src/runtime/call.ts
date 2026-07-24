import type { BaseClient } from "./client";
import type { MethodCall } from "./types";

/**
 * A lazy, awaitable API call. Awaiting it sends the call on its own; passing it
 * to {@link BaseClient.batch} bundles it into one request with typed results.
 */
export class Call<T> implements PromiseLike<T> {
    public constructor(
        private readonly client: BaseClient,
        public readonly methodCall: MethodCall,
        public readonly decode?: (raw: any) => T,
    ) {}

    /** Turn a built response envelope into the typed value for this call. */
    public build(raw: any): T {
        return this.decode ? this.decode(raw) : (raw as T);
    }

    public then<R1 = T, R2 = never>(
        onfulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
        onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
    ): Promise<R1 | R2> {
        return this.client
            .sendOne(this.methodCall)
            .then((raw) => this.build(raw))
            .then(onfulfilled, onrejected);
    }
}

export type CallResults<C extends readonly Call<any>[]> = {
    [K in keyof C]: C[K] extends Call<infer U> ? U : never;
};
