import "../lib/main.tsp";

namespace Pecans;

model QaGetPinnedResponse extends TCResponse {
  /** The questions the user has pinned to their profile. */
  pinned: unknown[];
}

interface Qa {
  /**
   * List the questions a user has pinned to their profile.
   *
   * @param profileId Username whose pinned questions to fetch.
   * @returns The user's pinned questions.
   */
  @rpc("qa.getpinned")
  getPinned(profileId: string): QaGetPinnedResponse;
}
