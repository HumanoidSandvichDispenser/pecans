import "../lib/main.tsp";

namespace Pecans;

model FeedItemBase {
  id: safeint;

  /** Unix time the activity happened. */
  time: safeint;

  /** Username of the account the item belongs to. */
  owner: string;

  /** Relative path to the item on the site, e.g. `/forum/blogs/11894`. */
  url: string;

  /** Display title for the item (may be empty for questions). */
  title: string;
}

/** A newly-created forum thread. */
model ForumThreadFeedItem extends FeedItemBase {
  type: "forum.thread";
  data: {
    /** First line(s) of the thread's opening post. */
    preview: string;
  };
}

/** A newly-asked Q&A question. */
model QaNewQuestionFeedItem extends FeedItemBase {
  type: "qa.newquestion";
  data: {
    /** First line(s) of the question body. */
    preview: string;
  };
}

/** An account being registered. */
model AccountRegisterFeedItem extends FeedItemBase {
  type: "account.register";
  data: unknown[];
}

@discriminated(#{ envelope: "none", discriminatorPropertyName: "type" })
union FeedItem {
  "forum.thread": ForumThreadFeedItem,
  "qa.newquestion": QaNewQuestionFeedItem,
  "account.register": AccountRegisterFeedItem,
}

model FeedResponse extends TCResponse {
  /** Server-side cursor for pagination. */
  feedId: string;

  /** The first page of feed items, newest first. */
  items: FeedItem[];
}

model FeedScrollResponse extends TCResponse {
  /** The next page of items; absent once the feed is exhausted. */
  items?: FeedItem[];

  /** True when there are no more items to load. */
  end?: boolean;
}

interface Feed {
  /**
   * Open a feed and return its first page.
   *
   * @param user Username to fetch the activity feed for, or `null` for the global site feed.
   * @param size Number of items to return on this first page.
   * @returns A cursor (`feedId`) and the first page of items.
   */
  @rpc("feed.start")
  start(user: string | null, size?: safeint = 10): FeedResponse;

  /**
   * Fetch the next page of a feed opened with `start`.
   *
   * @param feedId Cursor returned by `start`.
   * @param numItems Number of further items to fetch.
   * @param lastId Id of the last item you've already seen.
   * @returns The next page of items, or `end: true` once exhausted.
   */
  @rpc("feed.scroll")
  scroll(feedId: string, numItems: safeint, lastId: safeint): FeedScrollResponse;
}
