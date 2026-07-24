export interface MethodCall {
    readonly fn: string;
    readonly payload: { [key: string]: any };
}

export interface TCJSONResponse {
    readonly ok: boolean;
    readonly loginId: string;
    readonly responses: TCResponseRaw[];
    readonly profiles?: TCProfile[];
    readonly auth: string;
    readonly ver: string;
}

export interface TCResponseRaw {
    /** @internal */
    [key: string]: any;
}

export class TCResponse {
    public ok: boolean = false;
    public error?: string;
    public profiles?: TCProfile[] = [];

    public constructor(response: TCResponseRaw) {
        this.ok = response.ok;
        this.error = response.error;
        this.profiles = response.profiles;
    }

    public toObject(): {[key: string]: any} {
        return { ...this };
    }
}

export interface TCResponseConstructor {
    new(response: TCJSONResponse): TCResponse;
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
    readonly subs: TCFollowInfo;
}

export interface TCFollowInfo {
    readonly in: number;
    readonly out: number;
}
