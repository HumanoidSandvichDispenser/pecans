namespace Pecans;

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
