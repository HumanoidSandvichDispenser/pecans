import "../lib/main.tsp";

namespace Pecans;

model ProfileGetResponse extends TCResponse {
  /** The looked-up user's id. `ok` is false with error `NOT_FOUND` if no such user. */
  id: string;
}

model ProfileDetailsResponse extends TCResponse {
  /** Echoes back the requested field name. */
  type: string;

  /** The field's value; a string for text fields, a number for counts like `followers`. */
  value: unknown;
}

/** One entry in a follower/following list. */
model FollowEntry {
  /** The other user's id. */
  id: string;

  /** True if the follow relationship is reciprocated. */
  mutual: boolean;
}

/** An entry in your followers list; adds block state. */
model FollowerEntry extends FollowEntry {
  /** True if you have blocked this follower. */
  blocked: boolean;
}

model ListFollowersResponse extends TCResponse {
  followers: FollowerEntry[];
}

model ListFollowsResponse extends TCResponse {
  follows: FollowEntry[];
}

interface Profile {
  /**
   * Check whether a profile exists and resolve its canonical id.
   *
   * @param id Username to look up.
   * @returns The user's id, or `ok: false` with error `NOT_FOUND`.
   */
  @rpc("profile.get")
  get(id: string): ProfileGetResponse;

  /**
   * Fetch one field of a user's profile.
   *
   * @param user Username whose profile to read.
   * @param field Field name, e.g. `blurb`, `title`, `followers`, `joinTime`, `contact.discord`.
   * @returns The field name and its value.
   */
  @rpc("profile.details")
  details(user: string, field: string): ProfileDetailsResponse;

  /**
   * Set one field on your own profile.
   *
   * @param field Field name, e.g. `blurb`, `contact.web`.
   * @param value New value for the field.
   */
  @rpc("profile.edit")
  edit(field: string, value: string): TCResponse;

  /**
   * Follow or unfollow another user.
   *
   * @param id Username to follow or unfollow.
   * @param follow True to follow, false to unfollow.
   */
  @rpc("profile.togglefollow")
  toggleFollow(id: string, follow: boolean): TCResponse;

  /**
   * List the users who follow you.
   */
  @rpc("profile.listfollowers")
  listFollowers(): ListFollowersResponse;

  /**
   * List the users you follow (your subscriptions).
   */
  @rpc("profile.listfollows")
  listFollows(): ListFollowsResponse;
}
