import "../lib/main.tsp";

namespace Pecans;

model DashboardQuestion {
  id: safeint;

  /** Unix time the question was asked. */
  time: safeint;

  /** First line(s) of the question body. */
  preview: string;
}

model DashboardResponse extends TCResponse {
  /** The most recently asked questions across the site. */
  recentQuestions: DashboardQuestion[];
}

interface Dashboard {
  /**
   * Fetch the home dashboard summary, currently the most recent questions.
   *
   * @returns The recent-questions summary.
   */
  @rpc("legacy.dashboard")
  get(): DashboardResponse;
}
