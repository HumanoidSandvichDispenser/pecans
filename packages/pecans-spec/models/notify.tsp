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
  @rpc("notify.sync")
  sync(feature: Feature): NotifySyncResponse;

  @rpc("notify.whosonline")
  fetchOnlineUsers(feature: Feature): WhosOnlineResponse;
}
