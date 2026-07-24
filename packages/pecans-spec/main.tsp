import "@typespec/json-schema";

using TypeSpec.JsonSchema;

@jsonSchema
namespace Pecans;

model TCResponse {
  ok: boolean;
  error?: string;
}

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

model FeedItemBase {
  id: safeint;
  time: safeint;
  owner: string;
  url: string;
  title: string;
}

model ForumThreadFeedItem extends FeedItemBase {
  type: "forum.thread";
  data: {
    preview: string;
  };
}

model AccountRegisterFeedItem extends FeedItemBase {
  type: "account.register";
  data: unknown[];
}

@discriminated(#{ envelope: "none", discriminatorPropertyName: "type" })
union FeedItem {
  "forum.thread": ForumThreadFeedItem,
  "account.register": AccountRegisterFeedItem,
}

model FeedResponse extends TCResponse {
  feedId: string;
  items: FeedItem[];
}
