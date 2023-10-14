export interface MethodCall {
    readonly fn: string;
    readonly payload: { [key: string]: any };
}

export interface TCJSONResponse {
    readonly ok: boolean;
    readonly loginId: string;
    readonly responses: TCResponse[];
    readonly profiles?: TCProfile[];
    readonly auth: string;
    readonly ver: string;
}

export interface TCResponse {
    readonly ok: boolean;
    readonly profiles?: TCProfile[];
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

