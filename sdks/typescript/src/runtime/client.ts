import { Call, CallResults } from "./call";
import type { MethodCall, TCJSONResponse } from "./types";
import type { TCProfile } from "../generated/types";

export class ResponseParseError {
    public readonly name: string = "ResponseParseError";
    public readonly message: string = "Failed to parse API response as JSON";
    public readonly responseText: string;
    public readonly cause?: unknown;

    public constructor(responseText: string, cause?: unknown) {
        this.responseText = responseText;
        if (cause !== undefined) {
            this.cause = cause;
        }
    }
}

export abstract class BaseClient {
    static readonly BASE_URI = "https://api.twocansandstring.com/api";
    static readonly VERSION = "1.68";

    public profileCache: { [key: string]: TCProfile } = {};

    public authToken?: string;

    public agent: string = "pecans";

    public shouldTrimErrors: boolean = true;

    public constructor(auth?: string) {
        this.authToken = auth;
    }

    /**
     * @internal Send a single call on its own.
     */
    public async _sendOne<T>(call: MethodCall): Promise<T> {
        const res = await this.#send([call]);
        return this.#build<T>(res, 0);
    }

    /**
     * Send several calls as one batched request, preserving per-call types.
     */
    public async batch<C extends readonly Call<any>[]>(...calls: C): Promise<CallResults<C>> {
        if (calls.length === 0) {
            return [] as unknown as CallResults<C>;
        }
        const res = await this.#send(calls.map((call) => call.methodCall));
        return calls.map((_, index) => this.#build(res, index)) as CallResults<C>;
    }

    #build<T>(res: TCJSONResponse | undefined, index: number): T {
        res?.profiles?.forEach((profile) => {
            this.profileCache[profile.id] = profile;
        });

        return {
            ok: res?.ok ?? false,
            ...(res?.responses?.[index] ?? {}),
            profiles: res?.profiles,
        } as T;
    }

    async #send(requests: MethodCall[]): Promise<TCJSONResponse | undefined> {
        const headers: { [key: string]: string } = {
            "Content-Type": "application/json",
            "User-Agent": this.agent,
        };

        if (this.authToken != undefined) {
            headers["Cookie"] = "twocansandstring_com_auth2=" + this.authToken;
        }

        const res = await fetch(BaseClient.BASE_URI, {
            method: "POST",
            headers,
            body: JSON.stringify({ auth: this.authToken, requests }),
        });

        if (!res.ok) {
            return Promise.reject();
        }

        if (this.shouldTrimErrors) {
            let text = await res.text();
            text = text.replace(/^(?:.*\n)*{/, "{");
            try {
                return JSON.parse(text) as TCJSONResponse;
            } catch (cause) {
                throw new ResponseParseError(text, cause);
            }
        }

        return (await res.json()) as TCJSONResponse;
    }
}
