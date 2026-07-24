import { MethodCall, TCJSONResponse, TCProfile, TCResponse, TCResponseRaw } from "./types";
import { AskModule } from "./ask";
import { MessagesModule } from "./messages";
import { ForumModule } from "./forum";
import { DrawingModule } from "./drawing";
import { AnswerModule } from "./answer";
import { NotifyModule } from "./notify";
import { AccountModule } from "./account";
import { AuthModule } from "./auth";

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

interface QueuedCall {
    methodCall: MethodCall;
    creator: (new (r: TCResponseRaw) => unknown) | null;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
}

export class Client {
    static readonly BASE_URI = "https://api.twocansandstring.com/api";
    static readonly VERSION = "1.68";

    #messages: MessagesModule;
    #ask: AskModule;
    #forum: ForumModule;
    #drawing: DrawingModule;
    #answer: AnswerModule;
    #notify: NotifyModule;
    #account: AccountModule;
    #auth: AuthModule;

    #activeBatch: QueuedCall[] | null = null;

    public _cache: { [key: string]: any; } = { };

    public profileCache: { [key: string]: TCProfile } = { };

    public authToken?: string;

    public agent: string = "pecans";

    public shouldTrimErrors: boolean = true;

    public get messages(): MessagesModule { return this.#messages; }
    public get ask(): AskModule { return this.#ask; }
    public get forum(): ForumModule { return this.#forum; }
    public get drawing(): DrawingModule { return this.#drawing; }
    public get answer(): AnswerModule { return this.#answer; }
    public get notify(): NotifyModule { return this.#notify; }
    public get account(): AccountModule { return this.#account; }
    public get auth(): AuthModule { return this.#auth; }

    public get isBatching(): boolean {
        return this.#activeBatch !== null;
    }

    public constructor(auth?: string) {
        this.authToken = auth;

        this.#messages = new MessagesModule(this);
        this.#ask = new AskModule(this);
        this.#forum = new ForumModule(this);
        this.#drawing = new DrawingModule(this);
        this.#answer = new AnswerModule(this);
        this.#notify = new NotifyModule(this);
        this.#account = new AccountModule(this);
        this.#auth = new AuthModule(this);
    }

    /** @internal */
    public _call<T extends TCResponse>(
        creator: new (r: TCResponseRaw) => T,
        methodName: string,
        args: { [key: string]: any },
    ): Promise<T>;
    /** @internal */
    public _call<T>(methodName: string, args: { [key: string]: any }): Promise<T>;
    public _call(a: unknown, b: unknown, c?: unknown): Promise<unknown> {
        let creator: (new (r: TCResponseRaw) => unknown) | null;
        let methodName: string;
        let args: { [key: string]: any };

        if (typeof a === "string") {
            creator = null;
            methodName = a;
            args = b as { [key: string]: any };
        } else {
            creator = a as new (r: TCResponseRaw) => unknown;
            methodName = b as string;
            args = c as { [key: string]: any };
        }

        const methodCall: MethodCall = { fn: methodName, payload: args };

        if (this.#activeBatch !== null) {
            const batch = this.#activeBatch;
            return new Promise((resolve, reject) => {
                batch.push({ methodCall, creator, resolve, reject });
            });
        }

        return this.#send([methodCall]).then((res) => this.#build(res, 0, creator));
    }

    public beginBatch(): void {
        this.#activeBatch ??= [];
    }

    public async endBatch(): Promise<void> {
        const batch = this.#activeBatch;
        this.#activeBatch = null;

        if (batch === null || batch.length === 0) {
            return;
        }

        try {
            const res = await this.#send(batch.map((c) => c.methodCall));
            batch.forEach((c, index) => c.resolve(this.#build(res, index, c.creator)));
        } catch (reason) {
            batch.forEach((c) => c.reject(reason));
        }
    }

    #build(
        res: TCJSONResponse | undefined,
        index: number,
        creator: (new (r: TCResponseRaw) => unknown) | null,
    ): unknown {
        res?.profiles?.forEach((profile) => {
            this.profileCache[profile.id] = profile;
        });

        const merged: TCResponseRaw = {
            ok: res?.ok ?? false,
            ...(res?.responses?.[index] ?? {}),
            profiles: res?.profiles,
        };

        return creator ? new creator(merged) : merged;
    }

    async #send(requests: MethodCall[]): Promise<TCJSONResponse | undefined> {
        const headers: { [key: string]: string } = {
            "Content-Type": "application/json",
            "User-Agent": this.agent,
        };

        if (this.authToken != undefined) {
            headers["Cookie"] = "twocansandstring_com_auth2=" + this.authToken;
        }

        const res = await fetch(Client.BASE_URI, {
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

        return await res.json() as TCJSONResponse;
    }
}
