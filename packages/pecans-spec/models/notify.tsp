import "../lib/main.tsp";

namespace Pecans;

enum Feature {
  FEED: "feed",
  ASK: "ask",
  FORUM: "forum",
  CHAT: "chat",
}

model TruncatedUser {
  id: string;
}

model NotifySyncResponse extends TCResponse {
  count: int32;
}

model WhosOnlineResponse extends TCResponse {
  users: TruncatedUser[];
}

interface Notify {
  /**
    * Synchronize notifications for a given feature.
    *
    * @param feature The feature for which to synchronize notifications.
    * @returns A NotifySyncResponse object containing the result of the synchronization.
    */
  @rpc("notify.sync")
  sync(feature: Feature): NotifySyncResponse;

  /**
    * Fetch a list of users currently online for a given feature. Currently
    * only supports the `Feature.FORUM` feature.
    *
    * @param feature The feature for which to fetch online users.
    * @returns A WhosOnlineResponse object containing the list of online users.
    */
  @rpc("notify.whosonline")
  fetchOnlineUsers(feature: Feature): WhosOnlineResponse;

  /**
   * Register that you're viewing a page, for presence and read-tracking.
   *
   * @param url Path of the page being viewed, e.g. `/forum/general`.
   */
  @rpc("notify.activity")
  activity(url: string): TCResponse;
}
