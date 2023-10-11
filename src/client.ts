import { MessagesModule } from "./messages";

export interface MethodCall {
    readonly fn: string;
    readonly payload: { [key: string]: any };
}

export interface TCJSONResponse {
    readonly ok: boolean;
    readonly loginId: string;
    readonly responses: TCResponse[];
    readonly profiles: TCProfile[];
    readonly auth: string;
    readonly ver: string;
}

export interface TCResponse {
    readonly ok: boolean;
    readonly profiles: TCProfile[];
}

// TODO: move this to another file

export interface TCUser {
    readonly id?: string;
    readonly anon?: boolean;
}

export interface TCProfile {
    readonly id: string;
    readonly name: string;
    readonly online: number;
    readonly avatar: string;
}

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
        let methodCall: MethodCall = {
            fn: methodName,
            payload: args,
        };

        let body = {
            auth: this.auth,
            requests: [ methodCall ],
        };

        let res = await this.fetch(body);

        if (res?.ok) {
            let methodRes = res.responses[0];
            return {
                ...methodRes,
                profiles: res.profiles,
            } as T;
        }

        return {
            ok: false,
        } as T;
    }

    private async fetch(body: any): Promise<TCJSONResponse | undefined> {
        let req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": "twocansandstring_com_auth2=" + this.auth,
                "User-Agent": "pewcans",
            },
            body: JSON.stringify(body),
        };

        let res = await fetch(Client.BASE_URI, req);

        if (!res.ok) {
            return;
        }

        let json: TCJSONResponse = await res.json() as TCJSONResponse;

        return json;
    }
}
