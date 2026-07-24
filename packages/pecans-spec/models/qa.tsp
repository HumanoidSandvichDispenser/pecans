import "../lib/main.tsp";

namespace Pecans;

model PinnedQuestion {
  id: safeint;

  /** First line(s) of the question body. */
  preview: string;

  /** Unix time the question was asked. */
  time: safeint;
}

model QaGetPinnedResponse extends TCResponse {
  /** The questions the user has pinned to their profile. */
  pinned: PinnedQuestion[];
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
