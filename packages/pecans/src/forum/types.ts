import { TCResponse, TCResponseRaw } from "../types";

export class ViewPostsResponse extends TCResponse {
    posts: Post[];
    numPostsBefore: number;
    numPostsAfter: number;
    jumpTo: number;
    thread: Thread;

    public constructor(response: TCResponseRaw) {
        super(response);
        this.posts = response["posts"] ?? [];
        this.numPostsBefore = response["numPostsBefore"] ?? 0;
        this.numPostsAfter = response["numPostsAfter"] ?? 0;
        this.jumpTo = response["jumpTo"] ?? 0;
        this.thread = response["thread"] ?? {};
    }
}

export class ForumSearchResponse extends TCResponse {
    results: SearchResult[];

    public constructor(response: TCResponseRaw) {
        super(response);

        this.results = response["results"];
    }
}

export interface Post {
    readonly id: number;
    readonly user: string;
    readonly text: string;
    readonly time: number;
}

export interface Thread {
    readonly id: number;
    readonly lastPostId: number;
    readonly title: string;
    readonly locked: boolean;
    // TODO: add category
    //readonly category
}

export interface SearchResult {
    readonly id: number;
    readonly author: string;
    readonly text: string;
    readonly time: number;
    readonly category: string;
    readonly thread: number;
}
