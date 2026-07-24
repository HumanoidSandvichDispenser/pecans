import { Module } from "../module";
import { TCResponse } from "../generated/types";
import { ForumSearchResponse, ViewPostsResponse } from "./types";

export class ForumModule extends Module {
    public async viewPosts(
        threadId: number,
        fetchType: string,
        postId = 0,
        reverse = false,
        includePost = true,
    ): Promise<ViewPostsResponse> {
        return await this.client._call<ViewPostsResponse>(
            "forum.viewposts",
            {
                getSomeBackscroll: reverse,
                includeThreadMetadata: true,
                includePost,
                threadId,
                postId,
                type: fetchType,
            },
        );
    }

    public async replyThread(text: string, threadId: number): Promise<TCResponse> {
        return await this.client._call<TCResponse>(
            "forum.replythread",
            { text, threadId },
        );
    }

    public async readThread(postId: number, threadId: number): Promise<TCResponse> {
        return await this.client._call<TCResponse>(
            "forum.readthread",
            { postId, threadId },
        );
    }

    public async editPost(postId: number, text: string): Promise<TCResponse> {
        return await this.client._call<TCResponse>(
            "forum.editpost",
            { postId, text },
        );
    }

    public async search(query: string): Promise<ForumSearchResponse> {
        return await this.client._call<ForumSearchResponse>(
            "forum.search",
            { query },
        );
    }
}
