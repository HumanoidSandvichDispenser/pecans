import { Module } from "../module";
import { TCResponse } from "../types";
import { ViewPostsResponse } from "./types";

export class ForumModule extends Module {
    public async viewPosts(
        threadId: number,
        fetchType: string,
        postId = 0,
        reverse = false,
        includePost = true,
    ) {
        return await this.client._call(
            ViewPostsResponse,
            "forum.viewposts",
            {
                getSomeBackscroll: reverse,
                includePost,
                threadId,
                postId,
                type: fetchType,
            }
        );
    }

    public async replyThread(text: string, threadId: number) {
        return await this.client._call(
            TCResponse,
            "forum.replythread",
            {
                text,
                threadId,
            }
        )
    }
}
