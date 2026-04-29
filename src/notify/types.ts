import { TCResponse, TCResponseRaw } from "../types";

/**
 * Response for notify.sync.
 */
export class NotifySyncResponse extends TCResponse {
    public count: number;

    public constructor(res: TCResponseRaw) {
        super(res);
        this.count = res["count"] ?? 0;
    }
}

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
    FEED = "feed",
    ASK = "ask",
    FORUM = "forum",
    CHAT = "chat",
}
