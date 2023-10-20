import { TCResponse, TCResponseRaw, TCUser } from "../types";

export class FolderViewResponse extends TCResponse {
    hasMore: boolean;
    hasPrevious: boolean;
    messages: MessagePreview[];

    public constructor(response: TCResponseRaw) {
        super(response);
        this.hasMore = response["hasMore"] ?? false;
        this.hasPrevious = response["hasPrevious"] ?? false;
        this.messages = response["messages"] ?? [];
    }
}

export class MessageViewResponse extends TCResponse {
    messages: Message[];
    header: MessageThreadHeader;

    public constructor(response: TCResponseRaw) {
        super(response);
        this.messages = response["messages"] ?? [];
        this.header = response["header"];
    }
}

export interface MessagePreview {
    readonly id: string;
    readonly subject: string;
    readonly preview: string;
    readonly time: number;
    readonly users: TCUser[];
    readonly new?: boolean;
}

export interface Message {
    readonly id: number;
    readonly member: number;
    readonly time: number;
    readonly type: string;
    readonly html: string;
    readonly new?: boolean;
}

export interface MessageThreadHeader {
    readonly title: string;
    readonly members: MessageThreadMember[];
    readonly folder: MessageFolder;
}

export interface MessageThreadMember {
    readonly mid: number;
    readonly anon?: boolean;
    readonly readTo: number;
}

export interface MessageFolder {
    readonly id: string;
    readonly name: string;
}

export class FolderListResponse extends TCResponse {
    folders: Folder[];

    public constructor(response: TCResponseRaw) {
        super(response);
        this.folders = response["folders"];
    }
}

export interface Folder {
    readonly id: string;
    readonly name: string;
}

//interface MessagePreviewRaw {
//    readonly id: string;
//    readonly subject: string;
//    readonly preview: string;
//    readonly time: number;
//    readonly users: TCUser[];
//    readonly new: boolean;
//}
//
//class MessagePreview {
//    id: string;
//    subject: string;
//    preview: string;
//    time: number;
//    users: TCUser[];
//    isNew: boolean;
//    context: Client;
//
//    /** @internal */
//    public constructor(context: Client, msg: MessagePreviewRaw) {
//        this.context = context;
//        this.id = msg.id;
//        this.subject = msg.subject;
//        this.preview = msg.preview;
//        this.time = msg.time;
//        this.users = msg.users;
//        this.isNew = msg.new;
//    }
//
//    public open() {
//        return this.context.messages.view(this.id);
//    }
//}
//
//interface MessageRaw {
//    readonly id: number;
//    readonly member: number;
//    readonly time: number;
//    readonly messageType: string;
//    readonly html: string;
//    readonly new: boolean;
//}
//
//class Message {
//    id: number;
//    member: number;
//    time: number;
//    messageType: string;
//    html: string;
//    isNew: boolean;
//
//    /** @internal */
//    public constructor(msg: MessageRaw) {
//        this.id = msg.id;
//        this.member = msg.member;
//        this.time = msg.time;
//        this.messageType = msg.messageType;
//        this.html = msg.html;
//        this.isNew = msg.new;
//    }
//}

//export class Message {
//    id: number;
//    member: number;
//    time: number;
//    messageType: string;
//    html: string;
//    isNew: boolean;
//
//    /** @internal */
//    public constructor(msg: TCMessage) {
//        this.id = msg.id;
//        this.member = msg.member;
//        this.time = msg.time;
//        this.messageType = msg.messageType;
//        this.html = msg.html;
//        this.isNew = msg.isNew;
//    }
//}
//interface MessagePreview {
//    readonly id: string;
//    readonly subject: string;
//    readonly preview: string;
//    readonly time: number;
//    readonly users: TCUser[];
//    readonly new: boolean;
//}
//
////export class MessagePreview {
////    id: string;
////    subject: string;
////    preview: string;
////    time: number;
////    users: TCUser[];
////    isNew: boolean;
////
////    /** @internal */
////    public constructor(msg: TCMessagePreview) {
////        this.id = msg.id;
////        this.subject = msg.subject;
////        this.preview = msg.preview;
////        this.time = msg.time;
////        this.users = msg.users;
////        this.isNew = msg.new;
////    }
////}
//
//interface TCMessage {
//    readonly id: number;
//    readonly member: number;
//    readonly time: number;
//    readonly messageType: string;
//    readonly html: string;
//    readonly isNew: boolean;
//}
//
//export class Message {
//    id: number;
//    member: number;
//    time: number;
//    messageType: string;
//    html: string;
//    isNew: boolean;
//
//    /** @internal */
//    public constructor(msg: TCMessage) {
//        this.id = msg.id;
//        this.member = msg.member;
//        this.time = msg.time;
//        this.messageType = msg.messageType;
//        this.html = msg.html;
//        this.isNew = msg.isNew;
//    }
//}
//
//export interface MessageThreadHeader {
//    readonly title: string;
//    readonly members: MessageThreadMember[];
//    readonly folder: MessageFolder;
//}
//
//export interface MessageThreadMember {
//    readonly mid: number;
//    readonly anon?: boolean;
//    readonly readTo: number;
//}
//
//export interface MessageFolder {
//    readonly id: string;
//    readonly name: string;
//}
