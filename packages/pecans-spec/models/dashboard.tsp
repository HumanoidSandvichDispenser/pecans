import "../lib/main.tsp";

namespace Pecans;

model DashboardQuestion {
  id: safeint;

  /** Unix time the question was asked. */
  time: safeint;

  /** First line(s) of the question body. */
  preview: string;
}

/** The forum category a recent post belongs to. */
model DashboardForumCategory {
  /** Category slug, e.g. `games`. */
  key: string;

  /** Human-readable category name. */
  name: string;

  /** Relative path to the category, e.g. `/forum/games`. */
  url: string;
}

/** The thread a recent post belongs to. */
model DashboardForumThread {
  /** Thread title. */
  name: string;

  /** Relative path to the thread, e.g. `/forum/games/5753`. */
  url: string;
}

/** A recent forum post shown on the dashboard. */
model DashboardForumPost {
  id: safeint;

  /** First line(s) of the post body. */
  preview: string;

  /** Relative path that jumps to the post, e.g. `/forum/games/gotopost/1347214/#post1347214`. */
  url: string;

  /** Username of the post's author. */
  user: string;

  /** The thread the post was made in. */
  thread: DashboardForumThread;

  /** The category the post's thread lives in. */
  category: DashboardForumCategory;
}

/** Site-wide vanity counters shown on the dashboard. */
model DashboardPointlessNums {
  /** Total number of registered users. */
  usersRegistered: safeint;

  /** Total number of questions and answers ever posted. */
  questionsAndAnswers: safeint;
}

model DashboardResponse extends TCResponse {
  /** The most recently asked questions across the site. */
  recentQuestions: DashboardQuestion[];

  /** The most recent forum posts across the site. */
  recentForumPosts: DashboardForumPost[];

  /** Site-wide vanity counters. */
  pointlessNums: DashboardPointlessNums;
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
