import { Module } from "../module";
import { Feature, WhosOnlineResponse } from "./types";

export class NotifyModule extends Module {
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
