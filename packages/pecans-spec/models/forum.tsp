import "../lib/main.tsp";

namespace Pecans;

model ForumCategory {
  id: string;
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

model GetQuoteTextResponse extends TCResponse {
  /** The raw text of the post being quoted. */
  originalText: string;

  /** Username of the post's author. */
  user: string;
}

model NewThreadResponse extends TCResponse {
  /** Id of the newly created thread. */
  threadId: safeint;
}

interface Forum {
  /**
   * Create a new thread in a category.
   *
   * @param category Id of the category to post the thread in.
   * @param title Thread title.
   * @param text Body text of the opening post (UCP markup).
   * @returns The new thread's id.
   */
  @rpc("forum.newthread")
  newThread(category: string, title: string, text: string): NewThreadResponse;

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

  @rpc("forum.categoriesget")
  categoriesGet(): ForumCategoriesResponse;

  @rpc("forum.threadlist")
  threadList(category: string, offset?: safeint = 0): ThreadListResponse;

  /**
   * Fetch a post's text and author, for building a quote reply.
   *
   * @param id Id of the post to quote.
   * @returns The post's original text and author.
   */
  @rpc("forum.getquotetext")
  getQuoteText(id: safeint): GetQuoteTextResponse;

  /**
   * Follow or unfollow a thread to control notifications for new replies.
   *
   * @param threadId Thread to follow or unfollow.
   * @param follow True to follow, false to unfollow.
   */
  @rpc("forum.followthread")
  followThread(threadId: safeint, follow: boolean): TCResponse;
}
