import { TCResponse, TCResponseRaw } from "../types";

export class WhosOnlineResponse extends TCResponse {
    public users: TruncatedUser[];

    public constructor(res: TCResponseRaw) {
        super(res);
        this.users = res["users"];
    }
}

export interface TruncatedUser {
    readonly id: string;
}

export enum Feature {
    FORUM = "forum",
}
