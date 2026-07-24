import type { TCProfile } from "../generated/types";

export interface MethodCall {
    readonly fn: string;
    readonly payload: { [key: string]: any };
}

export interface TCJSONResponse {
    readonly ok: boolean;
    readonly responses: TCResponseRaw[];
    readonly profiles?: TCProfile[];
    readonly loginId?: string;
    readonly auth?: string;
    readonly ver?: string;
}

export interface TCResponseRaw {
    [key: string]: any;
}
