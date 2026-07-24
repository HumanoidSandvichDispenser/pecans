/** @internal */
export class Cache<T> {
    #cache: { [key: string]: CacheItem<T> } = { };

    /** @internal */
    public query(key: string): CacheItem<T> | undefined {
        if (key in this.#cache) {
            return this.#cache[key];
        }
        return undefined;
    }

    public fetch(key: string): T | undefined {
        return this.query(key)?.value;
    }

    public isItemStale(key: string): boolean {
        return this.query(key)?.isStale ?? false;
    }

    public doesItemExist(key: string): boolean {
        return this.query(key) ? true : false;
    }

    public isItemValid(key: string): boolean {
        return this.doesItemExist(key) && !this.isItemStale(key);
    }
}

/** @internal */
class CacheItem<T> {
    public timeToLive: number;
    public origin: number = 0;
    public value: T;

    public constructor(value: T, timeToLive: number = 60000) {
        this.value = value;
        this.timeToLive = timeToLive;
        this.origin = new Date().getTime();
    }

    public get isStale(): boolean {
        return new Date().getTime() > this.origin + this.timeToLive;
    }

    public kill(): void {
        this.origin = 0;
    }
}
