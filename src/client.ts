import { MessagesModule } from "./messages";
import { MethodCall, TCJSONResponse, TCResponse } from "./types";

/**
 * Client for Two Cans & String API.
 */
export class Client {
    static readonly BASE_URI = "https://twocansandstring.com/api";
    static readonly VERSION = "1.68"

    #messages: MessagesModule;

    public get messages(): MessagesModule {
        return this.#messages;
    }

    public auth: string;

    public constructor(auth: string) {
        this.auth = auth;

        // init modules
        this.#messages = new MessagesModule(this);
    }

    /**
     * Calls an API method.
     * @param methodName The name of the API method to call.
     * @param args The arguments to pass to the API method.
     */
    public async call<T extends TCResponse>(
        methodName: string, args: { [key: string]: any }
    ): Promise<T>
    {
        const methodCall: MethodCall = {
            fn: methodName,
            payload: args,
        };

        const body = {
            auth: this.auth,
            requests: [ methodCall ],
        };

        const res = await this.fetch(body);

        return {
            ok: res?.ok ?? false,
            ...res?.responses[0],
        } as T;
    }

    private async fetch(body: any): Promise<TCJSONResponse | undefined> {
        const req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": "twocansandstring_com_auth2=" + this.auth,
                "User-Agent": "pecans",
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
