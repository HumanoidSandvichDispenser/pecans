import { Module } from "../module";
import { TCResponse } from "../types";
import { FolderListResponse, FolderViewResponse, MessageViewResponse } from "./types";

export class MessagesModule extends Module {
    public async folderView(folder = "inbox", page = 1) {
        return await this.client.call<FolderViewResponse>(
            "messages.folderview",
            {
                folder,
                page,
            }
        );
    }

    public async view(
        conversationId: string,
        includeHeader = true,
        markAsRead = true,
        page = 1
    ) {
        return await this.client.call<MessageViewResponse>(
            "messages.view",
            {
                conversationId,
                includeHeader,
                markAsRead,
                page,
            },
        );
    }

    public async reply(
        conversationId: string,
        text: string,
        unanonymize = false
    ) {
        return await this.client.call<TCResponse>(
            "messages.reply",
            {
                conversationId,
                text,
                unanonymize,
            },
        );
    }

    public async folderList() {
        return await this.client.call<FolderListResponse>(
            "messages.folderlist",
            { }
        );
    }
}
