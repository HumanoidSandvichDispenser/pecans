import { Module } from "./module";
import { TCResponse, TCUser } from "./client";

export interface FolderViewResponse extends TCResponse {
    readonly hasMore: boolean;
    readonly hasPrevious: boolean;
    readonly messages: MessagePreview[];
}

export interface MessagePreview {
    readonly id: string;
    readonly subject: string;
    readonly preview: string;
    readonly time: number;
    readonly users: TCUser[];
}

export class MessagesModule extends Module {
    public async folderView(folder = "inbox", page = 1): Promise<FolderViewResponse> {
        let ret = await this.client.call<FolderViewResponse>(
            "messages.folderview",
            {
                folder,
                page,
            }
        );

        if (!ret) {
            throw 0;
        }

        return ret;
    }
}
