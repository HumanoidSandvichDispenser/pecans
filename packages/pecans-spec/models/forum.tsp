import "../lib/main.tsp";

namespace Pecans;

model ForumCategory {
  id: int32;
  name: string;
  description: string;
  threads: int32;
  posts: int32;
  newThreads: int32;
}

model ForumCategoriesResponse {
  categories: ForumCategory[];
}

model ThreadListPost {
  id: safeint;
  author: string;
  text: string;
  time: safeint;
  category: string;
  thread: safeint;
}

model ForumThread {
  id: safeint;
  views: int32;
  replies: int32;
  title: string;
  category: string;
  `new`: boolean;
  firstPost: ThreadListPost;
  lastPost: ThreadListPost;
}

model ThreadListResponse extends TCResponse {
  name: string;
  totalThreads: int32;
  category: string;
  canCreate: boolean;
  threads: ForumThread[];
}

model ForumPost {
  id: safeint;
  user: string;
  text: string;
  ucpText: string;
  ucpEnabled: boolean;
  time: safeint;
  `new`: boolean;
}

model ViewThread {
  id: safeint;
  lastPostId: safeint;
  title: string;
  locked: boolean;
}

model ViewPostsResponse extends TCResponse {
  posts: ForumPost[];
  numPostsBefore: int32;
  numPostsAfter: int32;
  jumpTo: safeint;
  thread: ViewThread;
}

model ForumSearchResult {
  id: safeint;
  author: string;
  text: string;
  time: safeint;
  category: string;
  thread: safeint;
}

model ForumSearchResponse extends TCResponse {
  results: ForumSearchResult[];
}

interface Forum {
  @rpc("forum.viewposts")
  @constant(#{ includeThreadMetadata: true })
  viewPosts(
    threadId: safeint,
    @encodedName("application/json", "type") fetchType: string,
    postId?: safeint = 0,
    @encodedName("application/json", "getSomeBackscroll") reverse?: boolean = false,
    includePost?: boolean = true,
  ): ViewPostsResponse;

  @rpc("forum.replythread")
  replyThread(text: string, threadId: safeint): TCResponse;

  @rpc("forum.readthread")
  readThread(postId: safeint, threadId: safeint): TCResponse;

  @rpc("forum.editpost")
  editPost(postId: safeint, text: string): TCResponse;

  @rpc("forum.search")
  search(query: string): ForumSearchResponse;
}
