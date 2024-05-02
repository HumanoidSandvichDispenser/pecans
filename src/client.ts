import { AskModule } from "./ask";
import { MessagesModule } from "./messages";
import { ForumModule } from "./forum";
import { MethodCall, TCJSONResponse, TCResponse, TCResponseRaw } from "./types";

/**
 * Client for Two Cans & String API.
 */
export class Client {
    static readonly BASE_URI = "https://twocansandstring.com/api";
    static readonly VERSION = "1.68";

    #messages: MessagesModule;
    #ask: AskModule;
    #forum: ForumModule;

    /** @internal */
    public _cache: { [key: string]: any; } = { };

    public auth?: string;

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

    public constructor(auth?: string) {
        this.auth = auth;

        // init modules
        this.#messages = new MessagesModule(this);
        this.#ask = new AskModule(this);
        this.#forum = new ForumModule(this);
    }

    //public login(username: string, password: string) {
    //    this.call();
    //}

    /**
     * Calls an API method.
     * @param creator The type that should be constructed from the response.
     * @param methodName The name of the API method to call.
     * @param args The arguments to pass to the API method.
     * @internal
     */
    public async _call<T extends TCResponse>(
        creator: new(r: TCResponseRaw) => T,
        methodName: string,
        args: { [key: string]: any }
    ): Promise<T>
    {
        const methodCall: MethodCall = {
            fn: methodName,
            payload: args,
        };

        const body = {
            auth: this.auth,
            requests: [methodCall],
        };

        const res = await this.fetch(body);

        const rawResponse: TCResponseRaw = {
            ok: res?.ok ?? false,
            ...res?.responses[0],
        } as T;
        
        return new creator(rawResponse);
    }

    private async fetch(body: any): Promise<TCJSONResponse | undefined> {
        const req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": "twocansandstring_com_auth2=" + this.auth,
                "User-Agent": this.agent,
            },
            body: JSON.stringify(body),
        };

        const res = await fetch(Client.BASE_URI, req);

        if (!res.ok) {
            return;
        }

        return await res.json() as TCJSONResponse;
    }
}
