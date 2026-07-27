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
  post: ThreadListPost;
  threadTitle: string;
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

  /**
   * View posts in a thread.
   *
   * @param threadId Id of the thread to view.
   * @param fetchType "new" to fetch new posts, "backscroll" to fetch older posts.
   * @param postId Id of the post to start fetching from. Defaults to 0 (the first post).
   * @param reverse If true, fetch posts in reverse order (newest first). Defaults to false.
   * @param includePost If true, include the post with id `postId` in the results. Defaults to true.
   * @returns A ViewPostsResponse object containing the requested posts and thread metadata.
   */
  @rpc("forum.viewposts")
  @constant(#{ includeThreadMetadata: true })
  viewPosts(
    threadId: safeint,
    @encodedName("application/json", "type") fetchType: string,
    postId?: safeint = 0,
    @encodedName("application/json", "getSomeBackscroll") reverse?: boolean = false,
    includePost?: boolean = true,
  ): ViewPostsResponse;

  /**
   * Reply to a thread with a new post.
   *
   * @param text Body text of the reply (UCP markup).
   * @param threadId Id of the thread to reply to.
   * @returns A TCResponse object indicating the result of the reply attempt.
   */
  @rpc("forum.replythread")
  replyThread(text: string, threadId: safeint): TCResponse;

  /**
   * Mark a thread as read, clearing the new-post indicator for that thread.
   *
   * @param postId Id of the last post read in the thread.
   * @param threadId Id of the thread to mark as read.
   * @returns A TCResponse object indicating the result of the operation.
   */
  @rpc("forum.readthread")
  readThread(postId: safeint, threadId: safeint): TCResponse;

  /**
    * Edit a post's text.
    *
    * @param postId Id of the post to edit.
    * @param text New body text for the post (UCP markup).
    * @returns A TCResponse object indicating the result of the edit attempt.
    */
  @rpc("forum.editpost")
  editPost(postId: safeint, text: string): TCResponse;

  /**
    * Search the forum for posts matching a query.
    *
    * @param query Search query string.
    * @returns A ForumSearchResponse object containing the search results.
    */
  @rpc("forum.search")
  search(query: string): ForumSearchResponse;

  /**
    * Get the list of forum categories.
    *
    * @returns A ForumCategoriesResponse object containing the list of categories.
    */
  @rpc("forum.categoriesget")
  categoriesGet(): ForumCategoriesResponse;

  /**
    * Get the list of threads in a category.
    *
    * @param category Id of the category to fetch threads from.
    * @param offset Number of threads to skip (for pagination). Defaults to 0.
    * @returns A ThreadListResponse object containing the list of threads in the category.
    */
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

  /**
   * Flag a post for mod attention.
   *
   * @param postId Id of the post being flagged.
   * @param comment Reason the post is being flagged.
   */
  @rpc("forum.flagpost")
  flagPost(postId: safeint, comment: string): TCResponse;

  /**
   * Mark every thread as read, clearing all new-post indicators. This is
   * irreversible and sets `ForumCategory.newThreads` to 0 for every category.
   */
  @rpc("forum.readall")
  readAll(): TCResponse;
}
