import { TCResponse, TCResponseRaw } from "../types";

export class WhosOnlineResponse extends TCResponse {
    users: { id: string };

    public constructor(res: TCResponseRaw) {
        super(res);
        this.users = res["users"];
    }
}

export enum Feature {
    FORUM = "forum",
}
