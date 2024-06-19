import { MethodCall, TCJSONResponse, TCProfile, TCResponse, TCResponseRaw } from "./types";
import { AskModule } from "./ask";
import { MessagesModule } from "./messages";
import { ForumModule } from "./forum";
import { DrawingModule } from "./drawing";
import { AnswerModule } from "./answer";
import { NotifyModule } from "./notify";
import { AccountModule } from "./account";

interface QueuedCall {
    methodCall: MethodCall;
    creator: new(r: TCResponseRaw) => TCResponse;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

/**
 * Client for Two Cans & String API.
 */
export class Client {
    static readonly BASE_URI = "https://twocansandstring.com/api";
    static readonly VERSION = "1.68";

    #messages: MessagesModule;
    #ask: AskModule;
    #forum: ForumModule;
    #drawing: DrawingModule;
    #answer: AnswerModule;
    #notify: NotifyModule;
    #account: AccountModule;

    #requestQueue: QueuedCall[] = [];
    #isBatching: boolean = false;

    /** @internal */
    public _cache: { [key: string]: any; } = { };

    public profileCache: { [key: string]: TCProfile } = { };

    public authToken?: string;

    public agent: string = "pecans";

    public get messages(): MessagesModule {
        return this.#messages;
    }

    public get ask(): AskModule {
        return this.#ask;
    }

    public get forum(): ForumModule {
        return this.#forum;
    }

    public get drawing(): DrawingModule {
        return this.#drawing;
    }

    public get answer(): AnswerModule {
        return this.#answer;
    }

    public get notify(): NotifyModule {
        return this.#notify;
    }

    public get account(): AccountModule {
        return this.#account;
    }

    public get isBatching(): boolean {
        return this.#isBatching;
    }

    public set isBatching(value: boolean) {
        if (value) {
            this.beginBatch();
        } else {
            this.endBatch();
        }
    }

    public constructor(auth?: string) {
        this.authToken = auth;

        // init modules
        this.#messages = new MessagesModule(this);
        this.#ask = new AskModule(this);
        this.#forum = new ForumModule(this);
        this.#drawing = new DrawingModule(this);
        this.#answer = new AnswerModule(this);
        this.#notify = new NotifyModule(this);
        this.#account = new AccountModule(this);
    }

    /**
     * Calls an API method.
     * @param creator The type that should be constructed from the response.
     * @param methodName The name of the API method to call.
     * @param args The arguments to pass to the API method.
     * @internal
     */
    public _call<T extends TCResponse>(
        creator: new(r: TCResponseRaw) => T,
        methodName: string,
        args: { [key: string]: any }
    ): Promise<T>
    {
        const methodCall: MethodCall = {
            fn: methodName,
            payload: args,
        };

        if (this.#isBatching) {
            return new Promise((resolve, reject) => {
                this.#requestQueue.push({
                    methodCall,
                    creator,
                    resolve,
                    reject,
                });
            });
        }

        const body = {
            auth: this.authToken,
            requests: [methodCall],
        };

        return new Promise((resolve, reject) => {
            this.fetch(body)
                .then((res) => {
                    const rawResponse: TCResponseRaw = {
                        ok: res?.ok ?? false,
                        ...res?.responses[0],
                        profiles: res?.profiles,
                    };

                    res?.profiles?.forEach((profile) => {
                        this.profileCache[profile.id] = profile;
                    });

                    resolve(new creator(rawResponse));
                })
                .catch((reason) => reject(reason));
        });
        /*
        const res = await this.fetch(body);

        const rawResponse: TCResponseRaw = {
            ok: res?.ok ?? false,
            ...res?.responses[0],
        } as T;

        return new creator(rawResponse);
            */
    }

    public beginBatch(): void {
        this.#isBatching = true;
    }

    public endBatch(process = true): void {
        this.#isBatching = false;
        if (process) {
            this.processBatch();
        }
    }

    public processBatch(): void {
        const methodCalls = this.#requestQueue.map((c) => c.methodCall);

        const body = {
            auth: this.authToken,
            requests: methodCalls,
        };

        this.fetch(body)
            .then((res) => {
                this.#requestQueue.forEach((c, index) => {
                    const individualResponse: TCResponseRaw = {
                        ok: res?.ok ?? false,
                        ...res?.responses[index],
                        profiles: res?.profiles,
                    };

                    res?.profiles?.forEach((profile) => {
                        this.profileCache[profile.id] = profile;
                    });

                    c.resolve(new c.creator(individualResponse));
                });
            })
            .catch((reason) => {
                this.#requestQueue.forEach((c) => c.reject(reason));
            })
            .finally(() => {
                this.#requestQueue.length = 0;
            });
    }

    private async fetch(body: any): Promise<TCJSONResponse | undefined> {
        const headers: { [key: string]: string } = {
            "Content-Type": "application/json",
            "User-Agent": this.agent,
        };

        if (this.authToken != undefined) {
            headers["Cookie"] = "twocansandstring_com_auth2=" + this.authToken;
        }

        const req = {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        };

        const res = await fetch(Client.BASE_URI, req);

        if (!res.ok) {
            return Promise.reject();
        }

        return await res.json() as TCJSONResponse;
    }
}
