import { Module } from "../module";
import { Feature, NotifySyncResponse, WhosOnlineResponse } from "./types";

export class NotifyModule extends Module {
    /**
     * Fetches unread counts for a feature.
     */
    public async sync(feature: Feature) {
        return this.client._call(
            NotifySyncResponse,
            "notify.sync",
            {
                feature: feature as string,
            }
        );
    }

    public async fetchOnlineUsers(feature: Feature) {
        return this.client._call(
            WhosOnlineResponse,
            "notify.whosonline",
            {
                feature: feature as string,
            }
        );
    }
}
